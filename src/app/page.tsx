"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

// Extract the 3D Carousel into a reusable background component with vibrant illumination
function BackgroundCarousel() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let phase = 0;
    let last = performance.now();
    let frame: number;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const tick = (t: number) => {
      if (!ringRef.current) return;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (!mql.matches) phase -= 2.5 * dt;

      const cards = ringRef.current.children;
      for (let i = 0; i < 20; i++) {
        const card = cards[i] as HTMLElement;
        const a = (((i * 18 + phase) % 360) + 540) % 360 - 180;

        if (Math.abs(a) > 90) {
          card.style.visibility = "hidden";
          continue;
        }
        card.style.visibility = "visible";

        const r = (a * Math.PI) / 180;
        const c = Math.cos(r);
        card.style.transform = `translate3d(${1200 * Math.sin(r)}px, 0, ${1200 * (1 - c)}px) rotateY(${-a}deg)`;
        card.style.opacity = `${Math.max(0, 1 - Math.abs(a) / 90)}`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const IMAGES = [
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110422_0fc34393-7417-41b0-a200-43fd2b08a37f.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_ba46182e-43bc-43a8-9007-a8234acf442d.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_06cfbb84-6f96-48f6-be45-e03516510e48.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110422_634bf390-f171-4f5d-9151-0d2c86c26e7b.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_0cfe058d-db0e-4ee6-9708-7a297cc11a7a.png",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1400px] h-[600px]"
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      >
        <div ref={ringRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 w-[200px] h-[300px] -ml-[100px] -mt-[150px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl"
              style={{ backfaceVisibility: "hidden", willChange: "transform" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES[i % IMAGES.length]} alt="" className="w-full h-full object-cover mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030308_75%)]" />
    </div>
  );
}

// Top Curated Festive Showcase Products with Verified Images & Live Deals
const FEATURED_DEALS = [
  {
    id: "f-1",
    title: "Apple iPhone 17 Pro (128GB)",
    subtitle: "Natural Titanium · A19 Pro Chip",
    slug: "apple-iphone-17-pro-128gb",
    price: "₹1,27,999",
    mrp: "₹1,34,999",
    discount: "5% OFF",
    badge: "🔥 NEW LAUNCH",
    badgeColor: "from-amber-500 to-orange-500 text-black",
    store: "Amazon India",
    storeColor: "text-[#ff9900]",
    image: "https://m.media-amazon.com/images/I/81c50PU+lpL._SX679_.jpg",
  },
  {
    id: "f-2",
    title: "Apple iPhone 16 (128GB)",
    subtitle: "Ultramarine · Camera Control",
    slug: "apple-iphone-16-128gb-ultramarine",
    price: "₹76,999",
    mrp: "₹79,900",
    discount: "SAVE ₹12,901",
    badge: "⚡ MEGA DROP",
    badgeColor: "from-rose-500 to-pink-500 text-white",
    store: "Flipkart",
    storeColor: "text-[#2874f0]",
    image: "https://m.media-amazon.com/images/I/61eYPkT2zZL._AC_UY218_.jpg",
  },
  {
    id: "f-3",
    title: "Sony PlayStation 5 Slim Disc",
    subtitle: "1TB SSD · 4K HDR Ray Tracing",
    slug: "sony-playstation-5-console-slim-disc",
    price: "₹48,990",
    mrp: "₹54,990",
    discount: "-18% OFF",
    badge: "🎮 GAMING PICK",
    badgeColor: "from-emerald-400 to-teal-500 text-black",
    store: "Amazon India",
    storeColor: "text-[#ff9900]",
    image: "https://m.media-amazon.com/images/I/51051FiD9UL._SX679_.jpg",
  },
  {
    id: "f-4",
    title: "Sony WH-1000XM5 ANC Headphones",
    subtitle: "30Hr Battery · Industry Best ANC",
    slug: "sony-wh-1000xm5-wireless-headphones-black",
    price: "₹27,990",
    mrp: "₹34,990",
    discount: "-20% OFF",
    badge: "🎧 ALL-TIME LOW",
    badgeColor: "from-cyan-400 to-blue-500 text-black",
    store: "Amazon India",
    storeColor: "text-[#ff9900]",
    image: "https://m.media-amazon.com/images/I/51SKmu2G9FL._SX679_.jpg",
  },
  {
    id: "f-5",
    title: "Apple MacBook Air 13-inch (M3)",
    subtitle: "8GB RAM · 256GB SSD · Space Grey",
    slug: "apple-macbook-air-13-m3-space-grey",
    price: "₹94,990",
    mrp: "₹1,14,900",
    discount: "SAVE ₹20,000",
    badge: "💻 HOT DEAL",
    badgeColor: "from-purple-500 to-indigo-500 text-white",
    store: "Flipkart",
    storeColor: "text-[#2874f0]",
    image: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_UY218_.jpg",
  },
  {
    id: "f-6",
    title: "Apple iPhone 15 Pro Max (256GB)",
    subtitle: "Natural Titanium · 5x Telephoto",
    slug: "apple-iphone-17-pro-max-256gb",
    price: "₹1,34,900",
    mrp: "₹1,59,900",
    discount: "SAVE ₹25,000",
    badge: "🪔 FESTIVE HERO",
    badgeColor: "from-amber-400 via-rose-500 to-purple-600 text-white",
    store: "Amazon India",
    storeColor: "text-[#ff9900]",
    image: "https://m.media-amazon.com/images/I/71657TiFeHL._SX679_.jpg",
  },
];

// Vibrant Category Launchpad
const CATEGORY_CARDS = [
  {
    title: "Festive Mega Deals",
    count: "45+ Offers",
    icon: "🪔",
    tag: "Up to 65% OFF",
    href: "/search?q=festive",
    glow: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "border-amber-500/40 hover:border-amber-400",
    accent: "text-amber-300",
    badge: "bg-amber-400/20 text-amber-300 border-amber-400/40",
  },
  {
    title: "Smartphones",
    count: "32 Flagships",
    icon: "📱",
    tag: "iPhone 17 & Galaxy",
    href: "/search?q=smartphones",
    glow: "from-fuchsia-500/20 via-pink-500/10 to-transparent",
    border: "border-fuchsia-500/40 hover:border-fuchsia-400",
    accent: "text-fuchsia-300",
    badge: "bg-fuchsia-400/20 text-fuchsia-300 border-fuchsia-400/40",
  },
  {
    title: "Laptops & PCs",
    count: "28 Workstations",
    icon: "💻",
    tag: "M3 & RTX Gaming",
    href: "/search?q=laptops",
    glow: "from-cyan-500/20 via-blue-500/10 to-transparent",
    border: "border-cyan-500/40 hover:border-cyan-400",
    accent: "text-cyan-300",
    badge: "bg-cyan-400/20 text-cyan-300 border-cyan-400/40",
  },
  {
    title: "Audio & Headphones",
    count: "24 True Wireless",
    icon: "🎧",
    tag: "Sony XM5 & AirPods",
    href: "/search?q=audio",
    glow: "from-rose-500/20 via-orange-500/10 to-transparent",
    border: "border-rose-500/40 hover:border-rose-400",
    accent: "text-rose-300",
    badge: "bg-rose-400/20 text-rose-300 border-rose-400/40",
  },
  {
    title: "Gaming & VR",
    count: "18 Consoles",
    icon: "🎮",
    tag: "PS5 Slim & Rog",
    href: "/search?q=gaming",
    glow: "from-emerald-500/20 via-teal-500/10 to-transparent",
    border: "border-emerald-500/40 hover:border-emerald-400",
    accent: "text-emerald-300",
    badge: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
  },
  {
    title: "Smart Appliances",
    count: "19 Smart Devices",
    icon: "📺",
    tag: "4K OLEDs & More",
    href: "/search?q=appliances",
    glow: "from-indigo-500/20 via-purple-500/10 to-transparent",
    border: "border-indigo-500/40 hover:border-indigo-400",
    accent: "text-indigo-300",
    badge: "bg-indigo-400/20 text-indigo-300 border-indigo-400/40",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#030308] text-white overflow-x-hidden font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* ─── Vibrant Ambient Aurora Glow Orbs ─── */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[550px] bg-rose-500/[0.14] rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-amber-500/[0.13] rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-10 right-1/4 w-[650px] h-[550px] bg-cyan-500/[0.14] rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[800px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/[0.12] rounded-full blur-[200px] pointer-events-none z-0" />

      {/* ─── Top Festive Announcement Ticker Bar ─── */}
      <div className="relative z-50 bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-purple-500/25 border-b border-amber-500/25 py-2.5 px-4 backdrop-blur-xl">
        <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[11px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              🔥 FESTIVE PRICE CRASH
            </span>
            <span className="text-white/90 font-medium">
              Amazon Great Indian Festival & Flipkart Big Billion Days price drops are live!
            </span>
          </div>

          <Link
            href="/search?q=festive"
            className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition underline underline-offset-4"
          >
            <span>Claim 140+ Festive Drops 🪔</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* ─── Floating Radiant Glass Navbar ─── */}
      <header className="relative z-50 w-full p-4 md:p-6 flex justify-center">
        <div className="flex items-center justify-between w-full max-w-[1360px] h-16 px-6 rounded-full bg-[#0a0a14]/85 border border-white/10 backdrop-blur-2xl shadow-[0_0_35px_rgba(244,63,94,0.15),0_8px_32px_rgba(0,0,0,0.6)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg width="26" height="26" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="sw" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ff7170" />
                  <stop offset="35%" stopColor="#ffe57f" />
                  <stop offset="70%" stopColor="#35d8ff" />
                  <stop offset="100%" stopColor="#bd6aff" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="6.6" fill="url(#sw)" />
              <circle cx="24" cy="24" r="2.6" fill="#fff" />
            </svg>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-200 via-rose-300 to-cyan-300 text-transparent bg-clip-text group-hover:brightness-125 transition">
              PRICORA
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            <Link
              href="/search?q=festive"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:brightness-125 transition"
            >
              <span>Festive Deals</span>
              <span>🪔</span>
            </Link>
            <Link href="/search?q=smartphones" className="text-white/70 hover:text-fuchsia-300 hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] transition">
              Smartphones 📱
            </Link>
            <Link href="/search?q=laptops" className="text-white/70 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition">
              Laptops 💻
            </Link>
            <Link href="/search?q=audio" className="text-white/70 hover:text-rose-300 hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] transition">
              Audio 🎧
            </Link>
            <Link href="/search?q=gaming" className="text-white/70 hover:text-emerald-300 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] transition">
              Gaming 🎮
            </Link>
            <Link href="/search?q=appliances" className="text-white/70 hover:text-violet-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition">
              Appliances 📺
            </Link>
          </nav>

          <Link
            href="/search"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 text-black text-xs md:text-sm font-black shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:brightness-110 hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] transition-all flex items-center gap-1.5"
          >
            <span>Explore 140+ Deals</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </header>

      {/* ─── Main Hero Content with 3D Background Carousel ─── */}
      <main className="relative z-20 w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 pt-4 pb-16">
        {/* 3D Background Carousel strictly centered behind Hero text & search */}
        <BackgroundCarousel />
        
        {/* Shimmering Festive Glow Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-cyan-500/15 border border-amber-400/40 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shadow-[0_0_10px_#f59e0b]" />
          <span className="text-xs font-bold text-amber-200">
            ✨ FESTIVE PRICE TRACKING · Up to 65% Price Drops Live
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-center font-black text-5xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tight text-white mb-6 leading-none select-none">
          FIND THE BEST <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7170] via-[#ffe57f] via-[#46e8b2] via-[#35d8ff] to-[#bd6aff] drop-shadow-[0_0_40px_rgba(244,63,94,0.35)]">
            PRODUCT DEALS
          </span>
        </h1>
        
        <p className="text-center text-white/60 text-base md:text-xl max-w-2xl mb-10 leading-relaxed font-normal">
          Real-time price comparisons across <span className="text-white font-semibold">Amazon India</span>, <span className="text-white font-semibold">Flipkart</span> & <span className="text-white font-semibold">Croma</span>.
          Over 140+ verified festive deals tracked live with 60-day price drop history.
        </p>

        {/* Massive Vibrant Search Bar with Live Instant Autocomplete */}
        <div className="w-full max-w-3xl relative z-30">
          <SearchBar
            variant="hero"
            placeholder="Search iPhone 17, PS5, MacBook, Sony XM5, 4K OLED TV..."
          />
        </div>

        {/* Colorful Trending Quick Pills */}
        <div className="flex flex-wrap justify-center items-center gap-2.5 mt-8 max-w-3xl">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1">
            <span>🔥</span> Hot Searches:
          </span>
          {[
            { name: "iPhone 17 Pro", color: "hover:border-amber-400 hover:text-amber-300 hover:bg-amber-400/10" },
            { name: "iPhone 16", color: "hover:border-rose-400 hover:text-rose-300 hover:bg-rose-400/10" },
            { name: "Samsung S24 Ultra", color: "hover:border-purple-400 hover:text-purple-300 hover:bg-purple-400/10" },
            { name: "MacBook Air M3", color: "hover:border-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10" },
            { name: "PlayStation 5 Slim", color: "hover:border-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" },
            { name: "Sony WH-1000XM5", color: "hover:border-blue-400 hover:text-blue-300 hover:bg-blue-400/10" },
            { name: "Festive Deals 🪔", color: "hover:border-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/15 font-bold" },
          ].map((item) => (
            <Link
              key={item.name}
              href={`/search?q=${encodeURIComponent(item.name.replace(" 🪔", ""))}`}
              className={`text-xs px-3 py-1.5 rounded-full bg-white/[.04] border border-white/[.08] text-white/80 transition-all ${item.color}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </main>

      {/* ─── Continuous Live Deal Ticker (Urgency & Frenzy) ─── */}
      <section className="relative z-10 w-full bg-[#0a0a14]/90 border-y border-white/10 py-3 overflow-hidden backdrop-blur-xl">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {[
            "🔥 iPhone 16 (128GB): ₹76,999 on Flipkart (-12% Instant Drop)",
            "🎧 Sony WH-1000XM5: Flat ₹9,000 Off on Amazon (All-Time Low ₹27,990)",
            "⚡ PS5 Slim Disc Edition: ₹48,990 festive drop with Free Express Delivery",
            "💻 MacBook Air M3: ₹20,000 Instant Savings applied",
            "📱 Samsung Galaxy S24 Ultra: Extra ₹12,000 Exchange Bonus",
            "🪔 Festive Flash Drops: Over 140+ Verified Deals Scraped Real-Time",
          ].map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-3 text-xs md:text-sm font-semibold text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{item}</span>
              <span className="text-white/20">|</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Colorful Category Quick-Launch Grid (Vibrant Visual Mood) ─── */}
      <section className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-rose-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
              <span>EXPLORE BY CATEGORY</span>
              <span>⚡</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Shop Festive Categories With Guaranteed Drops
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className={`group relative rounded-2xl bg-gradient-to-b ${cat.glow} border ${cat.border} p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${cat.badge}`}>
                  {cat.tag}
                </span>
              </div>
              <div>
                <h3 className={`font-bold text-sm text-white group-hover:${cat.accent} transition-colors`}>
                  {cat.title}
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── "Today's Hottest Festive Drops" Interactive Showcase ─── */}
      <section className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold mb-3">
              <span>LIVE SCRAMBLE DEALS</span>
              <span>🔥</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Top Price Drops Happening Right Now
            </h2>
            <p className="text-sm text-white/50 mt-1">
              Lowest price verified across Amazon & Flipkart within the last 2 hours.
            </p>
          </div>

          <Link
            href="/search?q=festive"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-black text-xs sm:text-sm font-black hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>See All 140+ Deals</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-5">
          {FEATURED_DEALS.map((deal) => (
            <Link
              key={deal.id}
              href={`/product/${deal.slug}`}
              className="group relative rounded-2xl bg-[#0e0e1a]/80 border border-white/10 hover:border-cyan-400/50 hover:bg-[#131324] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(63,227,255,0.2)]"
            >
              {/* Image Area */}
              <div className="relative h-48 bg-gradient-to-b from-white/[.04] to-transparent flex items-center justify-center p-4 overflow-hidden">
                <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${deal.badgeColor} shadow-md`}>
                  {deal.badge}
                </span>

                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                  {deal.discount}
                </span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deal.image}
                  alt={deal.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="max-h-36 max-w-36 object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white/90 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {deal.title}
                  </h3>
                  <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{deal.subtitle}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[.06] flex items-end justify-between">
                  <div>
                    <span className="text-lg font-black text-white">{deal.price}</span>
                    <span className="block text-[10px] text-white/35 line-through">{deal.mrp}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/[.05] border border-white/[.08] ${deal.storeColor}`}>
                    {deal.store}
                  </span>
                </div>

                <button
                  type="button"
                  className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold group-hover:bg-cyan-400 group-hover:text-black transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Compare & Buy</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── "Why Buy Via Pricora" Trust Section ─── */}
      <section className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-amber-900/20 border border-white/10 p-8 md:p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(244,63,94,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shrink-0">
                ⚡
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Live Dual-Store Ingestion</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Real-time web scrapers track midnight price crashes across Amazon India and Flipkart before stock runs out.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shrink-0">
                📉
              </div>
              <div>
                <h4 className="font-bold text-base text-white">60-Day Price History</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Never fall for fake festive discounts. Our interactive price charts show you the authentic historical low.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl shadow-lg shrink-0">
                🛡️
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Guaranteed Direct Links</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Zero markups, zero hidden fees. One-click instant redirect directly to official merchant checkouts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 w-full border-t border-white/[.07] bg-[#05050c] py-8 text-center text-xs text-white/40">
        <p>© 2026 Pricora Inc. Real-Time Price Comparison Engine. Amazon & Flipkart are trademarks of their respective owners.</p>
      </footer>

    </div>
  );
}
