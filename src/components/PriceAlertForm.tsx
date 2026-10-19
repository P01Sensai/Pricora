"use client";

import { useState } from "react";

export default function PriceAlertForm({ defaultPrice }: { defaultPrice?: string }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  if (subscribed) {
    return (
      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs">
        ✓ Alert set! We will notify you when price drops.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email..."
        className="flex-1 w-0 h-9 rounded-lg bg-white/[.05] border border-white/[.1] text-xs px-3 outline-none focus:border-cyan-400/50 text-white"
        required
      />
      <button
        type="submit"
        className="h-9 px-4 rounded-lg bg-cyan-400 text-black text-xs font-semibold hover:bg-cyan-300 transition shrink-0"
      >
        Notify
      </button>
    </form>
  );
}
