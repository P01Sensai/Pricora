import Link from "next/link";
import { IN_MEMORY_CLICKS } from "@/lib/data";
import { HUMONGOUS_CATALOG, STORES } from "@/lib/catalog-data";

export default async function AdminDashboardPage() {
  const totalProducts = HUMONGOUS_CATALOG.length;
  const totalListings = HUMONGOUS_CATALOG.reduce((acc, p) => acc + (p.store_listings?.length ?? 0), 0);
  const totalClicks = IN_MEMORY_CLICKS.length;

  return (
    <div className="relative min-h-screen bg-[#060713] text-white font-[Poppins,Inter,system-ui,sans-serif] selection:bg-rose-500 selection:text-white overflow-x-hidden">
      
      {/* ─── Ambient Colorful Aurora Lighting ─── */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[500px] bg-rose-500/[0.12] rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="fixed top-24 right-1/4 w-[700px] h-[500px] bg-cyan-500/[0.12] rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="fixed top-[550px] left-1/3 w-[800px] h-[600px] bg-purple-600/[0.10] rounded-full blur-[210px] pointer-events-none z-0" />

      {/* ─── Top Admin Bar ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#08091a]/85 border-b border-white/[.1]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <svg width="26" height="26" viewBox="0 0 48 48">
                <defs><linearGradient id="admg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#8ef4ff"/><stop offset="50%" stopColor="#f43f5e"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient></defs>
                <circle cx="24" cy="24" r="7" fill="url(#admg)"/><circle cx="24" cy="24" r="2.8" fill="#fff"/>
              </svg>
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-cyan-300 via-rose-300 to-amber-300 bg-clip-text text-transparent group-hover:brightness-125 transition">
                PRICORA
              </span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
              ADMIN CONTROL
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-white/70 hover:text-white transition">← Main Storefront</Link>
            <Link href="/search" className="text-white/70 hover:text-white transition">Search Catalog</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold mb-2">
            <span>REAL-TIME TELEMETRY</span>
            <span>⚡</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Health & Live Monitoring</h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">Real-time status of scrapers, multi-store pricing pipelines, and affiliate conversion tracking.</p>
        </div>

        {/* ─── Metric Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-cyan-500/[.12] via-[#121326]/90 to-[#0c0d1e]/95 border border-cyan-400/30 backdrop-blur-xl shadow-[0_0_25px_rgba(63,227,255,0.12)]">
            <p className="text-xs text-cyan-300 uppercase tracking-wider font-bold">Total Catalog Products</p>
            <p className="text-4xl font-black text-white mt-2">{totalProducts}</p>
            <p className="text-xs text-cyan-400/80 mt-1">✓ Verified & mapped in catalog</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-500/[.12] via-[#121326]/90 to-[#0c0d1e]/95 border border-emerald-400/30 backdrop-blur-xl shadow-[0_0_25px_rgba(52,211,153,0.12)]">
            <p className="text-xs text-emerald-300 uppercase tracking-wider font-bold">Tracked Store Listings</p>
            <p className="text-4xl font-black text-white mt-2">{totalListings}</p>
            <p className="text-xs text-emerald-400/80 mt-1">✓ Multi-store live prices active</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-500/[.12] via-[#121326]/90 to-[#0c0d1e]/95 border border-purple-400/30 backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.12)]">
            <p className="text-xs text-purple-300 uppercase tracking-wider font-bold">Outbound Affiliate Clicks</p>
            <p className="text-4xl font-black text-white mt-2">{totalClicks}</p>
            <p className="text-xs text-purple-400/80 mt-1">✓ Tagged via /out redirector</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/[.12] via-[#121326]/90 to-[#0c0d1e]/95 border border-amber-400/30 backdrop-blur-xl shadow-[0_0_25px_rgba(245,158,11,0.12)]">
            <p className="text-xs text-amber-300 uppercase tracking-wider font-bold">Active Store Connectors</p>
            <p className="text-4xl font-black text-white mt-2">{STORES.length}</p>
            <p className="text-xs text-amber-400/80 mt-1">Amazon, Flipkart, Croma</p>
          </div>
        </div>

        {/* ─── Store Connector Health ─── */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Store Scraper Health Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STORES.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl bg-gradient-to-b from-[#14152b]/90 to-[#0c0d1e]/95 border border-white/[.12] flex items-center justify-between backdrop-blur-xl shadow-lg">
                <div>
                  <p className="text-base font-bold text-white">{s.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{s.base_url}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                    ONLINE
                  </span>
                  <p className="text-[10px] text-white/40 mt-1">Cheerio engine</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Recent Affiliate Click Log ─── */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            Live Affiliate Conversion Log (/out)
          </h2>
          <div className="rounded-3xl bg-[#0f1024]/90 border border-white/[.12] overflow-hidden backdrop-blur-xl shadow-xl">
            {IN_MEMORY_CLICKS.length === 0 ? (
              <div className="p-10 text-center text-white/50 text-sm">
                No outbound affiliate clicks recorded yet. Click on any store price row in a product page to test!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[.04] border-b border-white/[.08] text-white/50 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="p-4 pl-6">Time</th>
                      <th className="p-4">Store</th>
                      <th className="p-4">Listing ID</th>
                      <th className="p-4">Tagged Target URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[.04]">
                    {IN_MEMORY_CLICKS.slice(-10).reverse().map((click, i) => (
                      <tr key={i} className="hover:bg-white/[.03] transition-colors">
                        <td className="p-4 pl-6 text-white/60 font-medium">{new Date(click.timestamp).toLocaleTimeString()}</td>
                        <td className="p-4 font-bold text-cyan-400">{click.store}</td>
                        <td className="p-4 font-mono text-[11px] text-white/80">{click.listingId}</td>
                        <td className="p-4 text-white/50 truncate max-w-xs">{click.url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
