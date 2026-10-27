import IORedis from "ioredis";

let redisClient: IORedis | null = null;
let isRedisAvailable = false;
let redisInitialized = false;

// Fallback in-memory cache with TTL support
const fallbackMemoryCache = new Map<string, { value: any; expiresAt: number }>();

function getRedisInstance(): IORedis | null {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl && process.env.NODE_ENV === "production") {
    console.warn("[Pricora Cache] REDIS_URL not set. Running on in-memory fallback.");
    return null;
  }

  try {
    const client = new IORedis(redisUrl || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
    });

    client.on("connect", () => {
      isRedisAvailable = true;
      console.log("[Pricora Cache] Connected to Redis successfully.");
    });

    client.on("error", (err) => {
      isRedisAvailable = false;
      // Suppress unhandled error log spam if local redis is not running
      if (process.env.NODE_ENV === "development") {
        // silent fallback in dev
      } else {
        console.warn("[Pricora Cache] Redis error, falling back to memory:", err.message);
      }
    });

    // Attempt initial async connect without blocking process
    client.connect().catch(() => {
      isRedisAvailable = false;
    });

    redisClient = client;
    return redisClient;
  } catch (err) {
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Retrieve cached JSON value by key
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisInstance();

  if (isRedisAvailable && client) {
    try {
      const data = await client.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch {
      // Fallback to memory on Redis read error
    }
  }

  // Check in-memory fallback
  const memEntry = fallbackMemoryCache.get(key);
  if (memEntry) {
    if (Date.now() > memEntry.expiresAt) {
      fallbackMemoryCache.delete(key);
      return null;
    }
    return memEntry.value as T;
  }

  return null;
}

/**
 * Save value to cache with TTL in seconds (default: 10 minutes)
 */
export async function cacheSet(key: string, value: any, ttlSeconds = 600): Promise<void> {
  const serialized = JSON.stringify(value);
  const client = getRedisInstance();

  // Always update in-memory cache as instant tier
  fallbackMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  if (isRedisAvailable && client) {
    try {
      await client.set(key, serialized, "EX", ttlSeconds);
    } catch {
      // Silently rely on memory fallback
    }
  }
}

/**
 * Delete key from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  fallbackMemoryCache.delete(key);
  const client = getRedisInstance();
  if (isRedisAvailable && client) {
    try {
      await client.del(key);
    } catch {
      // ignore
    }
  }
}
