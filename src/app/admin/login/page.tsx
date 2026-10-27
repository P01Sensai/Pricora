"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

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
        setError(data.error || "Access denied. Invalid credentials.");
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
    <div className="relative min-h-screen bg-[#060713] text-white font-[Poppins,Inter,system-ui,sans-serif] flex flex-col items-center justify-center p-6 selection:bg-rose-500 selection:text-white overflow-hidden">
      {/* ─── Ambient Glow Orbs ─── */}
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[500px] bg-rose-500/[0.14] rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[500px] bg-cyan-500/[0.14] rounded-full blur-[180px] pointer-events-none" />

      {/* ─── Login Card ─── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <svg width="34" height="34" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="admlg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8ef4ff" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="7" fill="url(#admlg)" />
              <circle cx="24" cy="24" r="2.8" fill="#fff" />
            </svg>
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-cyan-300 via-rose-300 to-amber-300 bg-clip-text text-transparent group-hover:brightness-125 transition">
              PRICORA
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
              RESTRICTED CONSOLE
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-4 tracking-tight">Admin Authorization</h1>
          <p className="text-xs text-white/60 mt-1">
            Authenticate to access live telemetry, matching queues, and store scrapers.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-3xl bg-[#0d0e23]/80 border border-white/[.12] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,245,255,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Console Security Passkey
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator passkey..."
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[.05] border border-white/[.12] focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 text-white text-sm placeholder:text-white/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white/80 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(0,245,255,0.3)] transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[.08] text-center">
            <p className="text-[11px] text-white/40">
              Default password: <span className="font-mono text-cyan-300">pricora2026</span>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition">
            ← Return to Pricora Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
