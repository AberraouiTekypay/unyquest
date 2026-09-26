/**
 * VENTURE GAME - Master Types & Data Contracts
 * Pure TypeScript definitions decoupled from UI
 */

export type Sector =
  | "AI"
  | "Fintech"
  | "Logistics"
  | "Healthcare"
  | "Education"
  | "Climate"
  | "Food"
  | "PropTech"
  | "Consumer"
  | "SaaS"
  | "Marketplace";

export type MarketRegion =
  | "Europe"
  | "Africa"
  | "Middle East"
  | "Americas"
  | "Asia"
  | "Global";

export type BusinessModel =
  | "SaaS"
  | "Marketplace"
  | "Transaction"
  | "Subscription"
  | "Consumer"
  | "Enterprise"
  | "Infrastructure";

export type FounderStrength =
  | "Technical"
  | "Sales"
  | "Operations"
  | "Domain expert"
  | "Product"
  | "Distribution";

export type CompanyStage =
  | "Pre-seed"
  | "Seed"
  | "Series A"
  | "Series B"
  | "Growth"
  | "Exit";

export type MarketConditionState = "BOOM" | "NORMAL" | "TIGHT" | "CRISIS";

export type JuryLevel =
  | "Junior Jury"
  | "Jury"
  | "Senior Jury"
  | "Investment Committee";

export type CompanyActionType =
  | "build_product"
  | "marketing"
  | "hire"
  | "sales"
  | "expand_market"
  | "improve_operations";

export interface CompanyMetrics {
  cash: number;
  revenue: number;
  users: number;
  growth: number; // percentage, e.g. 15 for 15%
  monthly_burn: number;
  runway: number; // in months: cash / monthly_burn
  valuation: number;
  market_size: number; // TAM in virtual $
  product_score: number; // 0 - 100
  team_score: number; // 0 - 100
  traction_score: number; // 0 - 100
  distribution_score: number; // 0 - 100
  defensibility_score: number; // 0 - 100
  founder_ownership: number; // 0 - 100
  investor_ownership: number; // 0 - 100
  employee_ownership: number; // 0 - 100
  stage: CompanyStage;
  is_distressed: boolean;
  is_exited: boolean;
}

export interface Company {
  id: string;
  founder_id: string;
  founder_name: string;
  name: string;
  tagline: string;
  sector: Sector;
  market: MarketRegion;
  business_model: BusinessModel;
  founder_strengths: FounderStrength[];
  metrics: CompanyMetrics;
  created_at: string;
  updated_at: string;
  current_round_id?: string;
  total_raised: number;
  exit_details?: ExitDetails;
}

export interface CapTableEntry {
  investor_id: string;
  investor_name: string;
  equity_percentage: number;
  invested_amount: number;
  entry_valuation: number;
  is_founder?: boolean;
  is_syndicate?: boolean;
  syndicate_id?: string;
}

export interface CapTable {
  company_id: string;
  entries: CapTableEntry[];
}

export interface FundingRound {
  id: string;
  company_id: string;
  stage: CompanyStage;
  target_amount: number;
  committed_amount: number;
  pre_money_valuation: number;
  post_money_valuation: number;
  equity_offered_percentage: number;
  is_open: boolean;
  created_at: string;
  closed_at?: string;
}

export type InvestorArchetype = "GENERALIST" | "SPECIALIST" | "OPERATOR";

export interface PitchConfig {
  company: Company;
  problem: string;
  solution: string;
  ask: number;
  valuation: number;
  use_of_funds: {
    product: number;
    marketing: number;
    hiring: number;
    sales: number;
    reserve: number;
  };
  target_archetype: InvestorArchetype;
}

export type PitchDecision = "PASS" | "INTERESTED" | "TERM_SHEET";

export interface TermSheet {
  id: string;
  pitch_id: string;
  investor_id: string;
  investor_name: string;
  investor_archetype: InvestorArchetype;
  investment_amount: number;
  pre_money_valuation: number;
  post_money_valuation: number;
  ownership_percentage: number;
  special_condition?: string;
  expires_in_turns?: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";
}

export interface PitchOutcome {
  decision: PitchDecision;
  feedback_reason: string;
  feedbackReason?: string;
  pitch_cost: number;
  pitchCost?: number;
  score: number;
  term_sheet?: TermSheet;
  counter_allowed: boolean;
}

export interface Investment {
  id: string;
  investor_id: string;
  investor_name: string;
  company_id: string;
  company_name: string;
  amount_invested: number;
  equity_percentage: number;
  entry_valuation: number;
  current_valuation: number;
  virtual_return: number; // Current value = current_valuation * (equity_percentage / 100)
  moic: number; // Current value / amount_invested
  is_exited: boolean;
  exit_proceeds?: number;
  created_at: string;
}

export interface SyndicateMember {
  investor_id: string;
  investor_name: string;
  committed_amount: number;
  ownership_share_percentage: number; // Share of the syndicate's equity
  joined_at: string;
}

export interface Syndicate {
  id: string;
  name: string;
  thesis: string;
  leader_id: string;
  leader_name: string;
  target_amount: number;
  committed_amount: number;
  leader_commitment: number; // Must be >= 10% of target
  min_investment: number;
  members: SyndicateMember[];
  portfolio_companies: string[]; // company ids
  historical_returns: number;
  reputation: number;
  is_open: boolean;
  created_at: string;
}

export interface JuryReview {
  id: string;
  jury_id: string;
  jury_name: string;
  company_id: string;
  market_score: number; // 1-10
  team_score: number; // 1-10
  traction_score: number; // 1-10
  business_model_score: number; // 1-10
  valuation_fairness_score: number; // 1-10
  recommendation: "PASS" | "INTERESTED" | "RECOMMEND_INVESTMENT";
  notes: string;
  created_at: string;
}

export type ExitType = "ACQUISITION" | "IPO" | "FOUNDER_BUYOUT" | "FAILURE";

export interface ExitDetails {
  exit_type: ExitType;
  exit_valuation: number;
  founder_proceeds: number;
  investor_payouts: {
    investor_id: string;
    investor_name: string;
    payout: number;
    moic: number;
  }[];
  date: string;
  notes: string;
}

export interface PlayerReputation {
  founder_reputation: number;
  investor_reputation: number;
  jury_reputation: number;
  founder_level: number;
  investor_level: number;
  jury_level: JuryLevel;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  email?: string;
  reputation: PlayerReputation;
  founder_capital: number; // Starter $100,000
  investor_capital: number; // Starter $100,000
  active_company_id?: string;
  achievements: string[];
  referrals_count: number;
  invited_by?: string;
  created_at: string;
}

export interface TransactionLedgerEntry {
  id: string;
  player_id: string;
  company_id?: string;
  type:
    | "STARTER_CAPITAL"
    | "COMPANY_ACTION_SPEND"
    | "PITCH_FEE"
    | "INVESTMENT_DEPLOYED"
    | "INVESTMENT_RECEIVED"
    | "SYNDICATE_COMMITMENT"
    | "EXIT_PAYOUT"
    | "REFERRAL_BONUS";
  account: "FOUNDER_CAPITAL" | "INVESTOR_CAPITAL" | "COMPANY_TREASURY";
  amount: number; // positive = credit, negative = debit
  balance_after: number;
  description: string;
  created_at: string;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  type: "POSITIVE" | "NEGATIVE";
  effect: {
    users_delta?: number;
    revenue_delta?: number;
    cash_delta?: number;
    burn_delta?: number;
    traction_score_delta?: number;
    team_score_delta?: number;
    product_score_delta?: number;
  };
}

export interface StartupArchetypeSeed {
  name: string;
  tagline: string;
  sector: Sector;
  market: MarketRegion;
  business_model: BusinessModel;
  founder_strengths: FounderStrength[];
  tam: number;
  initial_users: number;
  initial_revenue: number;
  initial_burn: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  risk_profile: string;
}
