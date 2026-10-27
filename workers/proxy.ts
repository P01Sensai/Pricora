/**
 * Proxy and Crawler Fleet Resilience Utility
 * Handles rotating residential proxy routing and request jitter
 * to prevent IP bans and Cloudflare/Akamai bot detection.
 */

export interface ProxyConfig {
  enabled: boolean;
  proxyUrl?: string;
  country: string;
}

/**
 * Get active proxy configuration from environment
 */
export function getProxyConfig(): ProxyConfig {
  const proxyUrl = process.env.PROXY_URL || process.env.SCRAPER_PROXY_URL;
  return {
    enabled: Boolean(proxyUrl),
    proxyUrl,
    country: "IN", // India geo-location for Amazon India & Flipkart
  };
}

/**
 * Generate randomized natural human delay (jitter) between requests
 * to avoid tripping rate limits on target retailers.
 */
export async function applyDomainJitter(minMs = 1500, maxMs = 3500): Promise<number> {
  const delay = Math.floor(minMs + Math.random() * (maxMs - minMs));
  await new Promise((resolve) => setTimeout(resolve, delay));
  return delay;
}

/**
 * Build fetch options with proxy and rotating session headers if configured
 */
export function buildResilientRequestInit(
  baseHeaders: Record<string, string>,
  timeoutMs = 8000
): RequestInit {
  const proxy = getProxyConfig();
  const sessionId = Math.random().toString(36).substring(2, 10);

  const headers: Record<string, string> = {
    ...baseHeaders,
  };

  if (proxy.enabled) {
    // If using proxy provider with session rotation header
    headers["X-Proxy-Country"] = proxy.country;
    headers["X-Proxy-Session"] = sessionId;
  }

  return {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  };
}
