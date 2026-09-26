"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";

export function QuestsTab() {
  const { quests, skills, achievements, roleProgression, unlockTier, openMiniChallenge } = useGame();
  const [subTab, setSubTab] = useState<"QUESTS" | "SKILLS" | "ACHIEVEMENTS">("QUESTS");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<"ALL" | "FOUNDER" | "INVESTOR" | "JURY">("ALL");

  const completedQuests = quests.filter((q) => q.isCompleted);
  const activeQuests = quests.filter((q) => !q.isCompleted);

  const filteredSkills = skills.filter((s) => {
    if (skillCategoryFilter === "ALL") return true;
    return s.category === skillCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab("QUESTS")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
              subTab === "QUESTS"
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Milestone Quests ({completedQuests.length}/{quests.length})
          </button>
          <button
            onClick={() => setSubTab("SKILLS")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
              subTab === "SKILLS"
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Venture Skill Tree ({skills.length} Skills)
          </button>
          <button
            onClick={() => setSubTab("ACHIEVEMENTS")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
              subTab === "ACHIEVEMENTS"
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Achievements ({achievements.filter((a) => a.isUnlocked).length}/{achievements.length})
          </button>
        </div>

        <button
          onClick={() => openMiniChallenge()}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg transition"
        >
          ⚔️ Launch Decision Challenge
        </button>
      </div>

      {/* 1. Milestone Quests Tab */}
      {subTab === "QUESTS" && (
        <div className="space-y-6">
          {/* Active Quests */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-3 flex items-center gap-2">
              <span>🎯</span> Active Milestones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQuests.map((quest) => {
                const isLocked = quest.unlockTier > unlockTier;
                const progressPercent = Math.min(
                  100,
                  Math.round((quest.currentProgress / quest.targetCount) * 100)
                );

                return (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-xl border transition ${
                      isLocked
                        ? "bg-zinc-900/30 border-zinc-850 opacity-60"
                        : "bg-zinc-900/80 border-zinc-800 hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400">
                          {quest.category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-semibold">
                          Tier {quest.unlockTier}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        +{quest.rewardXP.amount} {quest.rewardXP.category} XP
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-100 mb-1">{quest.title}</h4>
                    <p className="text-xs text-zinc-400 mb-3">{quest.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>Progress</span>
                        <span>{quest.currentProgress} / {quest.targetCount}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 italic">
                        Takeaway: {quest.learningTakeaway}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <span>✓</span> Completed Milestones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-3.5 rounded-xl bg-zinc-900/40 border border-emerald-500/20 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-200">{quest.title}</span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded">
                        Completed ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-2">{quest.description}</p>
                    <span className="text-[10px] text-emerald-300/80 italic">
                      Learned: {quest.learningTakeaway}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Granular Venture Skill Tree Tab */}
      {subTab === "SKILLS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">
              Each operating action, pitch, check, and syndicate levels up specific discipline skills.
            </span>
            <div className="flex items-center gap-1.5">
              {(["ALL", "FOUNDER", "INVESTOR", "JURY"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                    skillCategoryFilter === cat
                      ? "bg-amber-500 text-zinc-950"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSkills.map((skill) => {
              const progressPercent = Math.min(100, Math.round((skill.xp / skill.xpToNextLevel) * 100));

              return (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between hover:border-amber-500/30 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {skill.category}
                      </span>
                      <span className="text-xs font-black text-amber-400">
                        Level {skill.level} / 10
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-100 mb-2">{skill.name}</h4>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>XP Progress</span>
                      <span>{skill.xp} / {skill.xpToNextLevel}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Achievements Gallery Tab */}
      {subTab === "ACHIEVEMENTS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition flex items-start gap-3.5 ${
                  ach.isUnlocked
                    ? "bg-zinc-900/90 border-amber-500/40 shadow-md"
                    : "bg-zinc-900/30 border-zinc-800/80 opacity-60"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    ach.isUnlocked
                      ? "bg-amber-500/20 border border-amber-500/40"
                      : "bg-zinc-800 text-zinc-600"
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-zinc-100 truncate">{ach.title}</h4>
                    {ach.isUnlocked ? (
                      <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-bold text-zinc-500 bg-zinc-850 px-1.5 py-0.5 rounded">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">{ach.description}</p>
                  <p className="text-[10px] text-amber-300/80 italic">
                    Takeaway: {ach.learningTakeaway}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
