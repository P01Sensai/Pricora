import * as cheerio from "cheerio";
import { NormalizedProduct } from "../connectors";
import { cacheGet, cacheSet } from "@/lib/redis";

interface BrowserProfile {
  ua: string;
  platform: string;
  isMobile: boolean;
  secChUa: string;
}

const BROWSER_PROFILES: BrowserProfile[] = [
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    platform: '"Windows"',
    isMobile: false,
    secChUa: '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  },
  {
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    platform: '"macOS"',
    isMobile: false,
    secChUa: '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  },
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    platform: '"Windows"',
    isMobile: false,
    secChUa: '"Microsoft Edge";v="123", "Chromium";v="123", "Not-A.Brand";v="99"',
  },
  {
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    platform: '"macOS"',
    isMobile: false,
    secChUa: '"Safari";v="17", "Not-A.Brand";v="99"',
  },
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    platform: '"Windows"',
    isMobile: false,
    secChUa: '"Firefox";v="125"',
  },
  {
    ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36",
    platform: '"Android"',
    isMobile: true,
    secChUa: '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  },
];

function getRandomProfile(): BrowserProfile {
  return BROWSER_PROFILES[Math.floor(Math.random() * BROWSER_PROFILES.length)];
}

function buildHeaders(profile: BrowserProfile): Record<string, string> {
  return {
    "User-Agent": profile.ua,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "max-age=0",
    "Sec-Ch-Ua": profile.secChUa,
    "Sec-Ch-Ua-Mobile": profile.isMobile ? "?1" : "?0",
    "Sec-Ch-Ua-Platform": profile.platform,
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  };
}

const CACHE_TTL_SECONDS = 600; // 10 minutes distributed TTL

/**
 * Resilient fetch with timeout and 1-time retry with backoff on failure
 */
async function resilientFetch(url: string, timeoutMs = 8000): Promise<string | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const profile = getRandomProfile();
    try {
      const res = await fetch(url, {
        headers: buildHeaders(profile),
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok) {
        return await res.text();
      }

      // If blocked (429 or 503) and we have an attempt remaining, wait & retry
      if ((res.status === 429 || res.status === 503 || res.status === 403) && attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));
        continue;
      }

      return null;
    } catch {
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }
  return null;
}

/**
 * Fast Resilient HTTP Scraper for Amazon India
 */
export async function scrapeAmazonLive(query: string, limit = 15): Promise<NormalizedProduct[]> {
  const cacheKey = `scrape:amz:${query.toLowerCase().trim()}:${limit}`;

  // Check shared Redis / memory cache
  const cached = await cacheGet<NormalizedProduct[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  try {
    const html = await resilientFetch(url, 8000);
    if (!html) return [];

    const $ = cheerio.load(html);
    const results: NormalizedProduct[] = [];

    $('[data-asin]').each((_, el) => {
      if (results.length >= limit) return;
      const asin = $(el).attr('data-asin');
      if (!asin || asin.length < 5) return;

      const title = $(el).find('h2').text().trim() || $(el).find('.a-text-normal').text().trim();
      const priceStr = $(el).find('.a-price-whole').first().text().replace(/[,.]/g, '').trim();
      const mrpStr = $(el).find('.a-price.a-text-price span[aria-hidden="true"]').first().text().replace(/[^0-9]/g, '').trim();
      const img = $(el).find('img.s-image').attr('src');
      const href = $(el).find('h2 a').attr('href') || $(el).find('a.a-link-normal').attr('href');

      if (title && priceStr) {
        const currentPriceNum = parseInt(priceStr, 10);
        if (isNaN(currentPriceNum) || currentPriceNum <= 0) return;

        const mrpNum = mrpStr ? parseInt(mrpStr, 10) : Math.round(currentPriceNum * 1.15);

        results.push({
          storeProductId: asin,
          url: href ? (href.startsWith('http') ? href : `https://www.amazon.in${href}`) : `https://www.amazon.in/dp/${asin}`,
          title: title.replace(/\s+/g, ' '),
          brand: title.split(' ')[0] || 'Unknown',
          image: img || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
          currentPrice: currentPriceNum * 100, // paise
          mrp: mrpNum * 100, // paise
          deliveryCharge: 0,
          inStock: true
        });
      }
    });

    if (results.length > 0) {
      await cacheSet(cacheKey, results, CACHE_TTL_SECONDS);
    }
    return results;
  } catch (err) {
    console.error("[Amazon Scraper] Error:", err);
    return [];
  }
}

/**
 * Fast Resilient HTTP Scraper for Flipkart
 */
export async function scrapeFlipkartLive(query: string, limit = 15): Promise<NormalizedProduct[]> {
  const cacheKey = `scrape:flpk:${query.toLowerCase().trim()}:${limit}`;

  // Check shared Redis / memory cache
  const cached = await cacheGet<NormalizedProduct[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
  try {
    const html = await resilientFetch(url, 8000);
    if (!html) return [];

    const $ = cheerio.load(html);
    const results: NormalizedProduct[] = [];

    $('[data-id]').each((_, el) => {
      if (results.length >= limit) return;
      const dataId = $(el).attr('data-id');
      if (!dataId) return;

      const title = $(el).find('div.KzDlHZ').text().trim() ||
                    $(el).find('a.wjcEIp').text().trim() ||
                    $(el).find('img').attr('alt') ||
                    $(el).find('a[title]').attr('title');

      const cardText = $(el).text();
      // Extract prices matching ₹XX,XXX (cleanly separating any trailing % discount)
      const cleanPrices: number[] = [];
      const matches = cardText.matchAll(/₹([0-9,]+)/g);
      for (const m of matches) {
        let rawNumStr = m[1].replace(/,/g, '');
        // If the number ends with a single digit followed immediately by '% off'
        if (cardText.includes(m[0] + '%') || cardText.includes(rawNumStr + '%')) {
          rawNumStr = rawNumStr.slice(0, -1);
        }
        const val = parseInt(rawNumStr, 10);
        if (!isNaN(val) && val > 100) {
          cleanPrices.push(val);
        }
      }

      if (!title || cleanPrices.length === 0) return;

      const currentPriceNum = cleanPrices[0];
      let mrpNum = cleanPrices.length > 1 && cleanPrices[1] >= currentPriceNum 
        ? cleanPrices[1] 
        : Math.round(currentPriceNum * 1.15);

      // If Flipkart attached the discount digit to MRP (e.g. 749009 for 74900)
      if (mrpNum > currentPriceNum * 2.5 && mrpNum > 100000 && currentPriceNum < 100000) {
        mrpNum = Math.floor(mrpNum / 10);
      }

      const img = $(el).find('img').attr('src') || $(el).find('img.UCc1lI').attr('src');
      const href = $(el).find('a[href*="/p/"]').attr('href') || $(el).find('a[href^="/"]').attr('href');

      results.push({
        storeProductId: dataId,
        url: href ? (href.startsWith('http') ? href : `https://www.flipkart.com${href}`) : `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
        title: title.replace(/\s+/g, ' '),
        brand: title.split(' ')[0] || 'Unknown',
        image: img || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        currentPrice: currentPriceNum * 100, // paise
        mrp: mrpNum * 100, // paise
        deliveryCharge: 0,
        inStock: true
      });
    });

    if (results.length > 0) {
      await cacheSet(cacheKey, results, CACHE_TTL_SECONDS);
    }
    return results;
  } catch (err) {
    console.error("[Flipkart Scraper] Error:", err);
    return [];
  }
}

/**
 * Resilient multi-store scraper:
 * Runs Amazon & Flipkart concurrently with Promise.allSettled so if one store is delayed or throttled,
 * the other still resolves cleanly.
 */
export async function scrapeAllStores(query: string, perStore = 15): Promise<NormalizedProduct[]> {
  const [amazonSettled, flipkartSettled] = await Promise.allSettled([
    scrapeAmazonLive(query, perStore),
    scrapeFlipkartLive(query, perStore),
  ]);

  const amazonItems = amazonSettled.status === "fulfilled" ? amazonSettled.value : [];
  const flipkartItems = flipkartSettled.status === "fulfilled" ? flipkartSettled.value : [];

  return [...amazonItems, ...flipkartItems];
}
