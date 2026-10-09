import { StoreConnector, NormalizedProduct } from './index';

export class AmazonConnector implements StoreConnector {
  storeId = 'amazon'; // In reality, this would map to the UUID in the DB
  name = 'Amazon India';

  async search(query: string): Promise<NormalizedProduct[]> {
    console.log(`[Amazon] Searching for: ${query}`);
    // Mock response until PA-API keys are provided
    return [
      {
        storeProductId: 'B0CHX1W3S2',
        url: 'https://amazon.in/dp/B0CHX1W3S2',
        title: `Amazon Mock Product for ${query}`,
        brand: 'MockBrand',
        image: 'https://via.placeholder.com/150',
        currentPrice: 199900, // ₹1,999.00
        mrp: 299900,
        deliveryCharge: 0,
        inStock: true,
      }
    ];
  }

  async fetchProduct(id: string): Promise<NormalizedProduct | null> {
    console.log(`[Amazon] Fetching product: ${id}`);
    // Mock response
    return {
      storeProductId: id,
      url: `https://amazon.in/dp/${id}`,
      title: 'Amazon Mock Product',
      brand: 'MockBrand',
      image: 'https://via.placeholder.com/150',
      currentPrice: 199900,
      mrp: 299900,
      deliveryCharge: 0,
      inStock: true,
    };
  }
}
