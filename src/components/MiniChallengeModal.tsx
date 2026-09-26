"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";

export function MiniChallengeModal() {
  const { showMiniChallenge, activeChallenge, closeMiniChallenge, completeMiniChallenge } = useGame();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [result, setResult] = useState<{ consequence: string; xpGained: number } | null>(null);

  if (!showMiniChallenge || !activeChallenge) return null;

  function handleSelect(optionId: string) {
    if (result) return;
    setSelectedOptionId(optionId);
    const res = completeMiniChallenge(activeChallenge!.id, optionId);
    setResult(res);
  }

  function handleClose() {
    setSelectedOptionId(null);
    setResult(null);
    closeMiniChallenge();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-zinc-950 border border-amber-500/50 rounded-2xl shadow-2xl p-6 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
              ⚔️
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Interactive Decision Challenge
              </span>
              <h3 id="challenge-title" className="text-lg font-black text-zinc-100">
                {activeChallenge.title}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close challenge"
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Context Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Cash</span>
            <span className="text-xs font-mono font-bold text-zinc-200">
              ${activeChallenge.contextMetrics.cash.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Burn/Mo</span>
            <span className="text-xs font-mono font-bold text-rose-400">
              ${activeChallenge.contextMetrics.burn.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Runway</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {activeChallenge.contextMetrics.runway} mo
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Offer / Deal</span>
            <span className="text-xs font-mono font-bold text-emerald-400 truncate block">
              {activeChallenge.contextMetrics.offer || "Standard"}
            </span>
          </div>
        </div>

        {/* Scenario description */}
        <div className="mb-5">
          <p className="text-sm text-zinc-200 leading-relaxed bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/80">
            {activeChallenge.scenario}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Choose Your Strategic Action:
          </span>
          {activeChallenge.options.map((opt) => {
            const isChosen = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                disabled={Boolean(result)}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1 ${
                  isChosen
                    ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md"
                    : result
                    ? "bg-zinc-900/40 border-zinc-800 text-zinc-500 opacity-60"
                    : "bg-zinc-900/70 border-zinc-800 hover:border-amber-500/40 text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">
                    +{opt.xpGained} XP ({opt.skillName})
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Result Consequence */}
        {result && (
          <div className="mt-5 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 animate-in fade-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🎯</span>
              <h5 className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Consequence & Learning Takeaway
              </h5>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed mb-3">
              {result.consequence}
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition uppercase tracking-wider"
              >
                Apply Knowledge & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
