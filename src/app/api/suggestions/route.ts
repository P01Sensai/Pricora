import { NextRequest, NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
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

  return NextResponse.json({ suggestions });
}
