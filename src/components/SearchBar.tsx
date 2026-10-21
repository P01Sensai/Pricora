"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Suggestion {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  image_url: string | null;
  lowest_price: number | null;
  store_count: number;
}

function formatPrice(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  variant?: "hero" | "header";
  className?: string;
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search smartphones, laptops, appliances...",
  variant = "hero",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external defaultValue change
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Debounced live fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/suggestions?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data.suggestions ?? []);
          setIsOpen(true);
          setSelectedIndex(-1);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      setIsOpen(false);
      router.push(`/product/${suggestions[selectedIndex].slug}`);
    } else if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Outer Glow in Hero mode */}
      {isHero && (
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400 via-rose-500 via-purple-500 to-cyan-400 opacity-25 blur-xl group-hover:opacity-45 transition duration-500 pointer-events-none" />
      )}

      {/* Main Form Bar */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center w-full transition-all duration-200 overflow-hidden ${
          isHero
            ? "h-16 md:h-20 bg-[#0d0d18]/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.2)] focus-within:border-cyan-400/70 focus-within:ring-2 focus-within:ring-cyan-400/25"
            : "h-11 bg-[#131428]/90 border border-white/20 rounded-xl focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(63,227,255,0.25)] focus-within:ring-1 focus-within:ring-cyan-400/40"
        }`}
      >
        <div className={`text-white/40 flex items-center ${isHero ? "pl-6 md:pl-8" : "pl-3.5"}`}>
          <svg
            className={isHero ? "w-6 h-6 md:w-7 md:h-7" : "w-4 h-4"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.8-3.8" />
          </svg>
        </div>

        <input
          name="q"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full h-full bg-transparent text-white placeholder:text-white/30 outline-none ${
            isHero ? "px-4 text-base md:text-xl" : "px-3 text-sm"
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="p-2 text-white/30 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {isHero && (
          <button
            type="submit"
            className="h-full px-6 md:px-10 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 text-black font-black text-sm md:text-base hover:brightness-110 shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Search Deals</span>
            <svg className="w-4 h-4 text-black stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </form>

      {/* ─── Instant Suggestions Dropdown ─── */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2.5 z-[100] rounded-2xl bg-[#08080e]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2">
            <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-white/40 tracking-wider uppercase border-b border-white/[.06]">
              <span>Instant Suggestions</span>
              {isLoading && <span className="text-cyan-400 animate-pulse">Searching…</span>}
            </div>

            <div className="mt-1 space-y-1">
              {suggestions.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      isSelected
                        ? "bg-white/[.08] text-white border border-cyan-400/40"
                        : "text-white/80 hover:bg-white/[.04] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      {/* Image Thumbnail */}
                      <div className="w-10 h-10 rounded-lg bg-white/[.04] border border-white/[.06] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xs">📦</span>
                        )}
                      </div>

                      {/* Text info */}
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-cyan-400/70 tracking-wider uppercase">
                          {item.brand} · {item.category}
                        </p>
                        <p className="text-xs font-medium text-white/95 truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right shrink-0">
                      {item.lowest_price ? (
                        <>
                          <span className="text-sm font-bold text-white block">
                            {formatPrice(item.lowest_price)}
                          </span>
                          <span className="text-[9px] text-white/35">
                            {item.store_count} stores
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-white/30">View price</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer View All Search Results */}
          <div className="p-2.5 bg-white/[.02] border-t border-white/[.06] text-center">
            <button
              onClick={() => handleSubmit()}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition inline-flex items-center gap-1.5"
            >
              <span>See all matching deals for &quot;{query}&quot;</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
