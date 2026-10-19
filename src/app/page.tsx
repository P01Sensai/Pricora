"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Extract the 3D Carousel into a reusable background component
function BackgroundCarousel() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let phase = 0;
    let last = performance.now();
    let frame: number;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = (t: number) => {
      if (!ringRef.current) return;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (!mql.matches) phase -= 2.5 * dt;

      const cards = ringRef.current.children;
      for (let i = 0; i < 20; i++) {
        const card = cards[i] as HTMLElement;
        const a = (((i * 18 + phase) % 360) + 540) % 360 - 180;
        
        // Hide cards that are in the back to save performance
        if (Math.abs(a) > 90) {
          card.style.visibility = 'hidden';
          continue;
        }
        card.style.visibility = 'visible';
        
        const r = a * Math.PI / 180;
        const c = Math.cos(r);
        // Spin in a wide circle
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
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_0cfe058d-db0e-4ee6-9708-7a297cc11a7a.png"
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1400px] h-[600px]"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        <div ref={ringRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute left-1/2 top-1/2 w-[200px] h-[300px] -ml-[100px] -mt-[150px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl"
              style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES[i % IMAGES.length]} alt="" className="w-full h-full object-cover mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020204_70%)]" />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get('q');
    if (query) router.push(`/search?q=${encodeURIComponent(query as string)}`);
  };

  return (
    <div className="relative min-h-screen bg-[#020204] text-white overflow-hidden font-sans flex flex-col">
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(25,127,255,0)_38%,rgba(25,127,255,0.04)_54%,rgba(25,127,255,0.05)_68%,transparent_100%)] z-0" />
      
      {/* 3D Carousel in Background */}
      <BackgroundCarousel />

      {/* Glass Navbar */}
      <header className="relative z-50 w-full p-4 md:p-6 flex justify-center">
        <div className="flex items-center justify-between w-full max-w-5xl h-16 px-6 rounded-full bg-white/[.01] border border-white/[.1] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 48 48">
              <defs><linearGradient id="sw" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#8ef4ff"/><stop offset="50%" stopColor="#35d8ff"/><stop offset="100%" stopColor="#0a86d8"/></linearGradient></defs>
              <circle cx="24" cy="24" r="6.6" fill="url(#sw)"/><circle cx="24" cy="24" r="2.6" fill="#fff"/>
            </svg>
            <span className="font-black text-lg tracking-tight">PRICORA</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            <Link href="/search?q=festive" className="text-amber-300 hover:text-amber-200 transition font-semibold">Festive Deals 🪔</Link>
            <Link href="/search?q=smartphones" className="hover:text-white transition">Smartphones</Link>
            <Link href="/search?q=laptops" className="hover:text-white transition">Laptops</Link>
            <Link href="/search?q=audio" className="hover:text-white transition">Audio</Link>
            <Link href="/search?q=gaming" className="hover:text-white transition">Gaming</Link>
            <Link href="/search?q=appliances" className="hover:text-white transition">Appliances</Link>
          </div>

          <Link href="/search" className="px-5 py-2 rounded-xl bg-gradient-to-t from-[#006180] to-[#3ec8e4] text-white text-sm font-semibold shadow-[0_0_15px_rgba(63,227,255,0.2)] hover:brightness-110 transition">
            Explore 130+ Deals
          </Link>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        
        {/* Glow Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[.03] border border-white/[.1] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#3fe3ff]" />
          <span className="text-xs font-medium text-white/90">Live Amazon & Flipkart Scraper Engine</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-center font-black text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-6 drop-shadow-[0_0_30px_rgba(130,180,255,0.2)] leading-none">
          FIND THE BEST <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400">PRODUCT DEALS</span>
        </h1>
        
        <p className="text-center text-white/50 text-base md:text-lg max-w-xl mb-12">
          Compare real-time prices across Amazon India, Flipkart, and Croma instantly. Over 130+ verified festive deals with live web scraping.
        </p>

        {/* Massive Search Bar (Functional) */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-20 blur-xl group-hover:opacity-40 transition duration-500" />
          <div className="relative flex items-center w-full h-16 md:h-20 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="pl-6 md:pl-8 text-white/40">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>
            </div>
            <input 
              name="q"
              type="text"
              required
              placeholder="Search iPhone 17, PS5, MacBook, Sony XM5..."
              className="w-full h-full bg-transparent px-4 text-base md:text-xl text-white placeholder:text-white/30 outline-none"
            />
            <button type="submit" className="h-full px-6 md:px-10 bg-cyan-500 text-black font-bold text-sm md:text-base hover:bg-cyan-400 transition-colors">
              Search
            </button>
          </div>
        </form>

        {/* Trending tags */}
        <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
          <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Trending Deals:</span>
          {["iPhone 17 Pro", "iPhone 16", "Samsung S24 Ultra", "MacBook Air M3", "PlayStation 5", "Sony XM5", "Festive Deals"].map(t => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="text-xs px-2.5 py-1 rounded-lg bg-white/[.04] border border-white/[.07] text-white/70 hover:text-cyan-300 hover:border-cyan-400/40 transition">
              {t}
            </Link>
          ))}
        </div>
      </main>

    </div>
  );
}
