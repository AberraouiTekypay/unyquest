import {
  Company,
  InvestorArchetype,
  PitchConfig,
  PitchDecision,
  PitchOutcome,
  TermSheet,
} from "./types";
import { GAME_CONFIG } from "./config";
import { NPC_INVESTORS } from "./archetypes";

export function getPitchCost(stage: Company["metrics"]["stage"]): number {
  return GAME_CONFIG.PITCH_FEES[stage] ?? 5_000;
}

export function evaluatePitch(config: PitchConfig): PitchOutcome {
  const { company, ask, valuation, target_archetype, use_of_funds } = config;
  const stage = company.metrics.stage;
  const pitchCost = getPitchCost(stage);
  const archetypeConfig = GAME_CONFIG.INVESTOR_ARCHETYPES[target_archetype];
  const npc = NPC_INVESTORS.find((inv) => inv.archetype === target_archetype) || NPC_INVESTORS[0];

  // 1. Check valuation sanity: Intrinsic valuation vs Ask
  const intrinsicValuation = company.metrics.valuation;
  const valuationOverreachRatio = valuation / Math.max(1, intrinsicValuation);

  // 2. Compute component scores normalized to 100
  const marketScore = Math.min(
    100,
    Math.round((company.metrics.market_size / 20_000_000_000) * 100)
  );
  const tractionScore = company.metrics.traction_score;
  const teamScore = company.metrics.team_score;
  const productScore = company.metrics.product_score;
  const distributionScore = company.metrics.distribution_score;
  const defensibilityScore = company.metrics.defensibility_score;

  // 3. Valuation alignment penalty
  // If valuation is > 1.3x intrinsic, apply penalty scaled by archetype valuation sensitivity
  let valuationPenalty = 0;
  if (valuationOverreachRatio > 1.1) {
    valuationPenalty = (valuationOverreachRatio - 1.1) * 60 * archetypeConfig.weights.valuation_sensitivity;
  }

  // 4. Use of funds balance check (deduct if reserve < 5% or single bucket > 60%)
  let fundsBalanceBonus = 5;
  const totalFunds = Object.values(use_of_funds).reduce((a, b) => a + b, 0);
  if (totalFunds > 0) {
    const reserveRatio = use_of_funds.reserve / totalFunds;
    if (reserveRatio < 0.05) fundsBalanceBonus -= 4;
    const maxSingleBucket = Math.max(...Object.values(use_of_funds)) / totalFunds;
    if (maxSingleBucket > 0.65) fundsBalanceBonus -= 3;
  }

  // 5. Weighted composite score
  const w = archetypeConfig.weights;
  let compositeScore =
    marketScore * w.market +
    tractionScore * w.traction +
    teamScore * w.team +
    productScore * w.product +
    distributionScore * w.distribution +
    defensibilityScore * w.defensibility +
    fundsBalanceBonus -
    valuationPenalty;

  compositeScore = Math.max(10, Math.min(99, Math.round(compositeScore)));

  // 6. Outcome decision
  let decision: PitchDecision = "PASS";
  let feedbackReason = "";
  let termSheet: TermSheet | undefined;

  if (compositeScore >= archetypeConfig.minimumScoreForTermSheet) {
    decision = "TERM_SHEET";
    const offeredAmount = ask;
    // Offer pre-money close to valuation if reasonable, or adjusted to intrinsic
    const preMoney = Math.round(Math.min(valuation, intrinsicValuation * 1.15) / 10_000) * 10_000;
    const postMoney = preMoney + offeredAmount;
    const equityPct = Math.round((offeredAmount / postMoney) * 1000) / 10; // e.g. 14.3%

    feedbackReason =
      npc.termSheetQuotes[Math.floor(Math.random() * npc.termSheetQuotes.length)];

    termSheet = {
      id: `ts-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pitch_id: `pitch-${Date.now()}`,
      investor_id: npc.id,
      investor_name: `${npc.name} (${npc.firm})`,
      investor_archetype: target_archetype,
      investment_amount: offeredAmount,
      pre_money_valuation: preMoney,
      post_money_valuation: postMoney,
      ownership_percentage: equityPct,
      special_condition:
        compositeScore > 85 ? "Super pro-rata rights & quarterly board observer" : undefined,
      status: "PENDING",
      expires_in_turns: 3,
    };
  } else if (compositeScore >= archetypeConfig.minimumScoreForInterest) {
    decision = "INTERESTED";
    feedbackReason =
      valuationOverreachRatio > 1.4
        ? `We are interested in ${company.name}, but your requested valuation of $${(valuation / 1_000_000).toFixed(1)}M is stretched. Lower the ask or demonstrate higher traction.`
        : npc.interestQuotes[Math.floor(Math.random() * npc.interestQuotes.length)];
  } else {
    decision = "PASS";
    if (valuationOverreachRatio > 1.5) {
      feedbackReason = `Your market is attractive, but your current traction (Score: ${tractionScore}) does not support the requested $${(valuation / 1_000_000).toFixed(1)}M valuation.`;
    } else if (target_archetype === "SPECIALIST" && defensibilityScore < 50) {
      feedbackReason = `Insufficient proprietary moat. A well-funded incumbent could clone this in three quarters.`;
    } else if (target_archetype === "OPERATOR" && distributionScore < 45) {
      feedbackReason = `Distribution velocity is sluggish. You need stronger customer acquisition loops.`;
    } else {
      feedbackReason =
        npc.rejectionQuotes[Math.floor(Math.random() * npc.rejectionQuotes.length)];
    }
  }

  return {
    decision,
    feedback_reason: feedbackReason,
    feedbackReason,
    pitch_cost: pitchCost,
    pitchCost,
    score: compositeScore,
    term_sheet: termSheet,
    counter_allowed: decision === "TERM_SHEET" || decision === "INTERESTED",
  };
}

export function negotiateCounterOffer(
  originalTermSheet: TermSheet,
  counterPreMoney: number,
  counterEquityPct: number
): { accepted: boolean; finalTermSheet?: TermSheet; message: string } {
  // Investor checks if counter-offer is within 15% delta of original offer
  const originalPreMoney = originalTermSheet.pre_money_valuation;
  const originalEquity = originalTermSheet.ownership_percentage;

  const preMoneyDelta = (counterPreMoney - originalPreMoney) / originalPreMoney;
  const equityDelta = (originalEquity - counterEquityPct) / originalEquity;

  if (preMoneyDelta <= 0.15 && equityDelta <= 0.15) {
    // Investor accepts compromise
    const newPostMoney = counterPreMoney + originalTermSheet.investment_amount;
    const finalEquity =
      Math.round((originalTermSheet.investment_amount / newPostMoney) * 1000) / 10;

    return {
      accepted: true,
      finalTermSheet: {
        ...originalTermSheet,
        pre_money_valuation: counterPreMoney,
        post_money_valuation: newPostMoney,
        ownership_percentage: finalEquity,
        status: "ACCEPTED",
      },
      message: "Investor agreed to the counter-offer terms!",
    };
  } else {
    // Investor rejects counter and walks away or holds firm
    return {
      accepted: false,
      message: `${originalTermSheet.investor_name} rejected the counter-offer: "The gap is too wide. Our original term sheet stands or we walk away."`,
    };
  }
}
