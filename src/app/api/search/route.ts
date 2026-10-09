import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const products = await searchProducts(q);
  return NextResponse.json({ products, count: products.length });
}
