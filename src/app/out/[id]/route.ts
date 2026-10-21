import { NextRequest, NextResponse } from "next/server";
import { getListingById, recordClickEvent } from "@/lib/data";
import { buildAffiliateUrl } from "@/lib/affiliate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing || !listing.url) {
    // If invalid listing ID, redirect back to search safely
    return NextResponse.redirect(new URL("/search", request.url), 307);
  }

  // Extract user agent and referrer for click tracking
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const referrer = request.headers.get("referer") ?? undefined;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  // Record click event non-blockingly
  await recordClickEvent(listing, { userAgent, referrer, ip });

  // Generate affiliate-tagged destination URL
  const destinationUrl = buildAffiliateUrl(listing.url, listing.store?.slug ?? "");

  console.log(`[Affiliate Click] Redirecting to ${listing.store?.name ?? 'Store'}: ${destinationUrl}`);

  return NextResponse.redirect(destinationUrl, 307);
}
