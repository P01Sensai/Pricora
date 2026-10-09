export interface NormalizedProduct {
  storeProductId: string;
  url: string;
  title: string;
  brand: string;
  modelNumber?: string;
  gtin?: string;
  image: string;
  currentPrice: number; // In paise
  mrp: number; // In paise
  deliveryCharge: number; // In paise
  inStock: boolean;
}

export interface StoreConnector {
  storeId: string;
  name: string;
  
  /**
   * Search the store for a given query and return a list of normalized products.
   */
  search(query: string): Promise<NormalizedProduct[]>;

  /**
   * Fetch a specific product by its store ID to get the latest price.
   */
  fetchProduct(id: string): Promise<NormalizedProduct | null>;
}
