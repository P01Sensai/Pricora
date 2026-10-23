import Link from "next/link";
import { getProductBySlug } from "@/lib/data";
import { calculateDealScore } from "@/lib/deal-score";
import { getAIReviewSummary } from "@/lib/ai-sentiment";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import PriceAlertForm from "@/components/PriceAlertForm";
import AIReviewSummaryCard from "@/components/AIReviewSummaryCard";
import SearchBar from "@/components/SearchBar";
import type { StoreListing } from "@/lib/types";

function formatPrice(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function StoreRow({ listing, isBest }: { listing: StoreListing; isBest: boolean }) {
  const storeSlug = listing.store?.slug ?? "";
  
  const STORE_THEMES: Record<string, {
    bg: string;
    border: string;
    hoverBorder: string;
    hoverShadow: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    storeNameColor: string;
    btnHover: string;
  }> = {
    amazon: {
      bg: "bg-[#131428]/90",
      border: "border-white/[.1]",
      hoverBorder: "hover:border-[#ff9900]/70",
      hoverShadow: "hover:shadow-[0_0_25px_rgba(255,153,0,0.22)]",
      badgeBg: "bg-[#ff9900]/25",
      badgeText: "text-[#ffb03a]",
      badgeBorder: "border-[#ff9900]/50",
      storeNameColor: "text-white",
      btnHover: "hover:bg-[#ff9900] hover:text-black",
    },
    flipkart: {
      bg: "bg-[#131428]/90",
      border: "border-white/[.1]",
      hoverBorder: "hover:border-[#2874f0]/70",
      hoverShadow: "hover:shadow-[0_0_25px_rgba(40,116,240,0.22)]",
      badgeBg: "bg-[#2874f0]/25",
      badgeText: "text-[#70a9ff]",
      badgeBorder: "border-[#2874f0]/50",
      storeNameColor: "text-white",
      btnHover: "hover:bg-[#2874f0] hover:text-white",
    },
    croma: {
      bg: "bg-[#131428]/90",
      border: "border-white/[.1]",
      hoverBorder: "hover:border-[#00b300]/70",
      hoverShadow: "hover:shadow-[0_0_25px_rgba(0,179,0,0.22)]",
      badgeBg: "bg-[#00b300]/25",
      badgeText: "text-[#4ade80]",
      badgeBorder: "border-[#00b300]/50",
      storeNameColor: "text-white",
      btnHover: "hover:bg-[#00b300] hover:text-white",
    },
  };

  const theme = STORE_THEMES[storeSlug] ?? {
    bg: "bg-[#131428]/90",
    border: "border-white/[.1]",
    hoverBorder: "hover:border-cyan-400/70",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(63,227,255,0.22)]",
    badgeBg: "bg-cyan-500/20",
    badgeText: "text-cyan-300",
    badgeBorder: "border-cyan-400/40",
    storeNameColor: "text-white",
    btnHover: "hover:bg-cyan-400 hover:text-black",
  };

  return (
    <a
      href={`/out/${listing.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl ${theme.bg} border ${theme.border} ${theme.hoverBorder} ${theme.hoverShadow} transition-all duration-300 backdrop-blur-xl`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
        >
          {listing.store?.name?.charAt(0) ?? "?"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold ${theme.storeNameColor}`}>{listing.store?.name}</p>
            {isBest && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(52,211,153,0.35)]">
                ★ BEST PRICE
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/50 mt-0.5">
            {listing.in_stock ? "✓ In stock & verified" : "✕ Out of stock"} ·{" "}
            {listing.delivery_charge ? `₹${listing.delivery_charge / 100} delivery` : "Free Delivery"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right">
          {listing.current_price ? (
            <>
              <span className="text-lg sm:text-xl font-black text-white">{formatPrice(listing.current_price)}</span>
              {listing.mrp && listing.mrp !== listing.current_price && (
                <span className="block text-xs text-white/40 line-through">{formatPrice(listing.mrp)}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-white/30">N/A</span>
          )}
        </div>

        <div className={`px-3 py-1.5 rounded-xl bg-white/[.07] border border-white/15 text-xs font-bold text-white/90 ${theme.btnHover} transition-all flex items-center gap-1.5 shadow-sm`}>
          <span>Go to Store</span>
          <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </div>
      </div>
    </a>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#060713] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🛒</div>
        <p className="text-2xl font-black">Product not found</p>
        <p className="text-white/50 text-sm">We couldn&apos;t find this product in our live catalog.</p>
        <Link href="/search" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-bold hover:brightness-110 transition mt-2">
          ← Back to Search
        </Link>
      </div>
    );
  }

  const listings = product.store_listings ?? [];
  const inStockListings = listings.filter((l) => l.in_stock && l.current_price);
  const bestListing = inStockListings.reduce(
    (best, l) => (!best || (l.current_price ?? Infinity) < (best.current_price ?? Infinity) ? l : best),
    null as StoreListing | null
  );
  const mrp = listings[0]?.mrp;
  const discount = mrp && bestListing?.current_price && mrp > bestListing.current_price
    ? Math.round((1 - bestListing.current_price / mrp) * 100)
    : 0;

  const dealScore = calculateDealScore(listings);
  const aiSummary = getAIReviewSummary(product);

  return (
    <div className="relative min-h-screen bg-[#060713] text-white font-[Poppins,Inter,system-ui,sans-serif] selection:bg-rose-500 selection:text-white overflow-x-hidden">
      
      {/* ─── Ambient Colorful Aurora Lighting ─── */}
      <div className="fixed top-0 left-1/4 w-[750px] h-[550px] bg-rose-500/[0.14] rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="fixed top-24 right-1/4 w-[750px] h-[550px] bg-cyan-500/[0.14] rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="fixed top-[650px] left-1/3 w-[850px] h-[650px] bg-purple-600/[0.12] rounded-full blur-[210px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[750px] h-[550px] bg-amber-500/[0.12] rounded-full blur-[180px] pointer-events-none z-0" />

      {/* ─── Top Festive Announcement Ticker Bar ─── */}
      <div className="relative z-50 bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-purple-500/25 border-b border-amber-500/25 py-2 px-4 backdrop-blur-xl">
        <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-sm">
              🔥 LIVE COMPARISON
            </span>
            <span className="font-semibold text-white/95">
              Live price scrapers syncing across Amazon India, Flipkart & Croma
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-white/70 font-medium shrink-0">
            <span className="text-emerald-400 flex items-center gap-1.5 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Direct Affiliate Verification Active
            </span>
          </div>
        </div>
      </div>

      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#08091a]/85 border-b border-white/[.1]">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <svg width="28" height="28" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="pg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8ef4ff"/>
                  <stop offset="50%" stopColor="#f43f5e"/>
                  <stop offset="100%" stopColor="#fbbf24"/>
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="7" fill="url(#pg)"/>
              <circle cx="24" cy="24" r="2.8" fill="#fff"/>
            </svg>
            <span className="text-[17px] font-[900] tracking-tight bg-gradient-to-r from-cyan-300 via-rose-300 to-amber-300 bg-clip-text text-transparent group-hover:brightness-125 transition">
              PRICORA
            </span>
          </Link>

          <div className="flex-1 max-w-xl">
            <SearchBar variant="header" placeholder="Search any product…" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-xs text-white/50 mb-6 font-medium">
          <Link href="/" className="hover:text-cyan-300 transition">Home</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-cyan-300 transition">Search</Link>
          <span>/</span>
          <span className="text-cyan-300 truncate max-w-[280px] font-semibold">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8">
          {/* ─── Left Column ─── */}
          <div className="space-y-8">
            {/* Product Hero */}
            <div className="rounded-3xl bg-gradient-to-br from-[#14162e]/90 via-[#0e1024]/90 to-[#121028]/90 border border-white/[.14] overflow-hidden p-6 sm:p-8 backdrop-blur-2xl shadow-[0_12px_40px_rgba(168,85,247,0.12)]">
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                {/* Image */}
                <div className="shrink-0 w-full sm:w-56 h-56 rounded-2xl bg-gradient-to-br from-white/[.07] via-cyan-500/[.03] to-purple-500/[.05] border border-white/10 flex items-center justify-center p-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(63,227,255,0.12)_0%,transparent_70%)] pointer-events-none" />
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="max-h-48 max-w-48 object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-xl"
                    />
                  ) : (
                    <span className="text-6xl">📦</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                    <span>{product.brand?.name ?? "Electronics"}</span>
                    <span>·</span>
                    <span>{product.category?.name ?? "Top Deal"}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug mb-4">
                    {product.title}
                  </h1>

                  {bestListing?.current_price && (
                    <div className="flex flex-wrap items-end justify-center sm:justify-start gap-3 mb-2">
                      <span className="text-3xl sm:text-4xl font-[900] bg-gradient-to-r from-white via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
                        {formatPrice(bestListing.current_price)}
                      </span>
                      {mrp && mrp !== bestListing.current_price && (
                        <span className="text-base text-white/40 line-through mb-1 font-semibold">{formatPrice(mrp)}</span>
                      )}
                      {discount > 0 && (
                        <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black shadow-[0_0_12px_rgba(244,63,94,0.4)] mb-1">
                          {discount}% OFF DEAL
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-white/60 mb-5">
                    {bestListing ? (
                      <>
                        Lowest price on <span className="text-amber-300 font-bold">{bestListing.store?.name}</span>
                        {" · "}Compared across <span className="text-white font-bold">{inStockListings.length} tracked stores</span>
                      </>
                    ) : (
                      <span className="text-amber-400 font-semibold">Currently out of stock across tracked stores</span>
                    )}
                  </p>

                  {bestListing && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <a
                        href={`/out/${bestListing.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-black text-sm font-black hover:brightness-110 shadow-[0_0_25px_rgba(255,153,0,0.45)] transition-all cursor-pointer"
                      >
                        <span>Buy on {bestListing.store?.name}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>

                      <a
                        href="#comparison"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[.07] border border-white/15 text-white text-xs font-bold hover:bg-white/[.15] transition"
                      >
                        <span>View All Stores</span>
                        <span className="text-cyan-400">↓</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deal Score */}
            {dealScore && (
              <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-rose-950/40 border border-cyan-400/40 p-6 backdrop-blur-xl shadow-[0_0_35px_rgba(63,227,255,0.14)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      <span>ALGORITHMIC VERDICT</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-white">{dealScore.verdict}</p>
                    <p className="text-xs text-white/60 mt-1">
                      Score: <span className="text-white font-bold">{dealScore.score}/100</span> · Real-time market comparison across {listings.length} stores
                    </p>
                  </div>
                  <div
                    className="w-18 h-18 rounded-full flex items-center justify-center border-4 shrink-0 shadow-lg"
                    style={{
                      borderColor: dealScore.score >= 80 ? '#22c55e' : dealScore.score >= 60 ? '#3fe3ff' : dealScore.score >= 40 ? '#f59e0b' : '#ef4444',
                      boxShadow: `0 0 25px ${dealScore.score >= 80 ? 'rgba(34,197,94,0.35)' : dealScore.score >= 60 ? 'rgba(63,227,255,0.35)' : 'rgba(245,158,11,0.35)'}`,
                    }}
                  >
                    <span
                      className="text-2xl font-black"
                      style={{ color: dealScore.score >= 80 ? '#22c55e' : dealScore.score >= 60 ? '#3fe3ff' : dealScore.score >= 40 ? '#f59e0b' : '#ef4444' }}
                    >
                      {dealScore.score}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Review & Customer Sentiment Summarizer */}
            <AIReviewSummaryCard product={product} summary={aiSummary} />

            {/* Price Comparison */}
            <div id="comparison">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  Live Multi-Store Price Comparison
                </h2>
                <span className="text-xs font-semibold text-cyan-400">
                  {listings.length} Stores Tracked
                </span>
              </div>
              <div className="space-y-3">
                {listings.map((listing) => (
                  <StoreRow
                    key={listing.id}
                    listing={listing}
                    isBest={listing.id === bestListing?.id}
                  />
                ))}
              </div>
            </div>

            {/* Price History Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                  60-Day Historical Price Tracking
                </h2>
                <span className="text-xs font-semibold text-rose-300">
                  Verified Real Discounts Only
                </span>
              </div>
              <div className="rounded-3xl bg-gradient-to-b from-[#131428]/90 to-[#0e0f22]/90 border border-white/[.12] p-6 backdrop-blur-xl shadow-xl">
                <PriceHistoryChart listings={listings} />
              </div>
            </div>
          </div>

          {/* ─── Right Sidebar ─── */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            {/* Price Alert */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-500/[.14] via-rose-500/[.08] to-[#12132a]/95 border-2 border-amber-400/40 p-6 shadow-[0_0_30px_rgba(245,158,11,0.22)] backdrop-blur-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  ⚡
                </div>
                <h3 className="text-base font-bold text-white">
                  Price Drop Alert
                </h3>
              </div>
              <p className="text-xs text-white/70 mb-4 leading-relaxed">
                Never miss a flash crash. Enter your email and we&apos;ll ping you the instant the price drops below {bestListing?.current_price ? formatPrice(bestListing.current_price) : "current price"}.
              </p>
              <PriceAlertForm
                productId={product.id}
                currentPrice={bestListing?.current_price ?? undefined}
                defaultPrice={bestListing?.current_price ? formatPrice(bestListing.current_price) : undefined}
              />
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="rounded-3xl bg-[#111227]/90 border border-white/[.1] p-6 backdrop-blur-xl shadow-lg">
                <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Specifications</span>
                </h3>
                <dl className="space-y-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-baseline gap-2 border-b border-white/[.04] pb-2">
                      <dt className="text-xs text-white/50">{key}</dt>
                      <dd className="text-xs text-white/90 font-medium text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="rounded-3xl bg-[#111227]/90 border border-white/[.1] p-6 backdrop-blur-xl shadow-lg">
                <h3 className="text-xs font-bold text-rose-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                  <span>✨</span>
                  <span>Key Highlights</span>
                </h3>
                <ul className="space-y-2.5">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Meta */}
            <div className="rounded-3xl bg-[#111227]/90 border border-white/[.1] p-6 backdrop-blur-xl shadow-lg">
              <h3 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <span>🛡️</span>
                <span>Verified Catalog Info</span>
              </h3>
              <dl className="space-y-3 text-xs">
                {product.model_number && (
                  <div className="flex justify-between border-b border-white/[.04] pb-2">
                    <dt className="text-white/50">Model Number</dt>
                    <dd className="text-white/80 font-mono font-semibold">{product.model_number}</dd>
                  </div>
                )}
                {product.gtin && (
                  <div className="flex justify-between border-b border-white/[.04] pb-2">
                    <dt className="text-white/50">Barcode / EAN</dt>
                    <dd className="text-white/80 font-mono font-semibold">{product.gtin}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-white/50">Last Live Check</dt>
                  <dd className="text-emerald-400 font-semibold">{bestListing?.last_checked_at ? formatDate(bestListing.last_checked_at) : "Just now"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
