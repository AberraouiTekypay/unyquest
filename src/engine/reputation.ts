import {
  JuryLevel,
  Player,
  PlayerReputation,
} from "./types";

/**
 * Resolves the jury tier based on historical pitch evaluations completed.
 * Junior Jury (<5) -> Jury (5-14) -> Senior Jury (15-29) -> Investment Committee (30+)
 *
 * @param evaluationCount - Lifetime pitches evaluated by player
 * @returns JuryLevel tier string
 */
export function getJuryLevel(evaluationCount: number): JuryLevel {
  if (evaluationCount >= 30) return "Investment Committee";
  if (evaluationCount >= 15) return "Senior Jury";
  if (evaluationCount >= 5) return "Jury";
  return "Junior Jury";
}

/**
 * Updates founder reputation score and level based on operational and venture milestones.
 *
 * @param currentRep - Player's current reputation profile
 * @param event - Event type (FUNDRAISE_SUCCESS, REVENUE_GROWTH, DISTRESS_AVOIDED, SUCCESSFUL_EXIT, FAILURE)
 * @returns Updated reputation profile
 */
export function updateFounderReputation(
  currentRep: PlayerReputation,
  event: "FUNDRAISE_SUCCESS" | "REVENUE_GROWTH" | "DISTRESS_AVOIDED" | "SUCCESSFUL_EXIT" | "FAILURE"
): PlayerReputation {
  const deltas: Record<string, number> = {
    FUNDRAISE_SUCCESS: 15,
    REVENUE_GROWTH: 8,
    DISTRESS_AVOIDED: 5,
    SUCCESSFUL_EXIT: 45,
    FAILURE: -10,
  };

  const delta = deltas[event] || 0;
  const newScore = Math.max(10, Math.min(1000, currentRep.founder_reputation + delta));
  const newLevel = Math.floor(newScore / 50) + 1;

  return {
    ...currentRep,
    founder_reputation: newScore,
    founder_level: newLevel,
  };
}

/**
 * Updates investor reputation score and level based on capital allocation and portfolio returns.
 *
 * @param currentRep - Player's current reputation profile
 * @param event - Event type (INVESTMENT_MADE, PORTFOLIO_GAIN, WINNER_EXIT, SYNDICATE_LED)
 * @returns Updated reputation profile
 */
export function updateInvestorReputation(
  currentRep: PlayerReputation,
  event: "INVESTMENT_MADE" | "PORTFOLIO_GAIN" | "WINNER_EXIT" | "SYNDICATE_LED"
): PlayerReputation {
  const deltas: Record<string, number> = {
    INVESTMENT_MADE: 6,
    PORTFOLIO_GAIN: 15,
    WINNER_EXIT: 40,
    SYNDICATE_LED: 20,
  };

  const delta = deltas[event] || 0;
  const newScore = Math.max(10, Math.min(1000, currentRep.investor_reputation + delta));
  const newLevel = Math.floor(newScore / 50) + 1;

  return {
    ...currentRep,
    investor_reputation: newScore,
    investor_level: newLevel,
  };
}

/**
 * Updates jury reputation score and checks progression to higher jury tiers.
 *
 * @param currentRep - Player's current reputation profile
 * @param evaluationCount - Total number of evaluations completed
 * @param accuracyDelta - Reputation score gain
 * @returns Updated reputation profile
 */
export function updateJuryReputation(
  currentRep: PlayerReputation,
  evaluationCount: number,
  accuracyDelta: number = 5
): PlayerReputation {
  const newScore = Math.max(10, Math.min(1000, currentRep.jury_reputation + accuracyDelta));
  const newLevel = getJuryLevel(evaluationCount);

  return {
    ...currentRep,
    jury_reputation: newScore,
    jury_level: newLevel,
  };
}

/**
 * Factory creating a fresh player profile with $100K Founder + $100K Investor starter capital.
 *
 * @param id - Player unique identifier
 * @param username - Display username
 * @param email - Optional email
 * @returns Complete Player object
 */
export function createInitialPlayer(id: string, username: string, email?: string): Player {
  return {
    id,
    username,
    email,
    avatar: "🚀",
    reputation: {
      founder_reputation: 50,
      investor_reputation: 50,
      jury_reputation: 50,
      founder_level: 1,
      investor_level: 1,
      jury_level: "Junior Jury",
    },
    founder_capital: 100_000,
    investor_capital: 100_000,
    achievements: ["BOOTSTRAPPER_GENESIS"],
    referrals_count: 0,
    created_at: new Date().toISOString(),
  };
}
