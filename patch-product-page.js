const fs = require('fs');
let code = fs.readFileSync('e:/WEB/Pricora/src/app/product/[slug]/page.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import type { Product, StoreListing, PriceHistory } from "@/lib/types";',
  'import type { Product, StoreListing, PriceHistory } from "@/lib/types";\nimport PriceHistoryChart from "@/components/PriceHistoryChart";\nimport { calculateDealScore } from "@/lib/deal-score";'
);

// 2. Remove PriceChart component completely
code = code.replace(/\/\/ ─── Mini Chart \(pure canvas, no dependency\) ───[\s\S]*?(?=\/\/ ─── Store Comparison Row ───)/, '');

// 3. Calculate Deal Score
const calcTarget = `const discount = mrp && bestListing?.current_price
    ? Math.round((1 - bestListing.current_price / mrp) * 100) : 0;`;

const calcReplacement = `const discount = mrp && bestListing?.current_price
    ? Math.round((1 - bestListing.current_price / mrp) * 100) : 0;
  
  const dealScore = calculateDealScore(listings);`;
code = code.replace(calcTarget, calcReplacement);

// 4. Render Deal Score before Price Comparison
const priceCompTarget = `{/* Price Comparison */}`;
const dealScoreJSX = `{/* Deal Score */}
            {dealScore && (
              <div className="rounded-2xl bg-gradient-to-br from-white/[.05] to-transparent border border-white/[.07] p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-1">Pricora Verdict</p>
                    <p className="text-3xl font-[900] text-white">{dealScore.verdict}</p>
                    <p className="text-xs text-white/40 mt-1">Score: {dealScore.score}/100 · Analyzed across {listings.length} stores</p>
                  </div>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border-4" style={{ borderColor: dealScore.score >= 80 ? '#22c55e' : dealScore.score >= 60 ? '#3fe3ff' : dealScore.score >= 40 ? '#f59e0b' : '#ef4444' }}>
                    <span className="text-2xl font-bold" style={{ color: dealScore.score >= 80 ? '#22c55e' : dealScore.score >= 60 ? '#3fe3ff' : dealScore.score >= 40 ? '#f59e0b' : '#ef4444' }}>{dealScore.score}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Price Comparison */}`;
code = code.replace(priceCompTarget, dealScoreJSX);

// 5. Replace PriceChart with PriceHistoryChart
code = code.replace('<PriceChart listings={listings} />', '<PriceHistoryChart listings={listings} />');

// 6. Add Alerts Form to Sidebar
const sidebarTarget = `{/* Specs */}`;
const alertsJSX = `{/* Price Alert */}
            <div className="rounded-2xl bg-white/[.025] border border-cyan-400/30 p-5 shadow-[0_0_20px_rgba(63,227,255,0.05)]">
              <h3 className="text-sm font-semibold text-white/90 tracking-wide mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                Price Drop Alerts
              </h3>
              <p className="text-xs text-white/50 mb-4">We'll email you when the price drops below {bestListing?.current_price ? formatPrice(bestListing.current_price) : "current price"}.</p>
              <form className="flex gap-2">
                <input type="email" placeholder="Your email..." className="flex-1 w-0 h-9 rounded-lg bg-white/[.05] border border-white/[.1] text-xs px-3 outline-none focus:border-cyan-400/50" required />
                <button className="h-9 px-4 rounded-lg bg-cyan-400 text-black text-xs font-semibold hover:bg-cyan-300 transition shrink-0">Notify</button>
              </form>
            </div>

            {/* Specs */}`;
code = code.replace(sidebarTarget, alertsJSX);

fs.writeFileSync('e:/WEB/Pricora/src/app/product/[slug]/page.tsx', code);
console.log("Patched page.tsx successfully!");
