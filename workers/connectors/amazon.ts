import { StoreConnector, NormalizedProduct } from './index';
import { scrapeAmazonLive } from '../scrapers/engine';

export class AmazonConnector implements StoreConnector {
  storeId = 'amazon';
  name = 'Amazon India';

  async search(query: string): Promise<NormalizedProduct[]> {
    return scrapeAmazonLive(query, 15);
  }

  async fetchProduct(id: string): Promise<NormalizedProduct | null> {
    const results = await scrapeAmazonLive(id, 1);
    return results[0] ?? null;
  }
}
