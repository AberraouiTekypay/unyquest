/**
 * UNYQUEST — Learning, Progression & Venture Academy Types
 * Pure TypeScript definitions for Quests, Skills, XP, UNY Coach, and Library
 */

export type RoleCategory = "FOUNDER" | "INVESTOR" | "JURY" | "SYNDICATE";

export type FounderSkillType =
  | "Problem Selection"
  | "Customer Discovery"
  | "Product"
  | "Sales"
  | "Marketing"
  | "Finance"
  | "Fundraising"
  | "Leadership"
  | "Operations"
  | "Strategy";

export type InvestorSkillType =
  | "Market Analysis"
  | "Founder Assessment"
  | "Traction Analysis"
  | "Unit Economics"
  | "Valuation"
  | "Term Sheets"
  | "Portfolio Construction"
  | "Risk Management"
  | "Deal Sourcing"
  | "Investment Strategy";

export type JurySkillType =
  | "Pitch Evaluation"
  | "Market Evaluation"
  | "Team Evaluation"
  | "Traction Evaluation"
  | "Business Model Evaluation"
  | "Risk Assessment"
  | "Investment Thesis";

export type SkillCategory = "FOUNDER" | "INVESTOR" | "JURY";

export interface PlayerSkill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number; // 1 to 10
  xp: number; // XP within current level
  xpToNextLevel: number;
}

export interface PlayerRoleProgression {
  founder_xp: number;
  founder_level: number;
  investor_xp: number;
  investor_level: number;
  jury_xp: number;
  jury_level: number;
  syndicate_xp: number;
  syndicate_level: number;
}

export type UnlockTier =
  | 1 // Beginner: Company creation, Product, Marketing, Sales
  | 2 // Apprentice: Revenue, Burn, Runway, Pitching
  | 3 // Founder: Investors, Funding rounds, Valuation, Equity, Deal page
  | 4 // Investor: Portfolio, Follow-ons, Jury Chamber
  | 5 // Syndicate: Syndicates, Events, Advanced Strategy
  | 6; // Venture Builder: Multi-company, Advanced investing

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: RoleCategory;
  unlockTier: UnlockTier;
  targetCount: number;
  currentProgress: number;
  isCompleted: boolean;
  rewardXP: {
    category: RoleCategory;
    amount: number;
  };
  rewardBadge?: string;
  learningTakeaway: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: RoleCategory;
  unlockedAt?: string;
  isUnlocked: boolean;
  icon: string;
  learningTakeaway: string;
}

export type CoachingTriggerType =
  | "FIRST_COMPANY_CREATED"
  | "FIRST_ACTION_SPENT"
  | "RUNWAY_WARNING"
  | "RUNWAY_CRITICAL"
  | "DISTRESS_MODE"
  | "FIRST_PITCH_PASS"
  | "FIRST_TERM_SHEET"
  | "VALUATION_OVERREACH"
  | "FIRST_INVESTMENT_MADE"
  | "FIRST_SYNDICATE_CREATED"
  | "FIRST_EXIT_ACHIEVED"
  | "RAPID_BURN_MISTAKE"
  | "HIGH_DILUTION_WARNING";

export interface UnyCoachPrompt {
  id: string;
  trigger: CoachingTriggerType;
  title: string;
  message: string; // 1 to 2 sentences max
  whyConceptKey?: string; // Links directly to "WHY?" modal / library
  suggestedAction?: string;
}

export interface LibraryConcept {
  key: string;
  title: string;
  category:
    | "Starting a Company"
    | "Product"
    | "Customers"
    | "Revenue"
    | "Finance"
    | "Fundraising"
    | "Valuation"
    | "Equity"
    | "Investing"
    | "Syndicates"
    | "Exits"
    | "Strategy";
  definition: string;
  whyItMatters: string;
  example: string;
  inGameMetric: string;
}

export interface MiniChallenge {
  id: string;
  title: string;
  scenario: string;
  contextMetrics: {
    cash: number;
    burn: number;
    runway: number;
    offer?: string;
  };
  options: {
    id: string;
    label: string;
    consequence: string;
    xpGained: number;
    skillCategory: SkillCategory;
    skillName: string;
  }[];
}

export interface PlayerMistakeTracker {
  distressCount: number;
  burnExcessCount: number;
  overvaluationPitchCount: number;
  failedPitchesCount: number;
}
