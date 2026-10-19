import { StoreConnector, NormalizedProduct } from './index';
import { scrapeFlipkartLive } from '../scrapers/engine';

export class FlipkartConnector implements StoreConnector {
  storeId = 'flipkart';
  name = 'Flipkart';

  async search(query: string): Promise<NormalizedProduct[]> {
    return scrapeFlipkartLive(query, 15);
  }

  async fetchProduct(id: string): Promise<NormalizedProduct | null> {
    const results = await scrapeFlipkartLive(id, 1);
    return results[0] ?? null;
  }
}
