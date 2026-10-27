import { NextRequest, NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/data";
import { checkRateLimit, rateLimitExceededResponse, getRateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limiting protection (120 req/min per IP)
  const rl = await checkRateLimit(request, { limit: 120, windowSeconds: 60, keyPrefix: "suggestions" });
  if (!rl.allowed) {
    return rateLimitExceededResponse(rl);
  }
  const rlHeaders = getRateLimitHeaders(rl);

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] }, { headers: rlHeaders });
  }

  // Get matching items from local catalog + cache
  const matches = getCatalogProducts(q);

  const suggestions = matches.slice(0, 6).map((p) => {
    const storeCount = p.store_listings?.filter(l => l.in_stock).length ?? 0;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      brand: p.brand?.name ?? "Brand",
      category: p.category?.name ?? "Deals",
      image_url: p.image_url,
      lowest_price: p.lowest_price,
      store_count: storeCount,
    };
  });

  return NextResponse.json({ suggestions }, { headers: rlHeaders });
}
