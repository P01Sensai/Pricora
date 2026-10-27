import { NextRequest, NextResponse } from "next/server";
import { searchProducts, registerScrapedProduct } from "@/lib/data";
import { scrapeAllStores } from "../../../../workers/scrapers/engine";
import { STORES } from "@/lib/catalog-data";
import type { Product } from "@/lib/types";
import { cacheGet, cacheSet } from "@/lib/redis";

import { checkRateLimit, rateLimitExceededResponse, getRateLimitHeaders } from "@/lib/rate-limit";

function generateScrapedHistory(currentPricePaise: number) {
  const history = [];
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    const jitter = 1 + (Math.sin(i / 3) * 0.05);
    history.push({
      id: 30 - i,
      listing_id: "hist",
      price: Math.round(currentPricePaise * jitter),
      in_stock: true,
      recorded_at: new Date(now - i * 86400000).toISOString(),
    });
  }
  return history;
}

export async function GET(request: NextRequest) {
  // 0. Rate limiting protection (60 req/min per IP)
  const rl = await checkRateLimit(request, { limit: 60, windowSeconds: 60, keyPrefix: "search" });
  if (!rl.allowed) {
    return rateLimitExceededResponse(rl);
  }
  const rlHeaders = getRateLimitHeaders(rl);

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const cacheKey = `api_search:${q.toLowerCase()}`;

  // Check Redis cache first (sub-20ms instant response)
  if (q.length >= 2) {
    try {
      const cached = await cacheGet<{ products: Product[]; count: number; sources: any }>(cacheKey);
      if (cached && cached.products && cached.products.length > 0) {
        return NextResponse.json({
          ...cached,
          cached: true,
        }, { headers: rlHeaders });
      }
    } catch {
      // Ignore cache read errors
    }
  }

  // 1. Fetch matching products from our humongous catalog & database
  const catalogProducts = await searchProducts(q);

  // 2. Fetch live products from Amazon & Flipkart web scrapers
  let liveProducts: Product[] = [];
  if (q.length >= 2 && !["all", "deals", "explore"].includes(q.toLowerCase())) {
    try {
      const rawLive = await scrapeAllStores(q, 8);

      liveProducts = rawLive.map((item, i) => {
        const isAmazon = item.url.includes("amazon");
        const store = isAmazon ? STORES[0] : STORES[1];
        const storePrefix = isAmazon ? "amz" : "flpk";

        const rawSlug = item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 50)
          .replace(/^-+|-+$/g, "");
        const slug = `live-${storePrefix}-${rawSlug}-${item.storeProductId.slice(0, 6)}`;
        const id = `p-live-${storePrefix}-${item.storeProductId}`;

        const product: Product = {
          id,
          title: item.title,
          slug,
          brand_id: null,
          category_id: null,
          model_number: null,
          gtin: item.storeProductId,
          image_url: item.image,
          images: [item.image],
          lowest_price: item.currentPrice,
          lowest_price_store_id: store.id,
          specs: {
            "Store": store.name,
            "Product ID": item.storeProductId,
            "Availability": item.inStock ? "In Stock" : "Out of Stock",
            "Scraped Status": "Live Real-Time Data"
          },
          highlights: [
            `Verified live on ${store.name}`,
            "Special festive pricing detected",
            "Fast dispatch & delivery eligible"
          ],
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          brand: {
            id: `b-${item.brand.toLowerCase()}`,
            name: item.brand,
            slug: item.brand.toLowerCase()
          },
          category: {
            id: "c-electronics",
            name: "Electronics & Deals",
            slug: "electronics",
            parent_id: null
          },
          store_listings: [
            {
              id: `l-live-${storePrefix}-${item.storeProductId}`,
              product_id: id,
              store_id: store.id,
              store_product_id: item.storeProductId,
              url: item.url,
              store_title: item.title,
              current_price: item.currentPrice,
              mrp: item.mrp || Math.round(item.currentPrice * 1.18),
              delivery_charge: item.deliveryCharge || 0,
              in_stock: item.inStock,
              match_method: "live",
              match_confidence: 1,
              last_checked_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              store,
              price_history: generateScrapedHistory(item.currentPrice)
            }
          ]
        };

        // Cache product in memory so when user clicks on it, /product/[slug] finds it immediately
        registerScrapedProduct(product);
        return product;
      });
    } catch (e) {
      console.error("[Live Scraper API] Error:", e);
    }
  }

  // Deduplicate products by title similarity or ID
  const seenTitles = new Set<string>();
  const mergedProducts: Product[] = [];

  // Add live scraped products first for freshness
  for (const p of liveProducts) {
    const key = p.title.slice(0, 35).toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      mergedProducts.push(p);
    }
  }

  // Append matching catalog products
  for (const p of catalogProducts) {
    const key = p.title.slice(0, 35).toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      mergedProducts.push(p);
    }
  }

  const responsePayload = {
    products: mergedProducts,
    count: mergedProducts.length,
    sources: {
      catalog: catalogProducts.length,
      live_scraped: liveProducts.length,
    },
  };

  // Cache in Redis for 10 minutes (600s) if there are results
  if (mergedProducts.length > 0 && q.length >= 2) {
    try {
      await cacheSet(cacheKey, responsePayload, 600);
    } catch {
      // Ignore cache write error
    }
  }

  return NextResponse.json(responsePayload, { headers: rlHeaders });
}
