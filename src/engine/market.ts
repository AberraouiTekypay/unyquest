import {
  MarketConditionState,
  RandomEvent,
} from "./types";
import { GAME_CONFIG } from "./config";

export const RANDOM_EVENTS_DECK: RandomEvent[] = [
  {
    id: "evt-pos-1",
    title: "Viral Distribution Surge",
    description: "An authentic influencer recommendation catapulted your signups overnight.",
    type: "POSITIVE",
    effect: {
      users_delta: 2500,
      traction_score_delta: 6,
      revenue_delta: 8000,
    },
  },
  {
    id: "evt-pos-2",
    title: "Fortune 500 Pilot Contract",
    description: "Closed a key annual enterprise license with upfront payment.",
    type: "POSITIVE",
    effect: {
      revenue_delta: 25000,
      cash_delta: 25000,
      traction_score_delta: 8,
    },
  },
  {
    id: "evt-pos-3",
    title: "10x Engineering Hire",
    description: "A former tier-1 tech lead joined your startup, dramatically optimizing stack performance.",
    type: "POSITIVE",
    effect: {
      team_score_delta: 8,
      product_score_delta: 7,
      burn_delta: 3000,
    },
  },
  {
    id: "evt-neg-1",
    title: "Deep-Pocketed Competitor Enters",
    description: "A rival startup raised a massive Series A and flooded paid ads in your corridor.",
    type: "NEGATIVE",
    effect: {
      traction_score_delta: -5,
      burn_delta: 2500,
    },
  },
  {
    id: "evt-neg-2",
    title: "Critical Cloud Outage & Churn",
    description: "A third-party hosting outage resulted in SLA breaches and temporary churn.",
    type: "NEGATIVE",
    effect: {
      users_delta: -300,
      revenue_delta: -4000,
      product_score_delta: -4,
    },
  },
  {
    id: "evt-neg-3",
    title: "Procurement Delay Freeze",
    description: "Enterprise buyers froze discretionary software budgets, extending sales cycles.",
    type: "NEGATIVE",
    effect: {
      revenue_delta: -6000,
      cash_delta: -8000,
    },
  },
];

export function getRandomEvent(): RandomEvent {
  const randomIndex = Math.floor(Math.random() * RANDOM_EVENTS_DECK.length);
  return RANDOM_EVENTS_DECK[randomIndex];
}

export function cycleMarketCondition(current: MarketConditionState): MarketConditionState {
  const sequence: MarketConditionState[] = ["NORMAL", "BOOM", "TIGHT", "CRISIS"];
  const currentIndex = sequence.indexOf(current);
  const nextIndex = (currentIndex + 1) % sequence.length;
  return sequence[nextIndex];
}

export interface EcosystemEvent {
  id: string;
  title: string;
  type: "DEMO_DAY" | "INVESTOR_DAY" | "PITCH_BATTLE" | "SECTOR_CHALLENGE";
  description: string;
  prize_capital: number;
  sector_focus?: string;
  status: "UPCOMING" | "LIVE" | "CONCLUDED";
  participants_count: number;
}

export const ECOSYSTEM_EVENTS: EcosystemEvent[] = [
  {
    id: "ev-demo-day",
    title: "Silicon Global Virtual Demo Day",
    type: "DEMO_DAY",
    description: "Top 20 startups pitch before 100+ accredited venture funds and angels.",
    prize_capital: 150_000,
    status: "LIVE",
    participants_count: 48,
  },
  {
    id: "ev-ai-challenge",
    title: "Autonomous AI Frontier Challenge",
    type: "SECTOR_CHALLENGE",
    sector_focus: "AI",
    description: "Proprietary algorithm benchmark and defensibility tournament.",
    prize_capital: 250_000,
    status: "UPCOMING",
    participants_count: 32,
  },
  {
    id: "ev-pitch-battle",
    title: "Flash Pitch Battle — Seed Edition",
    type: "PITCH_BATTLE",
    description: "Head-to-head 3-minute pitch showdown judged live by senior jury members.",
    prize_capital: 75_000,
    status: "LIVE",
    participants_count: 24,
  },
];
