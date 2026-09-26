"use client";

import React from "react";
import { useGame } from "@/lib/game-store";

export function VentureJourneyHUD({
  onOpenQuests,
}: {
  onOpenQuests?: () => void;
}) {
  const { unlockTier, roleProgression, openMiniChallenge, quests } = useGame();

  const tierNames: Record<number, string> = {
    1: "Tier 1: Beginner",
    2: "Tier 2: Apprentice",
    3: "Tier 3: Founder",
    4: "Tier 4: Investor",
    5: "Tier 5: Syndicate Lead",
    6: "Tier 6: Venture Builder",
  };

  const activeQuest = quests.find((q) => !q.isCompleted) || quests[quests.length - 1];
  const completedCount = quests.filter((q) => q.isCompleted).length;
  const progressPercent = Math.min(100, Math.round((unlockTier / 6) * 100));

  return (
    <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Tier & Overall Venture Journey */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shrink-0">
            {unlockTier}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Your Venture Journey
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                {completedCount}/{quests.length} Quests Completed
              </span>
            </div>
            <h3 className="text-base font-black text-zinc-100">
              {tierNames[unlockTier] || `Tier ${unlockTier}`}
            </h3>
            <div className="w-48 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Multi-Role Level Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Founder</span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-sm font-black text-amber-400">Lvl {roleProgression.founder_level}</span>
              <span className="text-[10px] text-zinc-400 font-mono">{roleProgression.founder_xp} XP</span>
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Investor</span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-sm font-black text-emerald-400">Lvl {roleProgression.investor_level}</span>
              <span className="text-[10px] text-zinc-400 font-mono">{roleProgression.investor_xp} XP</span>
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Jury</span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-sm font-black text-indigo-400">Lvl {roleProgression.jury_level}</span>
              <span className="text-[10px] text-zinc-400 font-mono">{roleProgression.jury_xp} XP</span>
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Syndicate</span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-sm font-black text-cyan-400">Lvl {roleProgression.syndicate_level}</span>
              <span className="text-[10px] text-zinc-400 font-mono">{roleProgression.syndicate_xp} XP</span>
            </div>
          </div>
        </div>

        {/* Active Quest & Mini-Challenge Triggers */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {activeQuest && (
            <button
              onClick={onOpenQuests}
              className="flex-1 lg:flex-none text-left bg-zinc-950/90 border border-amber-500/30 hover:border-amber-500/60 p-2 px-3 rounded-xl transition flex items-center gap-2.5"
            >
              <span className="text-amber-400 text-sm">🎯</span>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400 block truncate">
                  Active Quest
                </span>
                <span className="text-xs font-semibold text-zinc-200 block truncate max-w-[160px]">
                  {activeQuest.title}
                </span>
              </div>
            </button>
          )}

          <button
            onClick={() => openMiniChallenge()}
            className="px-3 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>⚔️</span>
            <span>Decision Challenge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
