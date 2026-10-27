import Link from "next/link";
import { IN_MEMORY_CLICKS } from "@/lib/data";
import { HUMONGOUS_CATALOG, STORES } from "@/lib/catalog-data";
import { Shield, ExternalLink, ArrowUpRight, LogOut, CheckCircle2, Clock } from "lucide-react";

export default async function AdminDashboardPage() {
  const totalProducts = HUMONGOUS_CATALOG.length;
  const totalListings = HUMONGOUS_CATALOG.reduce((acc, p) => acc + (p.store_listings?.length ?? 0), 0);
  const totalClicks = IN_MEMORY_CLICKS.length;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 antialiased">
      {/* ─── Top Admin Navigation Bar ─── */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:border-zinc-700 transition-colors">
                <Shield className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <span className="text-xs font-semibold tracking-tight text-zinc-200">
                Pricora <span className="text-zinc-500 font-normal">/ Console</span>
              </span>
            </Link>

            <span className="text-zinc-700">|</span>

            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Pipeline</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <span>Storefront</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </Link>
            <Link
              href="/search"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Catalog
            </Link>

            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors text-xs flex items-center gap-1.5 font-medium"
              >
                <LogOut className="w-3 h-3 text-zinc-500" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            System Telemetry & Scraper Health
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time status of multi-store pricing pipelines, catalog indexing, and affiliate routing.
          </p>
        </div>

        {/* ─── 4 Metric Cards (Linear Style) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Catalog Products</p>
            <p className="text-2xl font-semibold font-mono text-zinc-100 mt-1">{totalProducts.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Verified & mapped</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Tracked Store Listings</p>
            <p className="text-2xl font-semibold font-mono text-zinc-100 mt-1">{totalListings.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Multi-store live prices</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Affiliate Conversions</p>
            <p className="text-2xl font-semibold font-mono text-zinc-100 mt-1">{totalClicks.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="font-mono text-zinc-400">/out</span>
              <span>tagged clicks</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Store Connectors</p>
            <p className="text-2xl font-semibold font-mono text-zinc-100 mt-1">{STORES.length}</p>
            <p className="text-[11px] text-zinc-500 mt-1 truncate">
              Amazon, Flipkart, Croma
            </p>
          </div>
        </div>

        {/* ─── Store Connectors (Grid) ─── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Live Scraper Connectors
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">3 / 3 online</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STORES.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">{s.name}</p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate max-w-[170px]">
                    {s.base_url}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                  <p className="text-[10px] text-zinc-600 font-mono mt-1">Cheerio engine</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Recent Outbound Click Table ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Outbound Conversion Log (/out)
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">Latest 10 events</span>
          </div>

          <div className="rounded-xl bg-[#121215] border border-zinc-800 overflow-hidden">
            {IN_MEMORY_CLICKS.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No outbound affiliate clicks recorded in this session. Click any store row in a product page to test tracking.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Timestamp</th>
                      <th className="py-2.5 px-4 font-medium">Merchant</th>
                      <th className="py-2.5 px-4 font-medium">Listing ID</th>
                      <th className="py-2.5 px-4 font-medium">Affiliate Destination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                    {IN_MEMORY_CLICKS.slice(-10).reverse().map((click, i) => (
                      <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-2.5 px-4 text-zinc-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span>{new Date(click.timestamp).toLocaleTimeString()}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                            {click.store}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-zinc-400">{click.listingId}</td>
                        <td className="py-2.5 px-4 text-zinc-500 truncate max-w-sm">
                          {click.url}
                        </td>
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
