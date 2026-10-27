import type { PriceHistory } from "./types";

export interface PriceStatistics {
  lowestPricePaise: number;
  highestPricePaise: number;
  averagePricePaise: number;
  currentPricePaise: number;
  dropFromPeakPercent: number;
  isAtAllTimeLow: boolean;
  totalPoints: number;
  compactedPoints: number;
  compressionRatioPercent: number;
}

/**
 * Delta Price History Compaction:
 * Removes redundant consecutive identical price points while strictly preserving
 * every inflection point, peak, drop, and stock change.
 */
export function compactPriceHistory(history: PriceHistory[]): PriceHistory[] {
  if (!history || history.length <= 2) {
    return history || [];
  }

  // Ensure chronological order
  const sorted = [...history].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const compacted: PriceHistory[] = [];
  compacted.push(sorted[0]);

  for (let i = 1; i < sorted.length - 1; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const next = sorted[i + 1];

    const priceChanged = curr.price !== prev.price || curr.price !== next.price;
    const stockChanged = curr.in_stock !== prev.in_stock || curr.in_stock !== next.in_stock;

    // Keep point if it is an inflection point or state change
    if (priceChanged || stockChanged) {
      compacted.push(curr);
    }
  }

  // Always keep the latest point
  compacted.push(sorted[sorted.length - 1]);

  return compacted;
}

/**
 * Calculate financial intelligence and pricing analytics for a product
 */
export function calculatePriceStats(history: PriceHistory[], currentPricePaise?: number): PriceStatistics | null {
  if (!history || history.length === 0) return null;

  let lowest = Infinity;
  let highest = -Infinity;
  let sum = 0;

  for (const point of history) {
    if (point.price < lowest) lowest = point.price;
    if (point.price > highest) highest = point.price;
    sum += point.price;
  }

  const latestPrice = currentPricePaise ?? history[history.length - 1].price;
  const average = Math.round(sum / history.length);
  const dropFromPeak = highest > 0 ? Math.round(((highest - latestPrice) / highest) * 100) : 0;
  const isAtAllTimeLow = latestPrice <= lowest;

  const compacted = compactPriceHistory(history);
  const ratio = Math.round((1 - compacted.length / history.length) * 100);

  return {
    lowestPricePaise: lowest,
    highestPricePaise: highest,
    averagePricePaise: average,
    currentPricePaise: latestPrice,
    dropFromPeakPercent: Math.max(0, dropFromPeak),
    isAtAllTimeLow,
    totalPoints: history.length,
    compactedPoints: compacted.length,
    compressionRatioPercent: Math.max(0, ratio),
  };
}
