import type { StoreListing, PriceHistory, DealScore } from "./types";

/**
 * Calculates a "Buy now or wait" deal score for a product.
 *
 * The score (0–100) is based on four signals:
 *  1. Discount depth  — how far below MRP the current price sits
 *  2. Historical low   — is this at or near the all-time low?
 *  3. Trend direction  — is the price falling, flat, or rising?
 *  4. Stock scarcity   — how many stores have it in stock?
 *
 * The verdict maps to bands:
 *  80–100 → "Great deal"
 *  60–79  → "Good deal"
 *  40–59  → "Fair"
 *  0–39   → "Wait"
 */
export function calculateDealScore(
  listings: StoreListing[],
): DealScore | null {
  const inStock = listings.filter((l) => l.in_stock && l.current_price);
  if (inStock.length === 0) return null;

  const currentBest = Math.min(...inStock.map((l) => l.current_price!));
  const mrp = Math.max(...listings.map((l) => l.mrp ?? 0));

  // Gather all historical prices across every listing
  const allHistory: PriceHistory[] = listings.flatMap(
    (l) => l.price_history ?? []
  );
  const allPrices = allHistory.map((h) => h.price);
  const historicalLow = allPrices.length > 0 ? Math.min(...allPrices) : currentBest;

  // ─── Signal 1: Discount depth (0–30 pts) ───
  //   30% or more off MRP → full 30 points
  let discountScore = 0;
  if (mrp > 0) {
    const discountPct = (1 - currentBest / mrp) * 100;
    discountScore = Math.min(30, Math.round(discountPct));
  }

  // ─── Signal 2: Historical low proximity (0–35 pts) ───
  //   At the all-time low → 35 points, within 5% → 28, within 10% → 18, else → 5
  let historyScore = 5;
  if (allPrices.length > 0) {
    const aboveLow = ((currentBest - historicalLow) / historicalLow) * 100;
    if (aboveLow <= 0) historyScore = 35;
    else if (aboveLow <= 5) historyScore = 28;
    else if (aboveLow <= 10) historyScore = 18;
    else if (aboveLow <= 20) historyScore = 10;
    else historyScore = 5;
  }

  // ─── Signal 3: Trend direction (0–20 pts) ───
  //   Compare average of last 7 days vs previous 7 days
  let trendScore = 10; // neutral default
  if (allHistory.length >= 14) {
    const sorted = [...allHistory].sort(
      (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
    const recent7 = sorted.slice(0, 7);
    const prev7 = sorted.slice(7, 14);
    const avgRecent = recent7.reduce((s, h) => s + h.price, 0) / recent7.length;
    const avgPrev = prev7.reduce((s, h) => s + h.price, 0) / prev7.length;

    if (avgRecent < avgPrev * 0.97) trendScore = 20;      // falling → great
    else if (avgRecent < avgPrev * 0.99) trendScore = 15;  // slightly falling
    else if (avgRecent > avgPrev * 1.03) trendScore = 3;   // rising → wait
    else trendScore = 10;                                   // flat
  }

  // ─── Signal 4: Stock scarcity (0–15 pts) ───
  //   Available at all 3 stores → 15, 2 → 10, 1 → 5
  let stockScore = 5;
  if (inStock.length >= 3) stockScore = 15;
  else if (inStock.length >= 2) stockScore = 10;

  const score = Math.min(100, discountScore + historyScore + trendScore + stockScore);

  let verdict: DealScore["verdict"];
  if (score >= 80) verdict = "Great deal";
  else if (score >= 60) verdict = "Good deal";
  else if (score >= 40) verdict = "Fair";
  else verdict = "Wait";

  return {
    product_id: "",
    score,
    verdict,
    breakdown: {
      discount: discountScore,
      history: historyScore,
      trend: trendScore,
      stock: stockScore,
    },
    calculated_at: new Date().toISOString(),
  };
}
