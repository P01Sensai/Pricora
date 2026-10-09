"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { StoreListing } from "@/lib/types";

const STORE_COLORS: Record<string, string> = {
  amazon: "#ff9900",
  flipkart: "#2874f0",
  croma: "#00b300",
};
const FALLBACK_COLORS = ["#3fe3ff", "#f59e0b", "#a855f7", "#ef4444", "#22c55e"];

function formatPrice(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface Props {
  listings: StoreListing[];
}

/**
 * Recharts-based interactive 60-day price history chart.
 * One line per store, with tooltips, legends, and the same dark aesthetic.
 */
export default function PriceHistoryChart({ listings }: Props) {
  // Build a unified time-series: { date, "Amazon": price, "Flipkart": price, ... }
  const dateMap: Record<string, Record<string, number>> = {};

  listings.forEach((listing) => {
    const storeName = listing.store?.name ?? "Store";
    (listing.price_history ?? []).forEach((ph) => {
      const day = ph.recorded_at.slice(0, 10); // YYYY-MM-DD
      if (!dateMap[day]) dateMap[day] = {};
      dateMap[day][storeName] = ph.price;
    });
  });

  const data = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stores]) => ({ date, ...stores }));

  const storeNames = [...new Set(listings.map((l) => l.store?.name ?? "Store"))];

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/30 text-sm">
        No price history available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,.05)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fill: "rgba(255,255,255,.35)", fontSize: 10 }}
          axisLine={{ stroke: "rgba(255,255,255,.06)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(v: number) => formatPrice(v)}
          tick={{ fill: "rgba(255,255,255,.35)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(8,12,20,.95)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 10,
            backdropFilter: "blur(12px)",
            fontSize: 12,
            color: "#fff",
            boxShadow: "0 12px 32px rgba(0,0,0,.5)",
          }}
          labelFormatter={(label: any) => formatDay(String(label))}
          formatter={(value: any, name: any) => [formatPrice(Number(value)), String(name)]}
          cursor={{ stroke: "rgba(63,227,255,.15)", strokeWidth: 1 }}
        />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,.6)", paddingTop: 8 }}
        />
        {storeNames.map((name, i) => {
          const slug = listings.find((l) => l.store?.name === name)?.store?.slug ?? "";
          const color = STORE_COLORS[slug] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
          return (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#020204" }}
              connectNulls
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
