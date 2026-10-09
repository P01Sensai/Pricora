"use client";

import { useEffect, useState, useRef, use, Suspense } from "react";
import Link from "next/link";
import type { Product, StoreListing, PriceHistory } from "@/lib/types";

function formatPrice(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Mini Chart (pure canvas, no dependency) ───
function PriceChart({ listings }: { listings: StoreListing[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Gather all price points with their store colors
    const COLORS = ["#3fe3ff", "#f59e0b", "#a855f7"];
    const allPrices: number[] = [];

    const seriesData = listings.map((l, idx) => {
      const history = l.price_history ?? [];
      history.forEach((h) => allPrices.push(h.price));
      return { history, color: COLORS[idx % COLORS.length], name: l.store?.name ?? "Store" };
    });

    if (allPrices.length === 0) return;

    const minP = Math.min(...allPrices) * 0.97;
    const maxP = Math.max(...allPrices) * 1.03;
    const range = maxP - minP || 1;

    // Background grid
    ctx.strokeStyle = "rgba(255,255,255,.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 24 + ((H - 48) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W - 16, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,.25)";
      ctx.font = "9px system-ui";
      ctx.textAlign = "right";
      const val = maxP - (range * i) / 4;
      ctx.fillText(formatPrice(val), 36, y + 3);
    }

    // Draw each store's line
    seriesData.forEach(({ history, color }) => {
      if (history.length < 2) return;
      const sorted = [...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
      const tMin = new Date(sorted[0].recorded_at).getTime();
      const tMax = new Date(sorted[sorted.length - 1].recorded_at).getTime();
      const tRange = tMax - tMin || 1;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();

      sorted.forEach((pt, i) => {
        const x = 44 + ((new Date(pt.recorded_at).getTime() - tMin) / tRange) * (W - 64);
        const y = 24 + ((maxP - pt.price) / range) * (H - 48);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Glow
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.filter = "blur(6px)";
      ctx.beginPath();
      sorted.forEach((pt, i) => {
        const x = 44 + ((new Date(pt.recorded_at).getTime() - tMin) / tRange) * (W - 64);
        const y = 24 + ((maxP - pt.price) / range) * (H - 48);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    });

    // Legend
    seriesData.forEach(({ color, name }, i) => {
      const lx = 44 + i * 120;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lx, H - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.font = "10px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(name, lx + 8, H - 5);
    });
  }, [listings]);

  return (
    <div ref={containerRef} className="w-full h-64 relative">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

// ─── Store Comparison Row ───
function StoreRow({ listing, isBest }: { listing: StoreListing; isBest: boolean }) {
  const STORE_COLORS: Record<string, string> = {
    amazon: "#ff9900",
    flipkart: "#2874f0",
    croma: "#00b300",
  };
  const storeSlug = listing.store?.slug ?? "";
  const borderColor = STORE_COLORS[storeSlug] ?? "#3fe3ff";

  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between p-4 rounded-xl bg-white/[.025] border border-white/[.07] hover:border-cyan-400/30 hover:bg-white/[.04] transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: `${borderColor}18`, color: borderColor, border: `1px solid ${borderColor}40` }}
        >
          {listing.store?.name?.charAt(0) ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">{listing.store?.name}</p>
          <p className="text-[10px] text-white/35 mt-0.5">
            {listing.in_stock ? "In stock" : "Out of stock"} ·{" "}
            {listing.delivery_charge ? `₹${listing.delivery_charge / 100} delivery` : "Free delivery"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          {listing.current_price ? (
            <>
              <span className="text-base font-bold text-white">{formatPrice(listing.current_price)}</span>
              {listing.mrp && listing.mrp !== listing.current_price && (
                <span className="block text-[10px] text-white/30 line-through">{formatPrice(listing.mrp)}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-white/30">N/A</span>
          )}
        </div>

        {isBest && (
          <span className="px-2 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-[10px] font-semibold tracking-wider">
            BEST
          </span>
        )}

        <svg className="w-4 h-4 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </div>
    </a>
  );
}

function ProductPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/data").then(({ getProductBySlug }) => {
      getProductBySlug(slug).then((p) => {
        setProduct(p);
        setLoading(false);
      });
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020204] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#020204] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">Product not found</p>
        <Link href="/search" className="text-cyan-400 text-sm hover:underline">← Back to search</Link>
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
  const discount = mrp && bestListing?.current_price
    ? Math.round((1 - bestListing.current_price / mrp) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#020204] text-white font-[Poppins,Inter,system-ui,sans-serif]">
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#020204]/80 border-b border-white/[.06]">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg width="24" height="24" viewBox="0 0 48 48">
              <defs><linearGradient id="pg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#8ef4ff"/><stop offset="50%" stopColor="#35d8ff"/><stop offset="100%" stopColor="#0a86d8"/></linearGradient></defs>
              <circle cx="24" cy="24" r="6.6" fill="url(#pg)"/><circle cx="24" cy="24" r="2.6" fill="#fff"/>
            </svg>
            <span className="text-sm font-[900] tracking-tight">PRICORA</span>
          </Link>

          <form action="/search" className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>
              <input name="q" placeholder="Search…" className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/[.05] border border-white/[.07] text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-400/40 transition" />
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-1.5 text-[11px] text-white/30 mb-6">
          <Link href="/" className="hover:text-white/60 transition">Home</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-white/60 transition">Search</Link>
          <span>/</span>
          <span className="text-white/50 truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* ─── Left Column ─── */}
          <div className="space-y-6">
            {/* Product Hero */}
            <div className="rounded-2xl bg-white/[.025] border border-white/[.07] overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-6 p-6">
                {/* Image */}
                <div className="shrink-0 w-full sm:w-48 h-48 rounded-xl bg-gradient-to-br from-white/[.04] to-transparent flex items-center justify-center">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.title} className="max-h-40 max-w-40 object-contain" />
                  ) : (
                    <span className="text-5xl">🎧</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-[.15em] text-cyan-400/70 uppercase mb-2">
                    {product.brand?.name} · {product.category?.name}
                  </p>
                  <h1 className="text-xl font-bold text-white leading-snug mb-4">{product.title}</h1>

                  {bestListing?.current_price && (
                    <div className="flex items-end gap-3 mb-1">
                      <span className="text-3xl font-[900] text-white">{formatPrice(bestListing.current_price)}</span>
                      {mrp && mrp !== bestListing.current_price && (
                        <span className="text-sm text-white/30 line-through mb-1">{formatPrice(mrp)}</span>
                      )}
                      {discount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-xs font-semibold mb-1">
                          {discount}% off
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-white/30">
                    Lowest at <span className="text-white/60 font-medium">{bestListing?.store?.name}</span>
                    {" · "}Compared across {inStockListings.length} store{inStockListings.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Comparison */}
            <div>
              <h2 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>
                Price Comparison
              </h2>
              <div className="space-y-2.5">
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
              <h2 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-3 3"/></svg>
                60-Day Price History
              </h2>
              <div className="rounded-2xl bg-white/[.025] border border-white/[.07] p-5 overflow-hidden">
                <PriceChart listings={listings} />
              </div>
            </div>
          </div>

          {/* ─── Right Sidebar ─── */}
          <div className="space-y-5">
            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="rounded-2xl bg-white/[.025] border border-white/[.07] p-5">
                <h3 className="text-xs font-semibold text-white/50 tracking-wider uppercase mb-4">Specifications</h3>
                <dl className="space-y-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-baseline">
                      <dt className="text-xs text-white/40">{key}</dt>
                      <dd className="text-xs text-white/80 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="rounded-2xl bg-white/[.025] border border-white/[.07] p-5">
                <h3 className="text-xs font-semibold text-white/50 tracking-wider uppercase mb-4">Highlights</h3>
                <ul className="space-y-2.5">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                      <span className="w-1 h-1 rounded-full bg-cyan-400/50 mt-1.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Meta */}
            <div className="rounded-2xl bg-white/[.025] border border-white/[.07] p-5">
              <h3 className="text-xs font-semibold text-white/50 tracking-wider uppercase mb-4">Product Info</h3>
              <dl className="space-y-3 text-xs">
                {product.model_number && (
                  <div className="flex justify-between"><dt className="text-white/40">Model</dt><dd className="text-white/70 font-mono">{product.model_number}</dd></div>
                )}
                {product.gtin && (
                  <div className="flex justify-between"><dt className="text-white/40">EAN</dt><dd className="text-white/70 font-mono">{product.gtin}</dd></div>
                )}
                <div className="flex justify-between">
                  <dt className="text-white/40">Last checked</dt>
                  <dd className="text-white/70">{bestListing?.last_checked_at ? formatDate(bestListing.last_checked_at) : "—"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020204] flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /></div>}>
      <ProductPageContent params={params} />
    </Suspense>
  );
}
