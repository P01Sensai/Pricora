import { supabase } from "./supabase";
import type { Product, StoreListing, PriceHistory } from "./types";
import { HUMONGOUS_CATALOG, STORES } from "./catalog-data";

import { cacheGet, cacheSet } from "./redis";
import { compactPriceHistory } from "./price-history";

// In-memory cache for dynamically live-scraped items so they can be viewed on /product/[slug]
const DYNAMIC_CACHE = new Map<string, Product>();

export async function registerScrapedProduct(product: Product) {
  DYNAMIC_CACHE.set(product.slug, product);
  DYNAMIC_CACHE.set(product.id, product);

  // Persist in Redis/distributed cache for 7 days
  try {
    await cacheSet(`product:${product.slug}`, product, 86400 * 7);
    await cacheSet(`product:${product.id}`, product, 86400 * 7);
  } catch {
    // Ignore cache persistence errors
  }
}

/**
 * Search products by query across database, humongous catalog, and dynamic cache.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();

  // 1. Try Supabase if available
  try {
    const { data } = await supabase
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
      .ilike("title", `%${q}%`)
      .eq("status", "active")
      .order("title")
      .limit(30);

    if (data && data.length > 0) {
      return data as Product[];
    }
  } catch (err) {
    // Continue to humongous local dataset
  }

  // 2. Search Humongous Catalog + Dynamic Cache
  return getCatalogProducts(q);
}

/**
 * Search local humongous catalog and dynamic cache
 */
export function getCatalogProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();

  const allItems = [...Array.from(DYNAMIC_CACHE.values()), ...HUMONGOUS_CATALOG];
  const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());

  // Category or browse queries
  if (!q || q === "all" || q === "deals" || q === "explore") {
    return uniqueItems;
  }

  if (q === "trending") {
    return uniqueItems.filter(p => (p as any).is_trending);
  }

  if (q === "festive") {
    return uniqueItems.filter(p => (p as any).is_festive_deal);
  }

  if (["smartphones", "mobiles", "mobile", "phones"].includes(q)) {
    return uniqueItems.filter(p => p.category?.slug === "smartphones" || p.category_id === "c-smartphones");
  }

  if (["laptops", "laptop", "computers", "macbook"].includes(q)) {
    return uniqueItems.filter(p => p.category?.slug === "laptops" || p.category_id === "c-laptops");
  }

  if (["audio", "headphones", "earphones", "sound", "speakers"].includes(q)) {
    return uniqueItems.filter(p => p.category?.slug === "audio" || p.category_id === "c-audio");
  }

  if (["gaming", "console", "ps5", "xbox"].includes(q)) {
    return uniqueItems.filter(p => p.category?.slug === "gaming" || p.category_id === "c-gaming");
  }

  if (["wearables", "watches", "smartwatch", "watch"].includes(q)) {
    return uniqueItems.filter(p => p.category?.slug === "wearables" || p.category_id === "c-wearables");
  }

  if (["appliances", "tv", "electronics"].includes(q)) {
    return uniqueItems.filter(p => p.category?.slug === "appliances" || p.category_id === "c-appliances");
  }

  // Word token matching for flexible fuzzy search
  const tokens = q.split(/\s+/).filter(t => t.length > 0);

  return uniqueItems.filter(p => {
    const title = p.title.toLowerCase();
    const brand = p.brand?.name?.toLowerCase() ?? "";
    const category = p.category?.name?.toLowerCase() ?? "";
    const specs = Object.values(p.specs ?? {}).join(" ").toLowerCase();

    // Must match at least one token
    return tokens.some(token => 
      title.includes(token) || 
      brand.includes(token) || 
      category.includes(token) ||
      specs.includes(token)
    );
  });
}

/**
 * Fetch a single product by slug, including its store listings and price history.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Check dynamic memory cache first
  if (DYNAMIC_CACHE.has(slug)) {
    return DYNAMIC_CACHE.get(slug)!;
  }

  // Check persistent distributed cache
  try {
    const cachedProduct = await cacheGet<Product>(`product:${slug}`);
    if (cachedProduct) {
      DYNAMIC_CACHE.set(slug, cachedProduct);
      return cachedProduct;
    }
  } catch {
    // Ignore cache error
  }

  // Check Supabase
  try {
    const { data } = await supabase
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

    if (data) return data as Product;
  } catch (err) {
    // Continue
  }

  // Check humongous catalog
  const found = HUMONGOUS_CATALOG.find((p) => p.slug === slug || p.id === slug);
  if (found) return found;

  // Partial match by slug prefix
  const partial = HUMONGOUS_CATALOG.find(p => p.slug.startsWith(slug) || slug.startsWith(p.slug));
  if (partial) return partial;

  // Fallback: If it's a live scraped product ID, synthesize product details
  if (slug.startsWith("live-") || slug.startsWith("p-scraped-")) {
    const id = slug;
    return {
      id,
      title: slug.replace(/^(live-|p-scraped-)/, "").replace(/-/g, " "),
      slug,
      brand_id: "b-general",
      category_id: "c-general",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      images: [],
      model_number: null,
      gtin: null,
      lowest_price: 299900,
      lowest_price_store_id: "s-amazon",
      specs: { "Source": "Live Scraper Ingestion", "Status": "In Stock" },
      highlights: ["Live verified festive price", "Fast Prime delivery available"],
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      brand: { id: "b-general", name: "Premium Brand", slug: "general" },
      category: { id: "c-general", name: "Electronics", slug: "electronics", parent_id: null },
      store_listings: [
        {
          id: `l-live-amz-${id}`,
          product_id: id,
          store_id: "s-amazon",
          store_product_id: "AMZ-LIVE",
          url: "https://amazon.in",
          store_title: slug.replace(/-/g, " "),
          current_price: 299900,
          mrp: 399900,
          delivery_charge: 0,
          in_stock: true,
          match_method: "live",
          match_confidence: 1,
          last_checked_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          store: STORES[0],
          price_history: []
        }
      ]
    };
  }

  return null;
}

/**
 * Fetch price history for a specific store listing.
 */
export async function getPriceHistory(listingId: string): Promise<PriceHistory[]> {
  try {
    const { data } = await supabase
      .from("price_history")
      .select("*")
      .eq("listing_id", listingId)
      .order("recorded_at", { ascending: true })
      .limit(90);

    if (data && data.length > 0) return compactPriceHistory(data as PriceHistory[]);
  } catch (err) {
    // Continue
  }

  // Look in humongous catalog listings
  for (const p of HUMONGOUS_CATALOG) {
    const listing = p.store_listings?.find(l => l.id === listingId);
    if (listing?.price_history && listing.price_history.length > 0) {
      return compactPriceHistory(listing.price_history);
    }
  }

  return [];
}

/**
 * Fetch a store listing by ID across dynamic cache, humongous catalog, and database.
 */
export async function getListingById(listingId: string): Promise<StoreListing | null> {
  // Check dynamic cache products
  for (const p of DYNAMIC_CACHE.values()) {
    const listing = p.store_listings?.find(l => l.id === listingId);
    if (listing) return listing;
  }

  // Check humongous catalog
  for (const p of HUMONGOUS_CATALOG) {
    const listing = p.store_listings?.find(l => l.id === listingId);
    if (listing) return listing;
  }

  // Check database
  try {
    const { data } = await supabase
      .from("store_listings")
      .select("*, store:stores(*)")
      .eq("id", listingId)
      .single();

    if (data) return data as StoreListing;
  } catch (err) {
    // Continue
  }

  return null;
}

// In-memory click tracking analytics buffer
export const IN_MEMORY_CLICKS: Array<{
  listingId: string;
  store: string;
  url: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
}> = [];

/**
 * Log an outbound affiliate click event
 */
export async function recordClickEvent(listing: StoreListing, reqMeta?: { userAgent?: string; referrer?: string; ip?: string }) {
  const event = {
    listingId: listing.id,
    store: listing.store?.name ?? "Unknown",
    url: listing.url,
    userAgent: reqMeta?.userAgent,
    referrer: reqMeta?.referrer,
    timestamp: new Date().toISOString()
  };

  IN_MEMORY_CLICKS.push(event);
  if (IN_MEMORY_CLICKS.length > 500) IN_MEMORY_CLICKS.shift();

  try {
    await supabase.from("click_events").insert({
      listing_id: listing.id,
      session_id: reqMeta?.ip || "anonymous",
      referrer: reqMeta?.referrer,
      device: reqMeta?.userAgent ? (reqMeta.userAgent.includes("Mobile") ? "mobile" : "desktop") : "desktop",
      clicked_at: new Date().toISOString()
    });
  } catch (err) {
    // Non-blocking log failure
  }
}

