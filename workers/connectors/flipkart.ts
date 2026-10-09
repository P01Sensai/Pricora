import { StoreConnector, NormalizedProduct } from './index';

export class FlipkartConnector implements StoreConnector {
  storeId = 'flipkart'; 
  name = 'Flipkart';

  async search(query: string): Promise<NormalizedProduct[]> {
    console.log(`[Flipkart] Searching for: ${query}`);
    return [
      {
        storeProductId: 'FLPK123456',
        url: 'https://flipkart.com/p/itmFLPK123456',
        title: `Flipkart Mock Product for ${query}`,
        brand: 'MockBrand',
        image: 'https://via.placeholder.com/150',
        currentPrice: 189900, // ₹1,899.00
        mrp: 299900,
        deliveryCharge: 4000, // ₹40.00
        inStock: true,
      }
    ];
  }

  async fetchProduct(id: string): Promise<NormalizedProduct | null> {
    console.log(`[Flipkart] Fetching product: ${id}`);
    return {
      storeProductId: id,
      url: `https://flipkart.com/p/itm${id}`,
      title: 'Flipkart Mock Product',
      brand: 'MockBrand',
      image: 'https://via.placeholder.com/150',
      currentPrice: 189900,
      mrp: 299900,
      deliveryCharge: 4000,
      inStock: true,
    };
  }
}
