import { StoreConnector, NormalizedProduct } from './index';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

// @ts-ignore
chromium.use(stealth());

export class AmazonConnector implements StoreConnector {
  storeId = 'amazon';
  name = 'Amazon India';

  async search(query: string): Promise<NormalizedProduct[]> {
    console.log(`[Amazon Live] Searching for: ${query}`);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
      
      // Wait for product results to appear
      await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 5000 }).catch(() => {});

      const products = await page.$$eval('[data-component-type="s-search-result"]', (elements) => {
        return elements.slice(0, 5).map(el => {
          const titleEl = el.querySelector('h2 a span');
          const priceEl = el.querySelector('.a-price-whole');
          const imgEl = el.querySelector('img.s-image');
          const linkEl = el.querySelector('h2 a');
          const asin = el.getAttribute('data-asin') || '';

          return {
            title: titleEl?.textContent?.trim() || '',
            priceStr: priceEl?.textContent?.replace(/[,.]/g, '') || '0',
            img: imgEl?.getAttribute('src') || '',
            link: linkEl?.getAttribute('href') || '',
            asin
          };
        });
      });

      return products.filter(p => p.title && p.priceStr !== '0').map(p => ({
        storeProductId: p.asin,
        url: p.link.startsWith('http') ? p.link : `https://amazon.in${p.link}`,
        title: p.title,
        brand: 'Unknown', // Could be parsed from title
        image: p.img,
        currentPrice: parseInt(p.priceStr, 10) * 100, // in paise
        mrp: parseInt(p.priceStr, 10) * 100, // Simplification
        deliveryCharge: 0,
        inStock: true,
      }));
    } catch (e) {
      console.error("[Amazon Live] Scraping error:", e);
      return [];
    } finally {
      await browser.close();
    }
  }

  async fetchProduct(id: string): Promise<NormalizedProduct | null> {
    console.log(`[Amazon Live] Fetching product: ${id}`);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const url = `https://www.amazon.in/dp/${id}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      const title = await page.locator('#productTitle').textContent().catch(() => '') || '';
      const priceStr = await page.locator('.a-price-whole').first().textContent().catch(() => '0') || '0';
      const img = await page.locator('#landingImage').getAttribute('src').catch(() => '') || '';
      
      return {
        storeProductId: id,
        url,
        title: title.trim(),
        brand: 'Unknown',
        image: img,
        currentPrice: parseInt(priceStr.replace(/[,.]/g, ''), 10) * 100,
        mrp: parseInt(priceStr.replace(/[,.]/g, ''), 10) * 100,
        deliveryCharge: 0,
        inStock: true,
      };
    } catch (e) {
      console.error("[Amazon Live] Scraping error:", e);
      return null;
    } finally {
      await browser.close();
    }
  }
}
