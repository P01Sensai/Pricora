import Link from "next/link";
import { IN_MEMORY_CLICKS } from "@/lib/data";
import { HUMONGOUS_CATALOG, STORES } from "@/lib/catalog-data";

export default async function AdminDashboardPage() {
  const totalProducts = HUMONGOUS_CATALOG.length;
  const totalListings = HUMONGOUS_CATALOG.reduce((acc, p) => acc + (p.store_listings?.length ?? 0), 0);
  const totalClicks = IN_MEMORY_CLICKS.length;

  return (
    <div className="min-h-screen bg-[#020204] text-white font-[Poppins,Inter,system-ui,sans-serif]">
      {/* ─── Top Admin Bar ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#020204]/85 border-b border-white/[.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 48 48">
                <defs><linearGradient id="admg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#8ef4ff"/><stop offset="50%" stopColor="#35d8ff"/><stop offset="100%" stopColor="#0a86d8"/></linearGradient></defs>
                <circle cx="24" cy="24" r="6.6" fill="url(#admg)"/><circle cx="24" cy="24" r="2.6" fill="#fff"/>
              </svg>
              <span className="font-black text-base tracking-tight">PRICORA</span>
            </Link>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
              ADMIN PANEL
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="text-white/60 hover:text-white transition">Main Site</Link>
            <Link href="/search" className="text-white/60 hover:text-white transition">Search Catalog</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">System Health & Tracking Dashboard</h1>
          <p className="text-xs text-white/50 mt-1">Real-time status of scrapers, catalog ingestion, and affiliate click conversions.</p>
        </div>

        {/* ─── Metric Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white/[.025] border border-white/[.07]">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Total Catalog Products</p>
            <p className="text-3xl font-extrabold text-white mt-2">{totalProducts}</p>
            <p className="text-[11px] text-cyan-400/80 mt-1">Verified & mapped</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[.025] border border-white/[.07]">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Tracked Store Listings</p>
            <p className="text-3xl font-extrabold text-white mt-2">{totalListings}</p>
            <p className="text-[11px] text-emerald-400/80 mt-1">Multi-store live prices</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[.025] border border-white/[.07]">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Outbound Affiliate Clicks</p>
            <p className="text-3xl font-extrabold text-white mt-2">{totalClicks}</p>
            <p className="text-[11px] text-purple-400/80 mt-1">Tracked & tagged (/out)</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[.025] border border-white/[.07]">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Active Store Connectors</p>
            <p className="text-3xl font-extrabold text-white mt-2">{STORES.length}</p>
            <p className="text-[11px] text-amber-400/80 mt-1">Amazon, Flipkart, Croma</p>
          </div>
        </div>

        {/* ─── Store Connector Health ─── */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Store Scraper Health Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STORES.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-white/[.025] border border-white/[.07] flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{s.base_url}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-[10px] font-bold">
                    ONLINE
                  </span>
                  <p className="text-[9px] text-white/30 mt-1">Cheerio engine</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Recent Affiliate Click Log ─── */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3">
            Recent Affiliate Outbound Clicks
          </h2>
          <div className="rounded-2xl bg-white/[.025] border border-white/[.07] overflow-hidden">
            {IN_MEMORY_CLICKS.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs">
                No outbound affiliate clicks recorded yet. Click on any store price row in a product page to test!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[.02] border-b border-white/[.06] text-white/40 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3 pl-4">Time</th>
                      <th className="p-3">Store</th>
                      <th className="p-3">Listing ID</th>
                      <th className="p-3">Tagged Target URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[.04]">
                    {IN_MEMORY_CLICKS.slice(-10).reverse().map((click, i) => (
                      <tr key={i} className="hover:bg-white/[.02]">
                        <td className="p-3 pl-4 text-white/50">{new Date(click.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3 font-semibold text-cyan-400">{click.store}</td>
                        <td className="p-3 font-mono text-[11px] text-white/70">{click.listingId}</td>
                        <td className="p-3 text-white/40 truncate max-w-xs">{click.url}</td>
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
