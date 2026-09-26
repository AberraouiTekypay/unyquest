"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { VENTURE_LIBRARY } from "@/engine/academy-config";

export function WhyModal() {
  const { activeWhyKey, closeWhy, openLibrary } = useGame();

  if (!activeWhyKey) return null;

  const concept = VENTURE_LIBRARY.find((c) => c.key === activeWhyKey);

  if (!concept) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              💡
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {concept.category} Concept
              </span>
              <h3 id="why-modal-title" className="text-lg font-bold text-zinc-100 leading-tight">
                {concept.title}
              </h3>
            </div>
          </div>
          <button
            onClick={closeWhy}
            aria-label="Close why modal"
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3.5 text-sm">
          <div>
            <h5 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">
              Definition
            </h5>
            <p className="text-zinc-200 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
              {concept.definition}
            </p>
          </div>

          <div>
            <h5 className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 mb-1">
              Why It Matters
            </h5>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {concept.whyItMatters}
            </p>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
            <h5 className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 mb-1">
              Real Venture Example
            </h5>
            <p className="text-xs text-amber-100/90 leading-relaxed font-mono">
              {concept.example}
            </p>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>In-game metric: <strong className="text-zinc-300 font-semibold">{concept.inGameMetric}</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={() => {
              closeWhy();
              openLibrary(activeWhyKey);
            }}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
          >
            Explore Venture Library 📚
          </button>

          <button
            onClick={closeWhy}
            className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition uppercase tracking-wider"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
