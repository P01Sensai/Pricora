"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";

function formatPrice(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query || query.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-[#020204] text-white font-[Poppins,Inter,system-ui,sans-serif]">
      {/* ─── Sticky Search Bar ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#020204]/80 border-b border-white/[.06]">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <svg width="28" height="28" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="sg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8ef4ff"/>
                  <stop offset="50%" stopColor="#35d8ff"/>
                  <stop offset="100%" stopColor="#0a86d8"/>
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="6.6" fill="url(#sg)"/>
              <circle cx="24" cy="24" r="2.6" fill="#fff"/>
            </svg>
            <span className="text-[15px] font-[900] tracking-tight">PRICORA</span>
          </Link>

          <form action="/search" className="flex-1 max-w-xl">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>
              <input
                name="q"
                defaultValue={query}
                placeholder="Search headphones, speakers, earbuds…"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[.06] border border-white/[.08] text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition"
              />
            </div>
          </form>
        </div>
      </header>

      {/* ─── Results ─── */}
      <main className="max-w-5xl mx-auto px-5 py-8">
        {query && (
          <p className="text-white/50 text-sm mb-6">
            {loading ? "Searching…" : `${products.length} result${products.length !== 1 ? "s" : ""} for `}
            {!loading && <span className="text-white font-medium">&quot;{query}&quot;</span>}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white/[.03] border border-white/[.06] h-72 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && query && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔇</div>
            <p className="text-white/60 text-lg mb-2">No products found</p>
            <p className="text-white/30 text-sm">Try searching for &quot;headphones&quot;, &quot;JBL&quot;, or &quot;Sony&quot;</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const lowest = product.store_listings?.reduce((min, l) =>
                l.current_price && l.in_stock && (!min || l.current_price < min.current_price!)
                  ? l : min, null as typeof product.store_listings extends (infer T)[] ? T | null : never);
              const storeCount = product.store_listings?.filter((l) => l.in_stock).length ?? 0;
              const mrp = product.store_listings?.[0]?.mrp;
              const discount = mrp && lowest?.current_price ? Math.round((1 - lowest.current_price / mrp) * 100) : 0;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group rounded-2xl bg-white/[.025] border border-white/[.07] overflow-hidden hover:border-cyan-400/30 hover:bg-white/[.04] transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-white/[.03] to-transparent flex items-center justify-center p-4 overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-white/[.06] flex items-center justify-center text-3xl">🎧</div>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[10px] font-semibold tracking-[.15em] text-cyan-400/70 uppercase mb-1.5">
                      {product.brand?.name} · {product.category?.name}
                    </p>
                    <h3 className="text-[13px] font-semibold text-white/90 leading-snug line-clamp-2 mb-3">
                      {product.title}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div>
                        {lowest?.current_price ? (
                          <>
                            <span className="text-lg font-bold text-white">{formatPrice(lowest.current_price)}</span>
                            {mrp && mrp !== lowest.current_price && (
                              <span className="text-xs text-white/30 line-through ml-2">{formatPrice(mrp)}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-white/40">Price unavailable</span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/40">
                        {storeCount} store{storeCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!query && (
          <div className="text-center py-20">
            <div className="text-5xl mb-5">🎵</div>
            <p className="text-white/60 text-lg mb-2">Find the best audio deals</p>
            <p className="text-white/30 text-sm mb-8">Compare prices across Amazon, Flipkart, and Croma</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Sony WH-1000XM5", "JBL Flip 6", "Samsung Buds", "Bose"].map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="px-4 py-2 rounded-xl bg-white/[.04] border border-white/[.08] text-sm text-white/60 hover:text-white hover:border-cyan-400/30 transition"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020204]" />}>
      <SearchResultsContent />
    </Suspense>
  );
}
