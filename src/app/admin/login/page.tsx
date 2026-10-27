"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Incorrect passkey.");
        setLoading(false);
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col justify-between selection:bg-zinc-800 selection:text-zinc-100 antialiased">
      {/* ─── Top Minimal Header ─── */}
      <header className="w-full border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:border-zinc-700 transition-colors">
            <Shield className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-zinc-200">
            Pricora <span className="text-zinc-500 font-normal">/ Admin</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono text-zinc-400">system: active</span>
        </div>
      </header>

      {/* ─── Center Login Container ─── */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[360px]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
              Sign in to Console
            </h1>
            <p className="text-xs text-zinc-400 mt-1 leading-normal">
              Enter your administrative passkey to access live telemetry, scrapers, and pricing pipelines.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoFocus
                    className="w-full pl-9 pr-9 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-zinc-100 text-xs font-mono placeholder:text-zinc-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span className="text-[11px] leading-tight">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white text-zinc-950 text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Default key:</span>
              <code className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono">
                pricora2026
              </code>
            </div>
          </div>

          {/* Return link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
            >
              ← Back to storefront
            </Link>
          </div>
        </div>
      </main>

      {/* ─── Bottom Footer ─── */}
      <footer className="w-full border-t border-zinc-800/60 px-6 py-3 flex items-center justify-between text-[11px] text-zinc-500">
        <p>Pricora Multi-Store Intelligence Engine</p>
        <p className="font-mono">v1.2.0-prod</p>
      </footer>
    </div>
  );
}
