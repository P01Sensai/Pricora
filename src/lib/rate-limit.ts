import { NextRequest, NextResponse } from "next/server";
import { cacheIncr } from "./redis";

export interface RateLimitOptions {
  limit: number;          // Max allowed requests in window
  windowSeconds: number;  // Window duration in seconds
  keyPrefix?: string;     // Unique prefix for this route
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  ip: string;
}

/**
 * Extract client IP from proxy headers or fallback
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Check if the request is within rate limits.
 * Uses Redis atomic counter with instant in-memory fallback.
 */
export async function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const ip = getClientIp(req);
  const prefix = options.keyPrefix || "rl";
  const key = `ratelimit:${prefix}:${ip}`;

  const { count, ttl } = await cacheIncr(key, options.windowSeconds);

  const remaining = Math.max(0, options.limit - count);
  const allowed = count <= options.limit;

  return {
    allowed,
    limit: options.limit,
    remaining,
    resetInSeconds: ttl,
    ip,
  };
}

/**
 * Generate standard RFC rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetInSeconds),
  };
}

/**
 * Return standardized 429 Too Many Requests response
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "Too Many Requests",
      message: `Rate limit of ${result.limit} requests per minute exceeded. Please slow down.`,
      retryAfterSeconds: result.resetInSeconds,
    },
    {
      status: 429,
      headers: {
        ...getRateLimitHeaders(result),
        "Retry-After": String(result.resetInSeconds),
      },
    }
  );
}
