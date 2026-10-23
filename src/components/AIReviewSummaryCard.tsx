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
      ? "text-emerald-400 border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
      : summary.sentiment_score >= 80
      ? "text-cyan-400 border-cyan-400/40 shadow-[0_0_20px_rgba(63,227,255,0.35)]"
      : "text-amber-400 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.35)]";

  const recColor =
    summary.recommendation === "Strong Buy"
      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]"
      : summary.recommendation === "Recommended"
      ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_15px_rgba(63,227,255,0.4)]"
      : "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]";

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#12142d]/90 via-[#0e1026]/90 to-[#16122e]/90 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_35px_rgba(168,85,247,0.15)] overflow-hidden">
      
      {/* Background soft ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ─── Header ─── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[.08] pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Pricora AI Sentiment Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Customer Review Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Synthesized across <span className="text-white font-bold">{summary.total_reviews_analyzed.toLocaleString("en-IN")}+ verified reviews</span> from Amazon India & Flipkart.
          </p>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${recColor}`}>
            ★ {summary.recommendation}
          </span>
        </div>
      </div>

      {/* ─── Key Metrics & Score Ring ─── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-center mb-8">
        {/* Sentiment Gauge Ring */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[.03] border border-white/[.08]">
          <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${sentimentColor}`}>
            <span className="text-2xl font-black">{summary.sentiment_score}%</span>
            <span className="text-[9px] font-bold text-white/50 tracking-wider uppercase">Positive</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-amber-400 text-sm font-bold">
            <span>{"★".repeat(Math.floor(summary.rating))}</span>
            <span className="text-xs text-white/80 font-bold ml-1">{summary.rating} / 5</span>
          </div>
          <span className="text-[10px] text-white/40 mt-0.5">{summary.total_reviews_analyzed}+ buyers</span>
        </div>

        {/* AI Synthesized Verdict Quote */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#101229]/90 to-cyan-950/30 border border-white/10 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
              <span>🤖</span>
              <span>AI Buying Verdict</span>
            </span>
          </div>
          <p className="text-sm sm:text-base text-white/95 leading-relaxed font-medium">
            &ldquo;{summary.verdict}&rdquo;
          </p>
        </div>
      </div>

      {/* ─── Pros & Cons Side-by-Side ─── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Pros */}
        <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/25 p-5">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs">
              ✓
            </span>
            <span>What Buyers Love (Verified Strengths)</span>
          </h3>
          <ul className="space-y-2.5">
            {summary.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-normal">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/25 p-5">
          <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-3.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-xs">
              !
            </span>
            <span>Critical Watchouts (Common Complaints)</span>
          </h3>
          <ul className="space-y-2.5">
            {summary.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-normal">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Topic Breakdown Progress Bars ─── */}
      <div className="relative z-10 rounded-2xl bg-white/[.025] border border-white/[.08] p-5 sm:p-6 mb-8">
        <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Topic-by-Topic Satisfaction Ratings</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {summary.topic_breakdown.map((t, idx) => {
            const pct = Math.round((t.score / 10) * 100);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80 font-medium">{t.topic}</span>
                  <span className="font-bold text-white">{t.score} / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[.08] overflow-hidden">
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
      <div className="relative z-10 rounded-2xl bg-gradient-to-b from-[#141630]/90 to-[#0e1026]/95 border border-purple-500/25 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>💬</span>
              <span>Ask AI About This Product</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
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
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-medium text-left ${
                    isSelected
                      ? "bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                      : "bg-white/[.04] text-white/70 hover:text-white hover:bg-white/[.08] border-white/10"
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
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-400/30 text-xs sm:text-sm text-white/90 leading-relaxed animate-in fade-in duration-200 mb-4">
            <span className="font-bold text-purple-300 block mb-1">
              Q: {summary.common_questions[activeQuestion].question}
            </span>
            <p className="text-white/80">{summary.common_questions[activeQuestion].answer}</p>
          </div>
        )}

        {/* Display Custom Question Answer */}
        {customAnswer && (
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-400/30 text-xs sm:text-sm text-white/90 leading-relaxed animate-in fade-in duration-200 mb-4">
            <span className="font-bold text-cyan-300 block mb-1">
              AI Review Intelligence:
            </span>
            <p className="text-white/80">{customAnswer}</p>
          </div>
        )}

        {/* Custom Question Input Form */}
        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="E.g. Is it good for low light photos? Does it come with a charger?"
            className="flex-1 w-0 h-10 rounded-xl bg-white/[.05] border border-white/15 text-xs px-4 outline-none focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 text-white placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={isAsking || !customQuestion.trim()}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold hover:brightness-110 transition shrink-0 disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1.5"
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
