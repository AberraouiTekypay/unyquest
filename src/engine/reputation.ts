import {
  JuryLevel,
  Player,
  PlayerReputation,
} from "./types";

export function getJuryLevel(evaluationCount: number): JuryLevel {
  if (evaluationCount >= 30) return "Investment Committee";
  if (evaluationCount >= 15) return "Senior Jury";
  if (evaluationCount >= 5) return "Jury";
  return "Junior Jury";
}

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
