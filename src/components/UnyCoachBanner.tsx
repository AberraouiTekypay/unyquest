"use client";

import React from "react";
import { useGame } from "@/lib/game-store";

export function UnyCoachBanner() {
  const { activeCoachPrompt, dismissCoachPrompt, triggerWhy } = useGame();

  if (!activeCoachPrompt) return null;

  return (
    <aside
      role="region"
      aria-label="Venture Coach Guidance"
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-zinc-950/95 border border-amber-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-zinc-950 font-black text-lg shadow-md shrink-0">
          🧭
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">UNY</span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold bg-zinc-800/80 px-1.5 py-0.5 rounded">
                Venture Coach
              </span>
            </div>
            <button
              onClick={dismissCoachPrompt}
              aria-label="Close coach guidance"
              className="text-zinc-500 hover:text-zinc-300 text-xs px-1 hover:bg-zinc-800 rounded transition"
            >
              ✕
            </button>
          </div>

          <h4 className="text-sm font-semibold text-zinc-100 mb-1 leading-snug">
            {activeCoachPrompt.title}
          </h4>

          <p className="text-xs text-zinc-300 leading-relaxed mb-3">
            {activeCoachPrompt.message}
          </p>

          <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
            <button
              onClick={dismissCoachPrompt}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded transition uppercase tracking-wide"
            >
              Understand
            </button>
            <button
              onClick={dismissCoachPrompt}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition uppercase tracking-wide"
            >
              Continue
            </button>
            {activeCoachPrompt.whyConceptKey && (
              <button
                onClick={() => {
                  triggerWhy(activeCoachPrompt.whyConceptKey!);
                }}
                className="ml-auto px-2.5 py-1 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline uppercase tracking-wide flex items-center gap-1"
              >
                Why? 💡
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
