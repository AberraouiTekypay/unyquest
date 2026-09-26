import {
  BusinessModel,
  CapTableEntry,
  Company,
  CompanyActionType,
  CompanyMetrics,
  ExitDetails,
  ExitType,
  FounderStrength,
  MarketConditionState,
  MarketRegion,
  RandomEvent,
  Sector,
} from "./types";
import { GAME_CONFIG } from "./config";

export interface CreateCompanyInput {
  id?: string;
  founder_id: string;
  founder_name: string;
  name: string;
  tagline: string;
  sector: Sector;
  market: MarketRegion;
  business_model: BusinessModel;
  founder_strengths: FounderStrength[];
  initial_treasury?: number;
}

/**
 * Calculates company runway in months based on liquid cash treasury and monthly burn rate.
 *
 * @param cash - Current liquid virtual treasury cash in company account
 * @param monthly_burn - Net monthly operating expense burn rate
 * @returns Runway in months, rounded to 1 decimal place (returns 99.9 if burn <= 0, 0 if cash <= 0)
 */
export function calculateRunway(cash: number, monthly_burn: number): number {
  if (monthly_burn <= 0) return 99.9;
  if (cash <= 0) return 0;
  return Math.round((cash / monthly_burn) * 10) / 10;
}

/**
 * Computes company intrinsic valuation based on annualized recurring revenue (ARR),
 * sector ARR multiples, growth momentum premium, composite asset/team quality,
 * and current global macroeconomic cycle conditions.
 *
 * @param metrics - Current company operational metrics (revenue, growth, scores, TAM)
 * @param sector - Target vertical sector (AI, Fintech, Logistics, Healthcare, Climate, etc.)
 * @param marketCondition - Macro state (BOOM, NORMAL, TIGHT, CRISIS)
 * @returns Calculated post/pre-money virtual valuation rounded to the nearest $10,000
 */
export function calculateValuation(
  metrics: Omit<CompanyMetrics, "valuation">,
  sector: Sector,
  marketCondition: MarketConditionState = "NORMAL"
): number {
  // Base ARR valuation multiple depending on sector
  const sectorMultiples: Record<Sector, number> = {
    AI: 18,
    Fintech: 14,
    Logistics: 10,
    Healthcare: 12,
    Education: 8,
    Climate: 15,
    Food: 7,
    PropTech: 9,
    Consumer: 8,
    SaaS: 14,
    Marketplace: 11,
  };

  const baseMultiple = sectorMultiples[sector] || 10;
  const annualRevenue = metrics.revenue * 12;

  // Multiplier adjusted by growth rate
  const growthPremium = Math.max(0.5, 1 + (metrics.growth / 100));

  // Score factor from product, team, traction, defensibility
  const qualityFactor =
    (metrics.product_score * 0.25 +
      metrics.team_score * 0.25 +
      metrics.traction_score * 0.3 +
      metrics.defensibility_score * 0.2) /
    50; // normalized around 1.0

  let rawValuation =
    annualRevenue > 0
      ? annualRevenue * baseMultiple * growthPremium * qualityFactor
      : 800_000 * qualityFactor; // Pre-revenue baseline for early stage

  // TAM floor/ceiling sanity check
  const minValuation = 500_000;
  const maxValuation = metrics.market_size * 0.3; // Cannot exceed 30% of entire TAM

  rawValuation = Math.max(minValuation, Math.min(rawValuation, maxValuation));

  // Apply market condition multiplier
  const marketMult =
    GAME_CONFIG.MARKET_CONDITIONS[marketCondition]?.valuationMultiplier || 1.0;
  return Math.round((rawValuation * marketMult) / 10_000) * 10_000;
}

/**
 * Initializes a new startup company with calibrated sector metrics,
 * founder strength attribute modifiers, initial treasury, and baseline valuation.
 *
 * @param input - Company parameters (name, tagline, sector, market, model, strengths)
 * @returns Fully formed Company object with initial metrics and 100% founder ownership
 */
export function createCompany(input: CreateCompanyInput): Company {
  const initialCash = input.initial_treasury ?? GAME_CONFIG.STARTER_FOUNDER_CAPITAL;
  const initialBurn = 10_000;

  // Base metrics
  let productScore = 40;
  let teamScore = 45;
  let tractionScore = 30;
  let distributionScore = 35;
  let defensibilityScore = 30;
  let burn = initialBurn;
  let initialRevenue = 2_500;
  let initialUsers = 100;
  let marketSize = 5_000_000_000; // $5B default TAM

  // Apply founder strength bonuses
  for (const strength of input.founder_strengths) {
    switch (strength) {
      case "Technical":
        productScore += 15;
        defensibilityScore += 10;
        break;
      case "Sales":
        distributionScore += 15;
        initialRevenue += 4_000;
        break;
      case "Operations":
        burn = Math.round(burn * 0.8); // 20% burn efficiency
        defensibilityScore += 8;
        break;
      case "Domain expert":
        defensibilityScore += 15;
        tractionScore += 10;
        break;
      case "Product":
        productScore += 18;
        initialUsers += 150;
        break;
      case "Distribution":
        distributionScore += 20;
        initialUsers += 250;
        initialRevenue += 2_000;
        break;
    }
  }

  // Adjust TAM based on market region
  const marketTamMultipliers: Record<MarketRegion, number> = {
    Global: 20_000_000_000,
    Americas: 15_000_000_000,
    Europe: 12_000_000_000,
    Asia: 14_000_000_000,
    "Middle East": 8_000_000_000,
    Africa: 7_000_000_000,
  };
  marketSize = marketTamMultipliers[input.market] || marketSize;

  const initialMetricsWithoutValuation = {
    cash: initialCash,
    revenue: initialRevenue,
    users: initialUsers,
    growth: 15,
    monthly_burn: burn,
    runway: calculateRunway(initialCash, burn),
    market_size: marketSize,
    product_score: Math.min(100, productScore),
    team_score: Math.min(100, teamScore),
    traction_score: Math.min(100, tractionScore),
    distribution_score: Math.min(100, distributionScore),
    defensibility_score: Math.min(100, defensibilityScore),
    founder_ownership: 100,
    investor_ownership: 0,
    employee_ownership: 0,
    stage: "Pre-seed" as const,
    is_distressed: false,
    is_exited: false,
  };

  const valuation = calculateValuation(
    initialMetricsWithoutValuation,
    input.sector,
    "NORMAL"
  );

  return {
    id: input.id || `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    founder_id: input.founder_id,
    founder_name: input.founder_name,
    name: input.name,
    tagline: input.tagline,
    sector: input.sector,
    market: input.market,
    business_model: input.business_model,
    founder_strengths: input.founder_strengths,
    metrics: {
      ...initialMetricsWithoutValuation,
      valuation,
    },
    total_raised: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Spends virtual treasury cash on operational actions with real trade-offs.
 * Updates company scores, recalculates runway, and triggers distress if cash <= 0.
 *
 * @param company - Target company state
 * @param actionType - Operating action (build_product, marketing, hire, sales, expand_market, improve_operations)
 * @param marketCondition - Current macroeconomic state
 * @returns Updated company object, cost deducted, and optional error message
 */
export function spendCash(
  company: Company,
  actionType: CompanyActionType,
  marketCondition: MarketConditionState = "NORMAL"
): { company: Company; cost: number; error?: string } {
  const actionDef = GAME_CONFIG.ACTIONS.find((a) => a.type === actionType);
  if (!actionDef) {
    return { company, cost: 0, error: `Invalid action type: ${actionType}` };
  }

  const cost = actionDef.baseCost;
  if (company.metrics.cash < cost) {
    return {
      company,
      cost: 0,
      error: `Insufficient virtual cash. Action costs $${cost.toLocaleString()}, company only has $${company.metrics.cash.toLocaleString()}.`,
    };
  }

  // Clone metrics for update
  const m = { ...company.metrics };
  m.cash -= cost;

  // Apply action effects
  if (actionDef.effects.product_delta) {
    m.product_score = Math.min(100, m.product_score + actionDef.effects.product_delta);
  }
  if (actionDef.effects.team_delta) {
    m.team_score = Math.min(100, m.team_score + actionDef.effects.team_delta);
  }
  if (actionDef.effects.traction_delta) {
    m.traction_score = Math.min(100, m.traction_score + actionDef.effects.traction_delta);
  }
  if (actionDef.effects.distribution_delta) {
    m.distribution_score = Math.min(
      100,
      m.distribution_score + actionDef.effects.distribution_delta
    );
  }
  if (actionDef.effects.defensibility_delta) {
    m.defensibility_score = Math.min(
      100,
      m.defensibility_score + actionDef.effects.defensibility_delta
    );
  }
  if (actionDef.effects.users_delta_factor) {
    m.users = Math.round(m.users * actionDef.effects.users_delta_factor);
  }
  if (actionDef.effects.revenue_growth_multiplier) {
    m.revenue = Math.round(m.revenue * actionDef.effects.revenue_growth_multiplier);
    m.growth = Math.round(m.growth * 1.05); // slight momentum boost
  }
  if (actionDef.effects.tam_multiplier) {
    m.market_size = Math.round(m.market_size * actionDef.effects.tam_multiplier);
  }

  // Burn rate modification
  if (actionDef.effects.burn_delta_factor !== undefined) {
    if (actionDef.effects.burn_delta_factor < 0) {
      // Percentage reduction (e.g. -0.20)
      m.monthly_burn = Math.max(
        3000,
        Math.round(m.monthly_burn * (1 + actionDef.effects.burn_delta_factor))
      );
    } else {
      // Fixed addition (e.g. +$4000)
      m.monthly_burn += actionDef.effects.burn_delta_factor;
    }
  }

  // Recalculate runway and distress status
  m.runway = calculateRunway(m.cash, m.monthly_burn);
  m.is_distressed = m.cash <= 0;

  // Recalculate valuation
  m.valuation = calculateValuation(m, company.sector, marketCondition);

  return {
    company: {
      ...company,
      metrics: m,
      updated_at: new Date().toISOString(),
    },
    cost,
  };
}

/**
 * Advances company operational state forward by one month (or simulation turn).
 * Applies organic growth curve, burns monthly expenses, updates user counts,
 * recalculates runway, and adjusts valuation dynamically.
 *
 * @param company - Target company state
 * @param marketCondition - Current macroeconomic state
 * @returns Mutated company state after one turn of operations
 */
export function applyTurnGrowth(
  company: Company,
  marketCondition: MarketConditionState = "NORMAL"
): Company {
  const m = { ...company.metrics };
  const conditionConfig = GAME_CONFIG.MARKET_CONDITIONS[marketCondition];
  const marketGrowthMult = conditionConfig ? conditionConfig.growthMultiplier : 1.0;

  // Monthly net cash flow: revenue minus burn
  const netBurn = m.monthly_burn - m.revenue;
  m.cash = Math.max(0, m.cash - Math.max(0, netBurn));

  // Organic monthly growth
  const effectiveGrowth = (m.growth * marketGrowthMult) / 100;
  m.revenue = Math.round(m.revenue * (1 + effectiveGrowth));
  m.users = Math.round(m.users * (1 + effectiveGrowth * 0.8));

  // Traction score naturally scales with user and revenue growth
  if (m.revenue > 50_000 && m.traction_score < 70) m.traction_score += 3;
  if (m.revenue > 150_000 && m.traction_score < 85) m.traction_score += 4;
  if (m.users > 5000 && m.traction_score < 80) m.traction_score += 3;

  m.runway = calculateRunway(m.cash, m.monthly_burn);
  m.is_distressed = m.cash <= 0;

  m.valuation = calculateValuation(m, company.sector, marketCondition);

  return {
    ...company,
    metrics: m,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Calculates final liquidity proceeds for founder and investors upon exit.
 * Computes strategic acquisition premium multiples, public IPO multiples,
 * or liquidation recoveries based on cap table ownership percentages.
 *
 * @param company - Exiting company state
 * @param capTable - Current capitalization table entries
 * @param exitType - ACQUISITION, IPO, FOUNDER_BUYOUT, or FAILURE
 * @returns ExitDetails with exit valuation, founder proceeds, and investor payouts with virtual MOIC
 */
export function calculateExit(
  company: Company,
  capTable: CapTableEntry[],
  exitType: ExitType
): ExitDetails {
  let exitValuation = 0;
  let notes = "";

  switch (exitType) {
    case "ACQUISITION":
      // Strategic multiple on current valuation (1.2x to 1.8x based on defensibility & product)
      const strategicMultiple =
        1.2 +
        (company.metrics.defensibility_score / 100) * 0.4 +
        (company.metrics.product_score / 100) * 0.2;
      exitValuation = Math.round(company.metrics.valuation * strategicMultiple);
      notes = `Acquired by industry leader at ${strategicMultiple.toFixed(2)}x strategic multiple.`;
      break;
    case "IPO":
      // Public market listing multiple (2.0x to 3.0x if revenue > $200k/mo)
      exitValuation = Math.round(company.metrics.valuation * 2.5);
      notes = "Successfully listed on global virtual tech exchange via IPO!";
      break;
    case "FOUNDER_BUYOUT":
      // Founder buys out existing investors at 1.1x entry or current market value
      exitValuation = Math.round(company.metrics.valuation * 1.05);
      notes = "Founder executed complete equity recapitalization and buyout.";
      break;
    case "FAILURE":
      // Liquidation / wind down
      exitValuation = Math.min(company.metrics.cash, 50_000);
      notes = "Company entered insolvency; residual assets liquidated.";
      break;
  }

  const founderOwnershipFraction = company.metrics.founder_ownership / 100;
  const founderProceeds = Math.round(exitValuation * founderOwnershipFraction);

  const investorPayouts = capTable
    .filter((entry) => !entry.is_founder)
    .map((entry) => {
      const payout = Math.round(exitValuation * (entry.equity_percentage / 100));
      const moic =
        entry.invested_amount > 0
          ? Math.round((payout / entry.invested_amount) * 100) / 100
          : 0;
      return {
        investor_id: entry.investor_id,
        investor_name: entry.investor_name,
        payout,
        moic,
      };
    });

  return {
    exit_type: exitType,
    exit_valuation: exitValuation,
    founder_proceeds: founderProceeds,
    investor_payouts: investorPayouts,
    date: new Date().toISOString(),
    notes,
  };
}
