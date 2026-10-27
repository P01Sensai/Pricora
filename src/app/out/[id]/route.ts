import { NextRequest, NextResponse } from "next/server";
import { getListingById, recordClickEvent } from "@/lib/data";
import { buildAffiliateUrl, isAllowedStoreUrl } from "@/lib/affiliate";

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

  // Security: Verify destination URL belongs to an allowed merchant domain
  if (!isAllowedStoreUrl(listing.url)) {
    console.warn(`[Security Alert] Blocked suspicious outbound redirect to: ${listing.url}`);
    return NextResponse.redirect(new URL("/search?error=unauthorized_destination", request.url), 307);
  }

  // Extract user agent and referrer for click tracking
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const referrer = request.headers.get("referer") ?? undefined;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  // Non-blocking click event tracking (fire-and-forget to avoid redirect delay)
  recordClickEvent(listing, { userAgent, referrer, ip }).catch((err) => {
    console.error("[Affiliate Click Tracking Error]", err);
  });

  // Generate affiliate-tagged destination URL
  const destinationUrl = buildAffiliateUrl(listing.url, listing.store?.slug ?? "");

  return NextResponse.redirect(destinationUrl, 307);
}
