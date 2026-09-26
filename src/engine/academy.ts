import {
  Achievement,
  CoachingTriggerType,
  PlayerMistakeTracker,
  PlayerRoleProgression,
  PlayerSkill,
  Quest,
  RoleCategory,
  UnlockTier,
  UnyCoachPrompt,
} from "./academy-types";
import { UNY_COACH_PROMPTS } from "./academy-config";

/**
 * Awards XP to a specific player role (Founder, Investor, Jury, Syndicate)
 * and calculates level promotion (every 250 XP advances 1 level).
 *
 * @param progression - Current role progression state
 * @param role - Role to receive XP
 * @param xp - XP points to credit
 * @returns Updated PlayerRoleProgression
 */
export function awardRoleXP(
  progression: PlayerRoleProgression,
  role: RoleCategory,
  xp: number
): PlayerRoleProgression {
  const p = { ...progression };

  switch (role) {
    case "FOUNDER":
      p.founder_xp += xp;
      p.founder_level = Math.floor(p.founder_xp / 250) + 1;
      break;
    case "INVESTOR":
      p.investor_xp += xp;
      p.investor_level = Math.floor(p.investor_xp / 250) + 1;
      break;
    case "JURY":
      p.jury_xp += xp;
      p.jury_level = Math.floor(p.jury_xp / 250) + 1;
      break;
    case "SYNDICATE":
      p.syndicate_xp += xp;
      p.syndicate_level = Math.floor(p.syndicate_xp / 250) + 1;
      break;
  }

  return p;
}

/**
 * Increments XP for a specific granular skill in the venture skill tree.
 * Levels up the skill when cumulative XP crosses threshold (level * 100).
 *
 * @param skills - Array of current player skills
 * @param skillName - Skill identifier to credit
 * @param xp - Amount of XP to award
 * @returns Updated skills array
 */
export function awardSkillXP(
  skills: PlayerSkill[],
  skillName: string,
  xp: number
): PlayerSkill[] {
  return skills.map((s) => {
    if (s.name.toLowerCase() === skillName.toLowerCase()) {
      let newXp = s.xp + xp;
      let newLevel = s.level;
      let needed = s.level * 100;

      while (newXp >= needed && newLevel < 10) {
        newXp -= needed;
        newLevel += 1;
        needed = newLevel * 100;
      }

      return {
        ...s,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: needed,
      };
    }
    return s;
  });
}

/**
 * Evaluates whether any active quest has advanced or completed.
 *
 * @param quests - Current list of quests
 * @param questId - Target quest identifier
 * @param progressDelta - Progress increment
 * @returns Updated quests array and completed quest if threshold reached
 */
export function updateQuestProgress(
  quests: Quest[],
  questId: string,
  progressDelta: number = 1
): { updatedQuests: Quest[]; completedQuest?: Quest } {
  let completedQuest: Quest | undefined;

  const updatedQuests = quests.map((q) => {
    if (q.id === questId && !q.isCompleted) {
      const newProgress = q.currentProgress + progressDelta;
      const isDone = newProgress >= q.targetCount;

      const updated = {
        ...q,
        currentProgress: newProgress,
        isCompleted: isDone,
      };

      if (isDone) {
        completedQuest = updated;
      }
      return updated;
    }
    return q;
  });

  return { updatedQuests, completedQuest };
}

/**
 * Checks whether an in-game milestone satisfies any achievement condition.
 *
 * @param achievements - Current list of player achievements
 * @param achievementId - Identifier of achievement to check
 * @returns Updated achievements list and newly unlocked achievement if awarded
 */
export function unlockAchievement(
  achievements: Achievement[],
  achievementId: string
): { updatedAchievements: Achievement[]; newlyUnlocked?: Achievement } {
  let newlyUnlocked: Achievement | undefined;

  const updatedAchievements = achievements.map((ach) => {
    if (ach.id === achievementId && !ach.isUnlocked) {
      const updated = {
        ...ach,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      newlyUnlocked = updated;
      return updated;
    }
    return ach;
  });

  return { updatedAchievements, newlyUnlocked };
}

/**
 * Determines current player unlock tier (1 to 6) based on maximum level achieved.
 * Level 1 (Tier 1: Beginner) -> Level 2 (Tier 2: Apprentice) -> Level 3 (Tier 3: Founder)
 * -> Level 4 (Tier 4: Investor) -> Level 5 (Tier 5: Syndicate) -> Level 6 (Tier 6: Venture Builder)
 *
 * @param progression - Current role progression profile
 * @returns UnlockTier number (1-6)
 */
export function getUnlockTier(progression: PlayerRoleProgression): UnlockTier {
  const maxLevel = Math.max(
    progression.founder_level,
    progression.investor_level,
    progression.jury_level,
    progression.syndicate_level
  );

  if (maxLevel >= 6) return 6;
  if (maxLevel >= 5) return 5;
  if (maxLevel >= 4) return 4;
  if (maxLevel >= 3) return 3;
  if (maxLevel >= 2) return 2;
  return 1;
}

/**
 * Evaluates contextual UNY coach prompt with adaptive feedback based on mistake history.
 *
 * @param trigger - Trigger event type
 * @param mistakeTracker - Historical count of player errors
 * @returns Tailored UnyCoachPrompt with concise actionable takeaway
 */
export function evaluateUnyCoachPrompt(
  trigger: CoachingTriggerType,
  mistakeTracker: PlayerMistakeTracker
): UnyCoachPrompt | null {
  // Adaptive branch: If player has repeatedly run out of cash
  if (
    (trigger === "RUNWAY_CRITICAL" || trigger === "DISTRESS_MODE") &&
    mistakeTracker.distressCount >= 2
  ) {
    return {
      id: "coach-adaptive-distress",
      trigger: "DISTRESS_MODE",
      title: "UNY • Adaptive Coach",
      message:
        "You've entered distress multiple times because hiring burn outpaces sales. Consider cutting burn via Operations before expanding.",
      whyConceptKey: "distress",
      suggestedAction: "Downsize burn or raise bridge capital.",
    };
  }

  // Adaptive branch: If player has repeatedly pitched with excessive valuation
  if (
    (trigger === "FIRST_PITCH_PASS" || trigger === "VALUATION_OVERREACH") &&
    mistakeTracker.overvaluationPitchCount >= 2
  ) {
    return {
      id: "coach-adaptive-overvaluation",
      trigger: "VALUATION_OVERREACH",
      title: "UNY • Adaptive Coach",
      message:
        "VCs consistently pass on your round because valuation expectations exceed 2x ARR. Lower the valuation to secure term sheets.",
      whyConceptKey: "valuation",
      suggestedAction: "Reduce valuation ask by 20%.",
    };
  }

  return UNY_COACH_PROMPTS[trigger] || null;
}

/**
 * Records an economic error in player's history to enable adaptive coaching.
 *
 * @param tracker - Existing mistake tracker
 * @param mistakeType - Category of mistake
 * @returns Updated PlayerMistakeTracker
 */
export function recordPlayerMistake(
  tracker: PlayerMistakeTracker,
  mistakeType: "DISTRESS" | "RAPID_BURN" | "OVERVALUATION" | "FAILED_PITCH"
): PlayerMistakeTracker {
  const t = { ...tracker };
  switch (mistakeType) {
    case "DISTRESS":
      t.distressCount += 1;
      break;
    case "RAPID_BURN":
      t.burnExcessCount += 1;
      break;
    case "OVERVALUATION":
      t.overvaluationPitchCount += 1;
      break;
    case "FAILED_PITCH":
      t.failedPitchesCount += 1;
      break;
  }
  return t;
}
