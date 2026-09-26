import {
  CompanyActionType,
  CompanyStage,
  InvestorArchetype,
  MarketConditionState,
} from "./types";

export interface ActionDefinition {
  type: CompanyActionType;
  label: string;
  description: string;
  baseCost: number;
  tradeoffSummary: string;
  effects: {
    product_delta?: number;
    team_delta?: number;
    traction_delta?: number;
    distribution_delta?: number;
    defensibility_delta?: number;
    revenue_growth_multiplier?: number;
    users_delta_factor?: number;
    burn_delta_factor?: number;
    tam_multiplier?: number;
  };
}

export interface InvestorArchetypeConfig {
  name: string;
  description: string;
  weights: {
    market: number;
    traction: number;
    team: number;
    product: number;
    distribution: number;
    defensibility: number;
    valuation_sensitivity: number;
  };
  minimumScoreForTermSheet: number;
  minimumScoreForInterest: number;
}

export const GAME_CONFIG = {
  // Starter balances
  STARTER_FOUNDER_CAPITAL: 100_000,
  STARTER_INVESTOR_CAPITAL: 100_000,

  // Pitch fees per company stage
  PITCH_FEES: {
    "Pre-seed": 5_000,
    Seed: 10_000,
    "Series A": 25_000,
    "Series B": 50_000,
    Growth: 100_000,
    Exit: 0,
  } as Record<CompanyStage, number>,

  // Funding ranges per stage
  FUNDING_ROUNDS: {
    "Pre-seed": { minAsk: 100_000, maxAsk: 500_000, typicalValuation: 1_500_000 },
    Seed: { minAsk: 250_000, maxAsk: 1_000_000, typicalValuation: 4_000_000 },
    "Series A": { minAsk: 1_000_000, maxAsk: 5_000_000, typicalValuation: 15_000_000 },
    "Series B": { minAsk: 5_000_000, maxAsk: 20_000_000, typicalValuation: 50_000_000 },
    Growth: { minAsk: 20_000_000, maxAsk: 100_000_000, typicalValuation: 200_000_000 },
    Exit: { minAsk: 0, maxAsk: 0, typicalValuation: 0 },
  } as Record<
    CompanyStage,
    { minAsk: number; maxAsk: number; typicalValuation: number }
  >,

  // Runway danger thresholds (in months)
  RUNWAY_WARNING_MONTHS: 3.0,
  RUNWAY_CRITICAL_MONTHS: 1.0,

  // Syndicate requirements
  MIN_SYNDICATE_LEADER_PERCENTAGE: 0.10, // 10% skin-in-the-game minimum

  // Global Market Conditions
  MARKET_CONDITIONS: {
    BOOM: {
      valuationMultiplier: 1.35,
      investorAppetite: 1.3,
      growthMultiplier: 1.25,
      description: "Capital is abundant, valuations are high, investors are eager.",
    },
    NORMAL: {
      valuationMultiplier: 1.0,
      investorAppetite: 1.0,
      growthMultiplier: 1.0,
      description: "Balanced ecosystem with healthy disciplined valuations.",
    },
    TIGHT: {
      valuationMultiplier: 0.8,
      investorAppetite: 0.75,
      growthMultiplier: 0.85,
      description: "Investors are cautious. Unit economics and runway matter most.",
    },
    CRISIS: {
      valuationMultiplier: 0.55,
      investorAppetite: 0.45,
      growthMultiplier: 0.65,
      description: "Capital is scarce. Down-rounds are prevalent. Cash preservation is survival.",
    },
  } as Record<
    MarketConditionState,
    {
      valuationMultiplier: number;
      investorAppetite: number;
      growthMultiplier: number;
      description: string;
    }
  >,

  // Investor Archetype Configurations
  INVESTOR_ARCHETYPES: {
    GENERALIST: {
      name: "Generalist Venture Fund",
      description: "Balanced investor seeking strong markets, reasonable traction, and sensible valuations.",
      weights: {
        market: 0.25,
        traction: 0.25,
        team: 0.20,
        product: 0.10,
        distribution: 0.10,
        defensibility: 0.10,
        valuation_sensitivity: 0.35,
      },
      minimumScoreForTermSheet: 65,
      minimumScoreForInterest: 48,
    },
    SPECIALIST: {
      name: "Domain Specialist Syndicate",
      description: "Values proven traction, deep domain expertise, and high moat defensibility above hype.",
      weights: {
        market: 0.15,
        traction: 0.35,
        team: 0.20,
        product: 0.10,
        distribution: 0.05,
        defensibility: 0.15,
        valuation_sensitivity: 0.25,
      },
      minimumScoreForTermSheet: 70,
      minimumScoreForInterest: 52,
    },
    OPERATOR: {
      name: "Operator / Venture Builder",
      description: "Obsessed with distribution channels, founder-market execution speed, and corridor leverage.",
      weights: {
        market: 0.15,
        traction: 0.20,
        team: 0.25,
        product: 0.10,
        distribution: 0.25,
        defensibility: 0.05,
        valuation_sensitivity: 0.20,
      },
      minimumScoreForTermSheet: 62,
      minimumScoreForInterest: 45,
    },
  } as Record<InvestorArchetype, InvestorArchetypeConfig>,

  // Company Actions & Trade-offs
  ACTIONS: [
    {
      type: "build_product",
      label: "Build Product",
      description: "Refactor architecture, add core features, improve UX.",
      baseCost: 15_000,
      tradeoffSummary: "Product score +7, Defensibility +3, Monthly burn +$1,500.",
      effects: {
        product_delta: 7,
        defensibility_delta: 3,
        revenue_growth_multiplier: 1.05,
        burn_delta_factor: 1500,
      },
    },
    {
      type: "marketing",
      label: "Marketing Sprint",
      description: "Run growth marketing, acquisition channels, and paid ads.",
      baseCost: 18_000,
      tradeoffSummary: "Users +35%, Traction +6, Immediate cash drain.",
      effects: {
        users_delta_factor: 1.35,
        traction_delta: 6,
        revenue_growth_multiplier: 1.15,
      },
    },
    {
      type: "hire",
      label: "Hire Key Talent",
      description: "Recruit lead engineers, product designers, or execs.",
      baseCost: 25_000,
      tradeoffSummary: "Team score +9, Product +4, Monthly burn permanently increases +$4,000.",
      effects: {
        team_delta: 9,
        product_delta: 4,
        burn_delta_factor: 4000,
      },
    },
    {
      type: "sales",
      label: "Enterprise Sales Push",
      description: "Hire B2B account reps and launch targeted outbound campaigns.",
      baseCost: 20_000,
      tradeoffSummary: "Revenue +25%, Monthly burn +$2,500, Traction +5.",
      effects: {
        revenue_growth_multiplier: 1.25,
        traction_delta: 5,
        distribution_delta: 4,
        burn_delta_factor: 2500,
      },
    },
    {
      type: "expand_market",
      label: "Expand Market (TAM)",
      description: "Launch in an adjacent geographic corridor or customer vertical.",
      baseCost: 30_000,
      tradeoffSummary: "TAM +40%, Growth upside increases, Risk of burn overshoot +$3,500/mo.",
      effects: {
        tam_multiplier: 1.40,
        distribution_delta: 6,
        burn_delta_factor: 3500,
      },
    },
    {
      type: "improve_operations",
      label: "Improve Operations",
      description: "Streamline cloud costs, automate workflows, renegotiate vendor contracts.",
      baseCost: 12_000,
      tradeoffSummary: "Monthly burn decreases by 20%, Defensibility +2, preserves runway.",
      effects: {
        burn_delta_factor: -0.20, // percentage reduction
        defensibility_delta: 2,
      },
    },
  ] as ActionDefinition[],
};
