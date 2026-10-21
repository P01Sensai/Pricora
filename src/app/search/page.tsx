"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import type { Product } from "@/lib/types";

function formatPrice(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const CATEGORIES = [
  { label: "All Deals", value: "" },
  { label: "Festive Deals 🪔", value: "festive" },
  { label: "Smartphones 📱", value: "smartphones" },
  { label: "Laptops 💻", value: "laptops" },
  { label: "Audio 🎧", value: "audio" },
  { label: "Gaming 🎮", value: "gaming" },
  { label: "Wearables ⌚", value: "wearables" },
  { label: "Appliances 📺", value: "appliances" },
];

function ProductCardImage({
  src,
  alt,
  categorySlug,
}: {
  src?: string | null;
  alt: string;
  categorySlug?: string;
}) {
  const [failed, setFailed] = useState(false);

  const getFallbackIcon = () => {
    const c = categorySlug?.toLowerCase() || "";
    if (c.includes("laptop")) return "💻";
    if (c.includes("smart") || c.includes("phone")) return "📱";
    if (c.includes("audio") || c.includes("headphone")) return "🎧";
    if (c.includes("gaming") || c.includes("console")) return "🎮";
    if (c.includes("wearable") || c.includes("watch")) return "⌚";
    if (c.includes("appliance") || c.includes("tv")) return "📺";
    return "📦";
  };

  if (!src || failed) {
    return (
      <div className="w-20 h-20 rounded-2xl bg-white/[.04] border border-white/[.08] flex items-center justify-center text-4xl shadow-inner">
        {getFallbackIcon()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
    />
  );
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "discount">("featured");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(rawQuery)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) {
          setProducts(d.products ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [rawQuery]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.lowest_price ?? 0) - (b.lowest_price ?? 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.lowest_price ?? 0) - (a.lowest_price ?? 0));
    } else if (sortBy === "discount") {
      list.sort((a, b) => {
        const discA = a.store_listings?.[0]?.mrp && a.lowest_price ? (1 - a.lowest_price / a.store_listings[0].mrp) : 0;
        const discB = b.store_listings?.[0]?.mrp && b.lowest_price ? (1 - b.lowest_price / b.store_listings[0].mrp) : 0;
        return discB - discA;
      });
    }
    return list;
  }, [products, sortBy]);

  const handleCategoryClick = (catVal: string) => {
    if (!catVal) {
      router.push("/search");
    } else {
      router.push(`/search?q=${encodeURIComponent(catVal)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020204] text-white font-[Poppins,Inter,system-ui,sans-serif]">
      {/* ─── Sticky Search Bar ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#020204]/85 border-b border-white/[.06]">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
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
            <span className="text-[16px] font-[900] tracking-tight group-hover:text-cyan-400 transition-colors">PRICORA</span>
          </Link>

          <div className="flex-1 max-w-2xl">
            <SearchBar
              variant="header"
              defaultValue={rawQuery}
              placeholder="Search iPhone, PS5, Sony Headphones, Laptops..."
            />
          </div>
        </div>

        {/* ─── Category Quick Filter Chips ─── */}
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pb-3 overflow-x-auto flex items-center gap-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = rawQuery.toLowerCase() === cat.value.toLowerCase() || (!rawQuery && !cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(63,227,255,0.4)]"
                    : "bg-white/[.04] text-white/70 hover:text-white hover:bg-white/[.08] border border-white/[.06]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Results Area ─── */}
      <main className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results stats & Sorting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">
              {rawQuery ? `Results for "${rawQuery}"` : "Trending Products & Festive Deals"}
            </h1>
            <p className="text-white/50 text-xs mt-1">
              {loading ? "Searching Amazon & Flipkart in real time..." : `Showing ${sortedProducts.length} verified products with price comparisons`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/[.05] border border-white/[.1] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
            >
              <option value="featured" className="bg-[#101018] text-white">Featured</option>
              <option value="discount" className="bg-[#101018] text-white">Highest Discount</option>
              <option value="price-asc" className="bg-[#101018] text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-[#101018] text-white">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="rounded-2xl bg-white/[.03] border border-white/[.06] h-80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && sortedProducts.length === 0 && (
          <div className="text-center py-24 bg-white/[.02] border border-white/[.05] rounded-3xl p-8">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/80 text-xl font-semibold mb-2">No matching products found</p>
            <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
              Try searching for popular terms like &quot;iPhone 16&quot;, &quot;PS5 Console&quot;, &quot;Sony Headphones&quot;, or &quot;MacBook Air&quot;.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition"
            >
              View All 130+ Deals
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && sortedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6 gap-5">
            {sortedProducts.map((product) => {
              const lowest = product.store_listings?.reduce((min, l) =>
                l.current_price && l.in_stock && (!min || l.current_price < min.current_price!)
                  ? l : min, null as typeof product.store_listings extends (infer T)[] ? T | null : never);

              const stores = product.store_listings?.map(l => l.store?.slug).filter(Boolean) ?? [];
              const mrp = product.store_listings?.[0]?.mrp;
              const discount = mrp && lowest?.current_price && mrp > lowest.current_price
                ? Math.round((1 - lowest.current_price / mrp) * 100)
                : 0;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  prefetch={false}
                  className="group rounded-2xl bg-white/[.025] border border-white/[.07] overflow-hidden hover:border-cyan-400/40 hover:bg-white/[.045] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Image area */}
                  <div className="relative h-52 bg-gradient-to-b from-white/[.02] to-transparent flex items-center justify-center p-5 overflow-hidden">
                    <ProductCardImage
                      src={product.image_url}
                      alt={product.title}
                      categorySlug={product.category?.slug ?? product.category_id}
                    />

                    {discount > 0 && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold shadow-lg">
                        -{discount}% OFF
                      </span>
                    )}

                    {/* Store icons preview */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {stores.includes("amazon") && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff9900]/20 text-[#ff9900] border border-[#ff9900]/30">
                          Amazon
                        </span>
                      )}
                      {stores.includes("flipkart") && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2874f0]/20 text-[#6ea8fe] border border-[#2874f0]/30">
                          Flipkart
                        </span>
                      )}
                      {stores.includes("croma") && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00b300]/20 text-[#4ade80] border border-[#00b300]/30">
                          Croma
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-cyan-400/80 uppercase mb-1">
                        {product.brand?.name ?? "Electronics"} · {product.category?.name ?? "Deals"}
                      </p>
                      <h3 className="text-sm font-semibold text-white/95 leading-snug line-clamp-2 mb-3 group-hover:text-cyan-300 transition-colors">
                        {product.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-white/[.06] flex items-end justify-between">
                      <div>
                        {lowest?.current_price ? (
                          <>
                            <span className="text-lg font-extrabold text-white">{formatPrice(lowest.current_price)}</span>
                            {mrp && mrp > lowest.current_price && (
                              <span className="text-xs text-white/35 line-through ml-2">{formatPrice(mrp)}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-white/40">Check live price</span>
                        )}
                      </div>

                      <span className="text-[11px] font-medium text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Compare &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
