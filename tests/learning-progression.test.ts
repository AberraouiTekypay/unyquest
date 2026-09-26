import { describe, it, expect } from "vitest";
import {
  awardRoleXP,
  awardSkillXP,
  updateQuestProgress,
  unlockAchievement,
  getUnlockTier,
  recordPlayerMistake,
  evaluateUnyCoachPrompt,
} from "../src/engine/academy";
import {
  getInitialSkills,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  UNY_COACH_PROMPTS,
  VENTURE_LIBRARY,
  MINI_CHALLENGES,
} from "../src/engine/academy-config";
import { PlayerRoleProgression, PlayerMistakeTracker } from "../src/engine/academy-types";

describe("UNYQUEST Learning, Progression & Academy Engine", () => {
  it("should accurately award Role XP and advance player levels", () => {
    let progression: PlayerRoleProgression = {
      founder_xp: 0,
      founder_level: 1,
      investor_xp: 0,
      investor_level: 1,
      jury_xp: 0,
      jury_level: 1,
      syndicate_xp: 0,
      syndicate_level: 1,
    };

    // Award 250 XP to Founder (should advance to Level 2)
    progression = awardRoleXP(progression, "FOUNDER", 250);
    expect(progression.founder_xp).toBe(250);
    expect(progression.founder_level).toBe(2);

    // Award another 300 XP (Total: 550 XP -> Level 3)
    progression = awardRoleXP(progression, "FOUNDER", 300);
    expect(progression.founder_xp).toBe(550);
    expect(progression.founder_level).toBe(3);

    // Award Investor XP
    progression = awardRoleXP(progression, "INVESTOR", 500);
    expect(progression.investor_xp).toBe(500);
    expect(progression.investor_level).toBe(3);
  });

  it("should increment skill XP and level up granular skills across tiers", () => {
    const skills = getInitialSkills();
    const problemSkill = skills.find((s) => s.name === "Problem Selection")!;
    expect(problemSkill.level).toBe(1);
    expect(problemSkill.xp).toBe(0);

    // Award 50 XP (within Level 1 threshold of 100)
    let updatedSkills = awardSkillXP(skills, "Problem Selection", 50);
    let updatedProblemSkill = updatedSkills.find((s) => s.name === "Problem Selection")!;
    expect(updatedProblemSkill.level).toBe(1);
    expect(updatedProblemSkill.xp).toBe(50);

    // Award another 60 XP (Total 110 -> Level 2 with 10 leftover XP)
    updatedSkills = awardSkillXP(updatedSkills, "Problem Selection", 60);
    updatedProblemSkill = updatedSkills.find((s) => s.name === "Problem Selection")!;
    expect(updatedProblemSkill.level).toBe(2);
    expect(updatedProblemSkill.xp).toBe(10);
    expect(updatedProblemSkill.xpToNextLevel).toBe(200);
  });

  it("should track quest progress and mark completed when target reached", () => {
    let quests = [...INITIAL_QUESTS];

    // Genesis venture quest target is 1
    const { updatedQuests, completedQuest } = updateQuestProgress(quests, "quest-1", 1);
    expect(completedQuest).toBeDefined();
    expect(completedQuest?.id).toBe("quest-1");
    expect(completedQuest?.isCompleted).toBe(true);

    const q1 = updatedQuests.find((q) => q.id === "quest-1")!;
    expect(q1.isCompleted).toBe(true);
    expect(q1.currentProgress).toBe(1);
  });

  it("should unlock achievements without duplication", () => {
    let achievements = [...INITIAL_ACHIEVEMENTS];

    const result1 = unlockAchievement(achievements, "ach-first-customer");
    expect(result1.newlyUnlocked).toBeDefined();
    expect(result1.newlyUnlocked?.id).toBe("ach-first-customer");

    const a1 = result1.updatedAchievements.find((a) => a.id === "ach-first-customer")!;
    expect(a1.isUnlocked).toBe(true);

    // Re-unlocking same achievement should be idempotent
    const result2 = unlockAchievement(result1.updatedAchievements, "ach-first-customer");
    expect(result2.newlyUnlocked).toBeUndefined();
  });

  it("should compute progressive unlock tiers from beginner to venture builder", () => {
    let prog: PlayerRoleProgression = {
      founder_xp: 0,
      founder_level: 1,
      investor_xp: 0,
      investor_level: 1,
      jury_xp: 0,
      jury_level: 1,
      syndicate_xp: 0,
      syndicate_level: 1,
    };
    expect(getUnlockTier(prog)).toBe(1); // Tier 1: Beginner

    prog.founder_level = 2;
    expect(getUnlockTier(prog)).toBe(2); // Tier 2: Apprentice

    prog.founder_level = 3;
    expect(getUnlockTier(prog)).toBe(3); // Tier 3: Founder

    prog.investor_level = 4;
    expect(getUnlockTier(prog)).toBe(4); // Tier 4: Investor

    prog.syndicate_level = 5;
    expect(getUnlockTier(prog)).toBe(5); // Tier 5: Syndicate

    prog.founder_level = 6;
    expect(getUnlockTier(prog)).toBe(6); // Tier 6: Venture Builder
  });

  it("should adapt UNY Coach prompts based on player mistake history", () => {
    let mistakes: PlayerMistakeTracker = {
      distressCount: 0,
      burnExcessCount: 0,
      overvaluationPitchCount: 0,
      failedPitchesCount: 0,
    };

    // Standard runway warning
    const prompt1 = evaluateUnyCoachPrompt("RUNWAY_WARNING", mistakes);
    expect(prompt1?.title).toBe("Runway Below 3 Months");

    // Repeated distress triggers adaptive guidance
    mistakes = recordPlayerMistake(mistakes, "DISTRESS");
    mistakes = recordPlayerMistake(mistakes, "DISTRESS");
    expect(mistakes.distressCount).toBe(2);

    const promptDistress = evaluateUnyCoachPrompt("DISTRESS_MODE", mistakes);
    expect(promptDistress?.title).toBe("UNY • Adaptive Coach");
    expect(promptDistress?.message).toContain("distress multiple times");

    // Repeated overvaluation triggers tailored valuation coaching
    mistakes = recordPlayerMistake(mistakes, "OVERVALUATION");
    mistakes = recordPlayerMistake(mistakes, "OVERVALUATION");
    const promptValuation = evaluateUnyCoachPrompt("VALUATION_OVERREACH", mistakes);
    expect(promptValuation?.title).toBe("UNY • Adaptive Coach");
    expect(promptValuation?.message).toContain("valuation expectations exceed");
  });

  it("should have comprehensive venture library concepts and interactive challenges", () => {
    expect(VENTURE_LIBRARY.length).toBeGreaterThanOrEqual(9);
    const runwayConcept = VENTURE_LIBRARY.find((c) => c.key === "runway");
    expect(runwayConcept).toBeDefined();
    expect(runwayConcept?.definition).toContain("liquid cash");

    expect(MINI_CHALLENGES.length).toBeGreaterThanOrEqual(2);
    const chal1 = MINI_CHALLENGES[0];
    expect(chal1.options.length).toBeGreaterThanOrEqual(2);
    expect(chal1.options[0].xpGained).toBeGreaterThan(0);
  });
});
