/**
 * Type definitions for Pricora's database schema.
 * These mirror the tables in database/schema.sql.
 */

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  base_url: string;
  source_type: "api" | "feed" | "scraper";
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  model_number: string | null;
  gtin: string | null;
  image_url: string | null;
  images: string[] | null;
  specs: Record<string, string> | null;
  highlights: string[] | null;
  lowest_price: number | null;
  lowest_price_store_id: string | null;
  status: "active" | "hidden" | "merged";
  created_at: string;
  updated_at: string;
  // Joined fields
  brand?: Brand;
  category?: Category;
  store_listings?: StoreListing[];
}

export interface StoreListing {
  id: string;
  product_id: string;
  store_id: string;
  store_product_id: string;
  url: string;
  store_title: string;
  current_price: number | null;
  mrp: number | null;
  delivery_charge: number | null;
  in_stock: boolean;
  match_method: "gtin" | "model" | "fuzzy" | "manual" | null;
  match_confidence: number | null;
  last_checked_at: string | null;
  created_at: string;
  // Joined fields
  store?: Store;
  price_history?: PriceHistory[];
}

export interface PriceHistory {
  id: number;
  listing_id: string;
  price: number;
  in_stock: boolean;
  recorded_at: string;
}

export interface DealScore {
  product_id: string;
  score: number;
  verdict: "Great deal" | "Good deal" | "Fair" | "Wait";
  breakdown: Record<string, number> | null;
  calculated_at: string;
}
