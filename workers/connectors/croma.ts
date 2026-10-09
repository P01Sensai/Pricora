import { StoreConnector, NormalizedProduct } from './index';

export class CromaConnector implements StoreConnector {
  storeId = 'croma'; 
  name = 'Croma';

  async search(query: string): Promise<NormalizedProduct[]> {
    console.log(`[Croma] Searching for: ${query}`);
    return [
      {
        storeProductId: 'CRMA7890',
        url: 'https://croma.com/p/CRMA7890',
        title: `Croma Mock Product for ${query}`,
        brand: 'MockBrand',
        image: 'https://via.placeholder.com/150',
        currentPrice: 209900, // ₹2,099.00
        mrp: 309900,
        deliveryCharge: 0,
        inStock: true,
      }
    ];
  }

  async fetchProduct(id: string): Promise<NormalizedProduct | null> {
    console.log(`[Croma] Fetching product: ${id}`);
    return {
      storeProductId: id,
      url: `https://croma.com/p/${id}`,
      title: 'Croma Mock Product',
      brand: 'MockBrand',
      image: 'https://via.placeholder.com/150',
      currentPrice: 209900,
      mrp: 309900,
      deliveryCharge: 0,
      inStock: true,
    };
  }
}
