import { supabase } from "./supabase";
import type { Product, StoreListing, PriceHistory } from "./types";

/**
 * Search products by title (uses ilike for partial matching).
 * Falls back to mock data when the database is empty.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      store_listings(
        *,
        store:stores(*)
      )
    `)
    .ilike("title", `%${query}%`)
    .eq("status", "active")
    .order("title")
    .limit(20);

  if (error) {
    console.error("[searchProducts]", error.message);
    return [];
  }

  // If no live data yet, return mock results so the UI is demonstrable
  if (!data || data.length === 0) {
    return getMockProducts(query);
  }

  return data as Product[];
}

/**
 * Fetch a single product by slug, including its store listings and price history.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      store_listings(
        *,
        store:stores(*),
        price_history(*)
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) {
    console.error("[getProductBySlug]", error?.message);
    // Return a mock product for demonstration
    return getMockProductBySlug(slug);
  }

  return data as Product;
}

/**
 * Fetch price history for a specific store listing.
 */
export async function getPriceHistory(listingId: string): Promise<PriceHistory[]> {
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("listing_id", listingId)
    .order("recorded_at", { ascending: true })
    .limit(90);

  if (error) {
    console.error("[getPriceHistory]", error.message);
    return [];
  }

  return (data ?? []) as PriceHistory[];
}

// =====================================================================
// MOCK DATA — powers the UI until real store APIs are connected
// =====================================================================

const MOCK_STORES = [
  { id: "s-amazon", name: "Amazon India", slug: "amazon", logo_url: null, base_url: "https://amazon.in", source_type: "api" as const, is_active: true },
  { id: "s-flipkart", name: "Flipkart", slug: "flipkart", logo_url: null, base_url: "https://flipkart.com", source_type: "api" as const, is_active: true },
  { id: "s-croma", name: "Croma", slug: "croma", logo_url: null, base_url: "https://croma.com", source_type: "scraper" as const, is_active: true },
];

function generateMockHistory(base: number, days: number): PriceHistory[] {
  const history: PriceHistory[] = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const jitter = (Math.random() - 0.5) * base * 0.15;
    const spike = i % 14 === 0 ? base * 0.08 : 0;
    history.push({
      id: days - i,
      listing_id: "mock",
      price: Math.round(base + jitter + spike),
      in_stock: Math.random() > 0.05,
      recorded_at: new Date(now - i * 86400000).toISOString(),
    });
  }
  return history;
}

const MOCK_CATALOG: Product[] = [
  {
    id: "p-1", title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", slug: "sony-wh-1000xm5",
    brand_id: "b1", category_id: "c1", model_number: "WH-1000XM5", gtin: "4548736132610",
    image_url: "https://m.media-amazon.com/images/I/51aXvjzcukL._SX679_.jpg",
    images: null, specs: { "Driver": "30mm", "Battery": "30h", "Weight": "250g", "ANC": "Yes", "Codec": "LDAC, AAC" },
    highlights: ["Industry-leading ANC", "30-hour battery", "Multipoint connection", "Speak-to-Chat"],
    lowest_price: 2499000, lowest_price_store_id: "s-flipkart", status: "active",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    brand: { id: "b1", name: "Sony", slug: "sony" },
    category: { id: "c1", name: "Headphones", slug: "headphones", parent_id: null },
    store_listings: [
      { id: "l-1a", product_id: "p-1", store_id: "s-amazon", store_product_id: "B0BX2L8PBS", url: "https://amazon.in/dp/B0BX2L8PBS", store_title: "Sony WH-1000XM5", current_price: 2699000, mrp: 3499000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(2699000, 60) },
      { id: "l-1b", product_id: "p-1", store_id: "s-flipkart", store_product_id: "FLPK-XM5", url: "https://flipkart.com/p/itmXM5", store_title: "Sony WH-1000XM5", current_price: 2499000, mrp: 3499000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[1], price_history: generateMockHistory(2499000, 60) },
      { id: "l-1c", product_id: "p-1", store_id: "s-croma", store_product_id: "CRMA-XM5", url: "https://croma.com/p/XM5", store_title: "Sony WH-1000XM5", current_price: 2799000, mrp: 3499000, delivery_charge: 0, in_stock: true, match_method: "model", match_confidence: 0.95, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[2], price_history: generateMockHistory(2799000, 60) },
    ],
  },
  {
    id: "p-2", title: "JBL Flip 6 Portable Bluetooth Speaker", slug: "jbl-flip-6",
    brand_id: "b2", category_id: "c2", model_number: "FLIP6", gtin: "6925281993145",
    image_url: "https://m.media-amazon.com/images/I/71V-wSGnXIL._SX679_.jpg",
    images: null, specs: { "Driver": "Racetrack", "Battery": "12h", "Weight": "550g", "IP": "IP67", "Output": "30W" },
    highlights: ["IP67 waterproof and dustproof", "12-hour playtime", "PartyBoost", "Bold sound"],
    lowest_price: 899900, lowest_price_store_id: "s-amazon", status: "active",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    brand: { id: "b2", name: "JBL", slug: "jbl" },
    category: { id: "c2", name: "Speakers", slug: "speakers", parent_id: null },
    store_listings: [
      { id: "l-2a", product_id: "p-2", store_id: "s-amazon", store_product_id: "B09GYMC4TP", url: "https://amazon.in/dp/B09GYMC4TP", store_title: "JBL Flip 6", current_price: 899900, mrp: 1299900, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(899900, 60) },
      { id: "l-2b", product_id: "p-2", store_id: "s-flipkart", store_product_id: "FLPK-FLIP6", url: "https://flipkart.com/p/itmFLIP6", store_title: "JBL Flip 6", current_price: 949900, mrp: 1299900, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[1], price_history: generateMockHistory(949900, 60) },
      { id: "l-2c", product_id: "p-2", store_id: "s-croma", store_product_id: "CRMA-FLIP6", url: "https://croma.com/p/FLIP6", store_title: "JBL Flip 6", current_price: 999900, mrp: 1299900, delivery_charge: 0, in_stock: false, match_method: "model", match_confidence: 0.95, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[2], price_history: generateMockHistory(999900, 60) },
    ],
  },
  {
    id: "p-3", title: "Samsung Galaxy Buds2 Pro True Wireless Earbuds", slug: "samsung-galaxy-buds2-pro",
    brand_id: "b3", category_id: "c3", model_number: "SM-R510", gtin: "8806094539455",
    image_url: "https://m.media-amazon.com/images/I/61Qqg+T5LoL._SX679_.jpg",
    images: null, specs: { "Driver": "Coaxial 2-way", "Battery": "5h + 13h case", "Weight": "5.5g per bud", "ANC": "Yes", "Codec": "SSC, AAC" },
    highlights: ["360 Audio", "Intelligent ANC", "HD Voice", "IPX7 water resistant"],
    lowest_price: 1199000, lowest_price_store_id: "s-flipkart", status: "active",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    brand: { id: "b3", name: "Samsung", slug: "samsung" },
    category: { id: "c3", name: "Earbuds", slug: "earbuds", parent_id: null },
    store_listings: [
      { id: "l-3a", product_id: "p-3", store_id: "s-amazon", store_product_id: "B0B9XMN3W7", url: "https://amazon.in/dp/B0B9XMN3W7", store_title: "Galaxy Buds2 Pro", current_price: 1299000, mrp: 1799900, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(1299000, 60) },
      { id: "l-3b", product_id: "p-3", store_id: "s-flipkart", store_product_id: "FLPK-BUDS2P", url: "https://flipkart.com/p/itmBUDS2P", store_title: "Galaxy Buds2 Pro", current_price: 1199000, mrp: 1799900, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[1], price_history: generateMockHistory(1199000, 60) },
      { id: "l-3c", product_id: "p-3", store_id: "s-croma", store_product_id: "CRMA-BUDS2P", url: "https://croma.com/p/BUDS2P", store_title: "Galaxy Buds2 Pro", current_price: 1399000, mrp: 1799900, delivery_charge: 0, in_stock: true, match_method: "model", match_confidence: 0.95, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[2], price_history: generateMockHistory(1399000, 60) },
    ],
  },
  {
    id: "p-4", title: "Bose QuietComfort Ultra Headphones", slug: "bose-quietcomfort-ultra",
    brand_id: "b4", category_id: "c1", model_number: "QC-ULTRA", gtin: "0017817907064",
    image_url: "https://m.media-amazon.com/images/I/51VhfO+czjL._SX679_.jpg",
    images: null, specs: { "Driver": "TriPort", "Battery": "24h", "Weight": "250g", "ANC": "Yes", "Codec": "aptX Adaptive" },
    highlights: ["Immersive Audio", "CustomTune technology", "Quiet & Aware modes", "Luxe materials"],
    lowest_price: 2999000, lowest_price_store_id: "s-amazon", status: "active",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    brand: { id: "b4", name: "Bose", slug: "bose" },
    category: { id: "c1", name: "Headphones", slug: "headphones", parent_id: null },
    store_listings: [
      { id: "l-4a", product_id: "p-4", store_id: "s-amazon", store_product_id: "B0CCZ1L489", url: "https://amazon.in/dp/B0CCZ1L489", store_title: "Bose QC Ultra", current_price: 2999000, mrp: 3999000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(2999000, 60) },
      { id: "l-4b", product_id: "p-4", store_id: "s-flipkart", store_product_id: "FLPK-QCULTRA", url: "https://flipkart.com/p/itmQCULTRA", store_title: "Bose QC Ultra", current_price: 3199000, mrp: 3999000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[1], price_history: generateMockHistory(3199000, 60) },
      { id: "l-4c", product_id: "p-4", store_id: "s-croma", store_product_id: "CRMA-QCULTRA", url: "https://croma.com/p/QCULTRA", store_title: "Bose QC Ultra", current_price: 3099000, mrp: 3999000, delivery_charge: 0, in_stock: false, match_method: "model", match_confidence: 0.95, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[2], price_history: generateMockHistory(3099000, 60) },
    ],
  },
];

function getMockProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return MOCK_CATALOG.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand?.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
  );
}

function getMockProductBySlug(slug: string): Product | null {
  return MOCK_CATALOG.find((p) => p.slug === slug) ?? null;
}
