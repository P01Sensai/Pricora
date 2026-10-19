import * as cheerio from "cheerio";
import { NormalizedProduct } from "../connectors";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0"
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Fast HTTP Scraper for Amazon India
 */
export async function scrapeAmazonLive(query: string, limit = 15): Promise<NormalizedProduct[]> {
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      next: { revalidate: 300 } // Cache in Next.js for 5 minutes
    });

    if (!res.ok) return [];

    const html = await res.text();
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

    return results;
  } catch (err) {
    console.error("[Amazon Scraper] Error:", err);
    return [];
  }
}

/**
 * Fast HTTP Scraper for Flipkart
 */
export async function scrapeFlipkartLive(query: string, limit = 15): Promise<NormalizedProduct[]> {
  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      next: { revalidate: 300 }
    });

    if (!res.ok) return [];

    const html = await res.text();
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
        // e.g., '749009% off' -> 74900
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

    return results;
  } catch (err) {
    console.error("[Flipkart Scraper] Error:", err);
    return [];
  }
}

/**
 * Combined Humongous Scraper Engine:
 * Scrapes Amazon & Flipkart concurrently and merges results with comparison data.
 */
export async function scrapeAllStores(query: string, perStore = 15): Promise<NormalizedProduct[]> {
  const [amazonItems, flipkartItems] = await Promise.all([
    scrapeAmazonLive(query, perStore),
    scrapeFlipkartLive(query, perStore)
  ]);

  return [...amazonItems, ...flipkartItems];
}
