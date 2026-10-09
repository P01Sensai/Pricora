import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], message: "Query must be at least 2 characters." }, { status: 400 });
  }

  const products = await searchProducts(q);
  return NextResponse.json({ products, count: products.length });
}
