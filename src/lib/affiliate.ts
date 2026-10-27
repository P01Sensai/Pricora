/**
 * Affiliate URL Generator & Tracking Helper
 * Appends affiliate tags according to store requirements.
 */

const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG || "pricora-21";
const FLIPKART_AFFID = process.env.FLIPKART_AFFILIATE_ID || "pricora";

const ALLOWED_STORE_DOMAINS = [
  "amazon.in",
  "amazon.com",
  "amzn.to",
  "amzn.in",
  "flipkart.com",
  "dl.flipkart.com",
  "croma.com",
  "tatacliq.com",
  "reliancedigital.in",
  "vijaysales.com",
];

/**
 * Validate that destination URL belongs to a recognized, trusted store domain.
 * Guards against Open Redirect and URL poisoning vulnerabilities.
 */
export function isAllowedStoreUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_STORE_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

export function buildAffiliateUrl(originalUrl: string, storeSlug: string): string {
  try {
    const url = new URL(originalUrl);

    if (storeSlug === "amazon" || url.hostname.includes("amazon.")) {
      url.searchParams.set("tag", AMAZON_TAG);
      url.searchParams.set("linkCode", "ll1");
      return url.toString();
    }

    if (storeSlug === "flipkart" || url.hostname.includes("flipkart.")) {
      url.searchParams.set("affid", FLIPKART_AFFID);
      return url.toString();
    }

    // Default for Croma and other merchants: append UTM parameters
    url.searchParams.set("utm_source", "pricora");
    url.searchParams.set("utm_medium", "price_comparison");
    url.searchParams.set("utm_campaign", "deal_finder");
    return url.toString();
  } catch (err) {
    // If not a valid absolute URL, return original
    return originalUrl;
  }
}
