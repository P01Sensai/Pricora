import { Queue } from "bullmq";

export interface TierConfig {
  name: string;
  cadenceDescription: string;
  intervalMs: number;
  queries: string[];
}

export const POLLING_TIERS: Record<string, TierConfig> = {
  tier1: {
    name: "Tier 1 — High Priority & Alerted Items",
    cadenceDescription: "Every 30 minutes",
    intervalMs: 30 * 60 * 1000, // 30 minutes
    queries: [
      "iPhone 16",
      "iPhone 15",
      "MacBook Air M3",
      "PlayStation 5 Slim",
      "Sony WH-1000XM5",
      "Samsung Galaxy S24 Ultra",
    ],
  },
  tier2: {
    name: "Tier 2 — Standard Catalog",
    cadenceDescription: "Every 6 hours",
    intervalMs: 6 * 60 * 60 * 1000, // 6 hours
    queries: [
      "OnePlus 12",
      "iPad Air",
      "Asus ROG Zephyrus",
      "Dell XPS 13",
      "Bose QuietComfort Ultra",
      "Nintendo Switch OLED",
      "AirPods Pro",
    ],
  },
  tier3: {
    name: "Tier 3 — Long-Tail & Stable SKUs",
    cadenceDescription: "Every 24 hours",
    intervalMs: 24 * 60 * 60 * 1000, // 24 hours
    queries: [
      "Logitech MX Master 3S",
      "Anker 65W GaN Charger",
      "Kindle Paperwhite",
      "Samsung T7 SSD",
    ],
  },
};

/**
 * Register repeatable BullMQ jobs for tiered polling cadences
 */
export async function registerTieredPollingJobs(queue: Queue): Promise<void> {
  const stores = ["amazon", "flipkart", "croma"];

  for (const [tierKey, config] of Object.entries(POLLING_TIERS)) {
    for (const query of config.queries) {
      for (const storeId of stores) {
        const schedulerId = `sched-${tierKey}-${storeId}-${query.toLowerCase().replace(/\s+/g, "-")}`;
        try {
          await queue.upsertJobScheduler(
            schedulerId,
            { every: config.intervalMs },
            {
              name: schedulerId,
              data: { storeId, query, tier: tierKey },
              opts: {
                removeOnComplete: 100,
                removeOnFail: 50,
              },
            }
          );
        } catch (err: any) {
          console.warn(`[Tiered Scheduler] Job registration note: ${err.message}`);
        }
      }
    }
  }

  console.log("[Tiered Scheduler] Registered 3-tier polling cadence successfully.");
}

/**
 * Immediate escalation: When a user creates an alert or searches an unindexed item,
 * immediately enqueue Tier 1 jobs for all stores.
 */
export async function enqueueImmediateAlertCheck(queue: Queue, query: string): Promise<void> {
  const stores = ["amazon", "flipkart", "croma"];
  for (const storeId of stores) {
    await queue.add(
      `instant-alert-${storeId}-${Date.now()}`,
      { storeId, query, tier: "tier1" },
      {
        priority: 1, // High priority
        removeOnComplete: true,
      }
    );
  }
}
