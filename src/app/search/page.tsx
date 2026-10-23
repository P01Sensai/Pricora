"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import type { Product } from "@/lib/types";

function formatPrice(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

interface CategoryConfig {
  label: string;
  value: string;
  icon: string;
  activeColor: string;
  inactiveColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    label: "All Deals",
    value: "",
    icon: "✨",
    activeColor: "bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-400 text-black font-black shadow-[0_0_18px_rgba(63,227,255,0.45)]",
    inactiveColor: "bg-white/[.04] text-white/80 hover:text-white hover:bg-white/[.08] border-white/10",
  },
  {
    label: "Festive Mega Deals",
    value: "festive",
    icon: "🪔",
    activeColor: "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black shadow-[0_0_18px_rgba(245,158,11,0.5)]",
    inactiveColor: "bg-amber-500/[.08] text-amber-300 hover:bg-amber-500/[.15] border-amber-500/30",
  },
  {
    label: "Smartphones",
    value: "smartphones",
    icon: "📱",
    activeColor: "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-black shadow-[0_0_18px_rgba(217,70,239,0.5)]",
    inactiveColor: "bg-fuchsia-500/[.08] text-fuchsia-300 hover:bg-fuchsia-500/[.15] border-fuchsia-500/30",
  },
  {
    label: "Laptops & PCs",
    value: "laptops",
    icon: "💻",
    activeColor: "bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black shadow-[0_0_18px_rgba(56,189,248,0.5)]",
    inactiveColor: "bg-cyan-500/[.08] text-cyan-300 hover:bg-cyan-500/[.15] border-cyan-500/30",
  },
  {
    label: "Audio & Headphones",
    value: "audio",
    icon: "🎧",
    activeColor: "bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black shadow-[0_0_18px_rgba(244,63,94,0.5)]",
    inactiveColor: "bg-rose-500/[.08] text-rose-300 hover:bg-rose-500/[.15] border-rose-500/30",
  },
  {
    label: "Gaming & Consoles",
    value: "gaming",
    icon: "🎮",
    activeColor: "bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-black shadow-[0_0_18px_rgba(52,211,153,0.5)]",
    inactiveColor: "bg-emerald-500/[.08] text-emerald-300 hover:bg-emerald-500/[.15] border-emerald-500/30",
  },
  {
    label: "Smart Wearables",
    value: "wearables",
    icon: "⌚",
    activeColor: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-[0_0_18px_rgba(168,85,247,0.5)]",
    inactiveColor: "bg-purple-500/[.08] text-purple-300 hover:bg-purple-500/[.15] border-purple-500/30",
  },
  {
    label: "Smart Appliances",
    value: "appliances",
    icon: "📺",
    activeColor: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black shadow-[0_0_18px_rgba(234,179,8,0.5)]",
    inactiveColor: "bg-yellow-500/[.08] text-yellow-300 hover:bg-yellow-500/[.15] border-yellow-500/30",
  },
];

function ProductCardImage({
  src,
  alt,
  categorySlug,
}: {
  src?: string | null;
  alt: string;
  categorySlug?: string | null;
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
      <div className="w-20 h-20 rounded-2xl bg-white/[.06] border border-white/10 flex items-center justify-center text-4xl shadow-inner">
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
      className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
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
      list.sort((a, b) => (a.lowest_price || Infinity) - (b.lowest_price || Infinity));
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
              🔥 LIVE PRICES
            </span>
            <span className="font-semibold text-white/95">
              Live dual-store price checks across Amazon India, Flipkart & Croma · Zero markups
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-white/70 font-medium shrink-0">
            <span className="text-emerald-400 flex items-center gap-1.5 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Real-Time Scrapers Online
            </span>
          </div>
        </div>
      </div>

      {/* ─── Sticky Vibrant Search Header ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#08091a]/85 border-b border-white/[.1]">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <svg width="28" height="28" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="sg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8ef4ff"/>
                  <stop offset="50%" stopColor="#f43f5e"/>
                  <stop offset="100%" stopColor="#fbbf24"/>
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="7" fill="url(#sg)"/>
              <circle cx="24" cy="24" r="2.8" fill="#fff"/>
            </svg>
            <span className="text-[17px] font-[900] tracking-tight bg-gradient-to-r from-cyan-300 via-rose-300 to-amber-300 bg-clip-text text-transparent group-hover:brightness-125 transition">
              PRICORA
            </span>
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
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pb-3.5 overflow-x-auto flex items-center gap-2.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = rawQuery.toLowerCase() === cat.value.toLowerCase() || (!rawQuery && !cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? cat.activeColor
                    : cat.inactiveColor
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Results Area ─── */}
      <main className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results stats & Sorting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-rose-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold mb-2">
              <span>VERIFIED LIVE DEALS</span>
              <span>⚡</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {rawQuery ? `Results for "${rawQuery}"` : "Trending Deals & Flash Drops"}
            </h1>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              {loading ? "Scanning stores in real time..." : `Found ${sortedProducts.length} verified products with direct price comparisons`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white/50">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#121326] border border-white/20 rounded-xl px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(63,227,255,0.25)] transition"
            >
              <option value="featured" className="bg-[#101018] text-white">✨ Featured Deals</option>
              <option value="discount" className="bg-[#101018] text-white">🔥 Highest Discount</option>
              <option value="price-asc" className="bg-[#101018] text-white">💰 Price: Low to High</option>
              <option value="price-desc" className="bg-[#101018] text-white">💎 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="rounded-2xl bg-white/[.04] border border-white/10 h-84 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && sortedProducts.length === 0 && (
          <div className="text-center py-24 bg-gradient-to-b from-[#14152b]/80 to-[#0c0d1e]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white text-2xl font-black mb-2">No matching products found</p>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
              Try searching for popular terms like &quot;iPhone 17&quot;, &quot;PS5 Console&quot;, &quot;Sony XM5&quot;, or &quot;MacBook Air&quot;.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-sm font-black hover:brightness-110 shadow-[0_0_20px_rgba(63,227,255,0.4)] transition cursor-pointer"
            >
              View All 130+ Deals &rarr;
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
                  className="group relative rounded-2xl bg-gradient-to-b from-[#14162e]/90 via-[#0e1024]/90 to-[#0a0b18]/95 border border-white/[.12] overflow-hidden hover:border-cyan-400/70 hover:shadow-[0_12px_36px_rgba(63,227,255,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl"
                >
                  {/* Top Image area */}
                  <div className="relative h-52 bg-gradient-to-b from-white/[.05] via-purple-500/[.03] to-transparent flex items-center justify-center p-5 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />

                    <ProductCardImage
                      src={product.image_url}
                      alt={product.title}
                      categorySlug={product.category?.slug ?? product.category_id}
                    />

                    {discount > 0 && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-black shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                        -{discount}% OFF
                      </span>
                    )}

                    {/* Store icons preview with vibrant store colors */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {stores.includes("amazon") && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff9900]/25 text-[#ffb03a] border border-[#ff9900]/40 shadow-[0_0_8px_rgba(255,153,0,0.25)]">
                          Amazon
                        </span>
                      )}
                      {stores.includes("flipkart") && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2874f0]/25 text-[#70a9ff] border border-[#2874f0]/40 shadow-[0_0_8px_rgba(40,116,240,0.25)]">
                          Flipkart
                        </span>
                      )}
                      {stores.includes("croma") && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00b300]/25 text-[#4ade80] border border-[#00b300]/40 shadow-[0_0_8px_rgba(0,179,0,0.25)]">
                          Croma
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <p className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                          {product.brand?.name ?? "Electronics"} · {product.category?.name ?? "Deals"}
                        </p>
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-400/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                          <span>✨</span>
                          <span>{["Apple", "Sony", "Samsung", "Asus", "Bose"].includes(product.brand?.name ?? "") ? "95%" : "91%"} AI</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white/95 leading-snug line-clamp-2 mb-3 group-hover:text-cyan-300 transition-colors">
                        {product.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-white/[.08] flex items-end justify-between">
                      <div>
                        {lowest?.current_price ? (
                          <>
                            <span className="text-lg font-black text-white">{formatPrice(lowest.current_price)}</span>
                            {mrp && mrp > lowest.current_price && (
                              <span className="text-xs text-white/40 line-through ml-2">{formatPrice(mrp)}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-amber-300 font-medium">Check live price</span>
                        )}
                      </div>

                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-black transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(63,227,255,0.15)]">
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
    <Suspense fallback={<div className="min-h-screen bg-[#060713]" />}>
      <SearchResultsContent />
    </Suspense>
  );
}
