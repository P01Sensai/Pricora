"use client";

import { useState } from "react";
import type { Product, AIReviewSummary } from "@/lib/types";
import { answerCustomReviewQuestion } from "@/lib/ai-sentiment";

interface Props {
  product: Product;
  summary: AIReviewSummary;
}

export default function AIReviewSummaryCard({ product, summary }: Props) {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAsking(true);
    // Simulate natural AI thinking delay
    setTimeout(() => {
      const ans = answerCustomReviewQuestion(product, customQuestion);
      setCustomAnswer(ans);
      setIsAsking(false);
    }, 280);
  };

  const sentimentColor =
    summary.sentiment_score >= 90
      ? "text-emerald-400 border-emerald-500/50"
      : summary.sentiment_score >= 80
      ? "text-cyan-400 border-cyan-500/50"
      : "text-amber-400 border-amber-500/50";

  const recColor =
    summary.recommendation === "Strong Buy"
      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold"
      : summary.recommendation === "Recommended"
      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold"
      : "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold";

  return (
    <div className="relative rounded-2xl bg-[#121215]/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden">
      {/* ─── Header ─── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Pricora AI Sentiment Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Customer Review Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Synthesized across <span className="text-white font-bold">{summary.total_reviews_analyzed.toLocaleString("en-IN")}+ verified reviews</span> from Amazon India & Flipkart.
          </p>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg text-xs tracking-wider backdrop-blur-md ${recColor}`}>
            ★ {summary.recommendation}
          </span>
        </div>
      </div>

      {/* ─── Key Metrics & Score Ring ─── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-center mb-8">
        {/* Sentiment Gauge Ring */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08]">
          <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${sentimentColor}`}>
            <span className="text-2xl font-black">{summary.sentiment_score}%</span>
            <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">Positive</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-amber-400 text-sm font-bold">
            <span>{"★".repeat(Math.floor(summary.rating))}</span>
            <span className="text-xs text-white/90 font-bold ml-1">{summary.rating} / 5</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5">{summary.total_reviews_analyzed}+ buyers</span>
        </div>

        {/* AI Synthesized Verdict Quote */}
        <div className="p-5 sm:p-6 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
              <span>🤖</span>
              <span>AI Buying Verdict</span>
            </span>
          </div>
          <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
            &ldquo;{summary.verdict}&rdquo;
          </p>
        </div>
      </div>

      {/* ─── Pros & Cons Side-by-Side ─── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Pros */}
        <div className="rounded-xl bg-emerald-950/20 backdrop-blur-md border border-emerald-500/25 p-5">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs">
              ✓
            </span>
            <span>What Buyers Love (Verified Strengths)</span>
          </h3>
          <ul className="space-y-2.5">
            {summary.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-200 leading-normal">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-xl bg-rose-950/20 backdrop-blur-md border border-rose-500/25 p-5">
          <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-3.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-xs">
              !
            </span>
            <span>Critical Watchouts (Common Complaints)</span>
          </h3>
          <ul className="space-y-2.5">
            {summary.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-200 leading-normal">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Topic Breakdown Progress Bars ─── */}
      <div className="relative z-10 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 mb-8">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Topic-by-Topic Satisfaction Ratings</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {summary.topic_breakdown.map((t, idx) => {
            const pct = Math.round((t.score / 10) * 100);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-medium">{t.topic}</span>
                  <span className="font-bold text-white">{t.score} / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Interactive AI Q&A Assistant ─── */}
      <div className="relative z-10 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>💬</span>
              <span>Ask AI About This Product</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click a common question or ask anything about real-world performance, thermals, or accessories.
            </p>
          </div>
        </div>

        {/* Quick Question Chips */}
        {summary.common_questions && summary.common_questions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {summary.common_questions.map((q, i) => {
              const isSelected = activeQuestion === i && !customAnswer;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveQuestion(isSelected ? null : i);
                    setCustomAnswer(null);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-medium text-left backdrop-blur-md ${
                    isSelected
                      ? "bg-purple-500/20 text-purple-200 border-purple-500/40"
                      : "bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border-white/[0.08]"
                  }`}
                >
                  {q.question}
                </button>
              );
            })}
          </div>
        )}

        {/* Display Active Question Answer */}
        {activeQuestion !== null && !customAnswer && summary.common_questions[activeQuestion] && (
          <div className="p-4 rounded-xl bg-purple-950/20 backdrop-blur-md border border-purple-500/30 text-xs sm:text-sm text-zinc-200 leading-relaxed animate-in fade-in duration-200 mb-4">
            <span className="font-bold text-purple-300 block mb-1">
              Q: {summary.common_questions[activeQuestion].question}
            </span>
            <p className="text-zinc-300">{summary.common_questions[activeQuestion].answer}</p>
          </div>
        )}

        {/* Display Custom Question Answer */}
        {customAnswer && (
          <div className="p-4 rounded-xl bg-cyan-950/20 backdrop-blur-md border border-cyan-500/30 text-xs sm:text-sm text-zinc-200 leading-relaxed animate-in fade-in duration-200 mb-4">
            <span className="font-bold text-cyan-300 block mb-1">
              AI Review Intelligence:
            </span>
            <p className="text-zinc-300">{customAnswer}</p>
          </div>
        )}

        {/* Custom Question Input Form */}
        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="E.g. Is it good for low light photos? Does it come with a charger?"
            className="flex-1 w-0 h-10 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.1] text-xs px-4 outline-none focus:border-white/30 text-white placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={isAsking || !customQuestion.trim()}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold hover:brightness-110 transition shrink-0 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            {isAsking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Ask AI</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
