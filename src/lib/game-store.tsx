"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  CapTableEntry,
  Company,
  CompanyActionType,
  CompanyStage,
  ExitDetails,
  ExitType,
  Investment,
  JuryReview,
  MarketConditionState,
  PitchConfig,
  PitchOutcome,
  Player,
  Syndicate,
  TermSheet,
  TransactionLedgerEntry,
} from "@/engine/types";
import {
  calculateExit,
  createCompany as engineCreateCompany,
  spendCash as engineSpendCash,
  applyTurnGrowth as engineApplyTurnGrowth,
  calculateValuation,
} from "@/engine/company";
import { evaluatePitch, getPitchCost, negotiateCounterOffer } from "@/engine/pitch";
import { executeFundingRound, calculatePortfolioStats } from "@/engine/investment";
import {
  createSyndicate as engineCreateSyndicate,
  joinSyndicate as engineJoinSyndicate,
  deploySyndicateInvestment,
} from "@/engine/syndicate";
import {
  createInitialPlayer,
  updateFounderReputation,
  updateInvestorReputation,
  updateJuryReputation,
} from "@/engine/reputation";
import { cycleMarketCondition } from "@/engine/market";
import { SEED_STARTUP_ARCHETYPES } from "@/engine/archetypes";

interface GameContextType {
  player: Player;
  allPlayers: Player[];
  companies: Company[];
  activeCompany: Company | null;
  capTables: Record<string, CapTableEntry[]>;
  investments: Investment[];
  syndicates: Syndicate[];
  pendingTermSheets: TermSheet[];
  juryReviews: JuryReview[];
  transactions: TransactionLedgerEntry[];
  marketCondition: MarketConditionState;
  // Methods
  setActiveCompanyId: (id: string) => void;
  switchPlayer: (playerId: string) => void;
  createNewCompany: (input: {
    name: string;
    tagline: string;
    sector: any;
    market: any;
    business_model: any;
    founder_strengths: any[];
  }) => Company;
  executeAction: (companyId: string, actionType: CompanyActionType) => { success: boolean; message: string };
  submitPitchToNPC: (config: PitchConfig) => PitchOutcome;
  acceptTermSheet: (termSheetId: string) => { success: boolean; message: string };
  rejectTermSheet: (termSheetId: string) => void;
  counterTermSheet: (termSheetId: string, counterPreMoney: number, counterEquity: number) => { success: boolean; message: string };
  investInCompany: (companyId: string, amount: number) => { success: boolean; message: string };
  createNewSyndicate: (input: { name: string; thesis: string; target_amount: number; leader_commitment: number }) => { success: boolean; message: string };
  pledgeToSyndicate: (syndicateId: string, amount: number) => { success: boolean; message: string };
  deploySyndicateToCompany: (syndicateId: string, companyId: string) => { success: boolean; message: string };
  submitJuryEvaluation: (companyId: string, scores: { market: number; team: number; traction: number; business: number; valuation: number }, recommendation: "PASS" | "INTERESTED" | "RECOMMEND_INVESTMENT", notes: string) => void;
  executeExit: (companyId: string, exitType: ExitType) => ExitDetails;
  advanceCompanyMonth: (companyId: string) => void;
  advanceMarketCycleState: () => void;
  claimReferralInvite: (referralPlayerId: string, newUsername: string) => Player;
  resetGameToDefault: () => void;
}

const STORAGE_KEY = "VENTURE_GAME_STATE_V1";

// Generate initial seed state
function getInitialSeedState() {
  const defaultPlayer = createInitialPlayer("user-founder-1", "FounderAmine");
  
  // Create 20 seed companies from archetypes
  const seedCompanies: Company[] = SEED_STARTUP_ARCHETYPES.map((seed, index) => {
    const comp = engineCreateCompany({
      id: `seed-comp-${index + 1}`,
      founder_id: `npc-founder-${index + 1}`,
      founder_name: `Founder of ${seed.name}`,
      name: seed.name,
      tagline: seed.tagline,
      sector: seed.sector,
      market: seed.market,
      business_model: seed.business_model,
      founder_strengths: seed.founder_strengths,
      initial_treasury: 120_000,
    });
    // Set realistic traction values
    comp.metrics.users = seed.initial_users;
    comp.metrics.revenue = seed.initial_revenue;
    comp.metrics.monthly_burn = seed.initial_burn;
    comp.metrics.market_size = seed.tam;
    comp.metrics.valuation = calculateValuation(comp.metrics, comp.sector, "NORMAL");
    return comp;
  });

  const seedCapTables: Record<string, CapTableEntry[]> = {};
  seedCompanies.forEach((comp) => {
    seedCapTables[comp.id] = [
      {
        investor_id: comp.founder_id,
        investor_name: comp.founder_name,
        equity_percentage: 100,
        invested_amount: 0,
        entry_valuation: comp.metrics.valuation,
        is_founder: true,
      },
    ];
  });

  const seedSyndicates: Syndicate[] = [
    {
      id: "syn-seed-1",
      name: "Frontier AI Syndicate",
      thesis: "Backing deep tech & logistics moats with corridor advantages",
      leader_id: "npc-lead-1",
      leader_name: "Marcus Thorne (Lead)",
      target_amount: 300_000,
      committed_amount: 150_000,
      leader_commitment: 50_000,
      min_investment: 10_000,
      members: [
        {
          investor_id: "npc-lead-1",
          investor_name: "Marcus Thorne (Lead)",
          committed_amount: 50_000,
          ownership_share_percentage: 33.3,
          joined_at: new Date().toISOString(),
        },
        {
          investor_id: "npc-member-1",
          investor_name: "Horizon Angel Fund",
          committed_amount: 100_000,
          ownership_share_percentage: 66.7,
          joined_at: new Date().toISOString(),
        },
      ],
      portfolio_companies: [],
      historical_returns: 2.4,
      reputation: 88,
      is_open: true,
      created_at: new Date().toISOString(),
    },
  ];

  return {
    player: defaultPlayer,
    allPlayers: [defaultPlayer],
    companies: seedCompanies,
    activeCompanyId: null as string | null,
    capTables: seedCapTables,
    investments: [] as Investment[],
    syndicates: seedSyndicates,
    pendingTermSheets: [] as TermSheet[],
    juryReviews: [] as JuryReview[],
    transactions: [
      {
        id: "tx-init-founder",
        player_id: defaultPlayer.id,
        type: "STARTER_CAPITAL" as const,
        account: "FOUNDER_CAPITAL" as const,
        amount: 100_000,
        balance_after: 100_000,
        description: "Starter Founder Capital Granted",
        created_at: new Date().toISOString(),
      },
      {
        id: "tx-init-investor",
        player_id: defaultPlayer.id,
        type: "STARTER_CAPITAL" as const,
        account: "INVESTOR_CAPITAL" as const,
        amount: 100_000,
        balance_after: 100_000,
        description: "Starter Investor Capital Granted",
        created_at: new Date().toISOString(),
      },
    ] as TransactionLedgerEntry[],
    marketCondition: "NORMAL" as MarketConditionState,
  };
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(getInitialSeedState);

  // Hydrate from localStorage once on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch {
      // Fallback to default
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Failed to save state to localStorage", err);
      }
    }
  }, [state, mounted]);

  const activeCompany =
    state.companies.find((c) => c.id === state.activeCompanyId) ||
    state.companies.find((c) => c.founder_id === state.player.id) ||
    null;

  function setActiveCompanyId(id: string) {
    setState((prev) => ({ ...prev, activeCompanyId: id }));
  }

  function switchPlayer(playerId: string) {
    const targetPlayer = state.allPlayers.find((p) => p.id === playerId);
    if (targetPlayer) {
      setState((prev) => ({
        ...prev,
        player: targetPlayer,
        activeCompanyId: targetPlayer.active_company_id || null,
      }));
    }
  }

  function createNewCompany(input: {
    name: string;
    tagline: string;
    sector: any;
    market: any;
    business_model: any;
    founder_strengths: any[];
  }) {
    const newCompany = engineCreateCompany({
      founder_id: state.player.id,
      founder_name: state.player.username,
      name: input.name,
      tagline: input.tagline,
      sector: input.sector,
      market: input.market,
      business_model: input.business_model,
      founder_strengths: input.founder_strengths,
      initial_treasury: 100_000,
    });

    const initialCapTableEntry: CapTableEntry = {
      investor_id: state.player.id,
      investor_name: `${state.player.username} (Founder)`,
      equity_percentage: 100,
      invested_amount: 0,
      entry_valuation: newCompany.metrics.valuation,
      is_founder: true,
    };

    const newTx: TransactionLedgerEntry = {
      id: `tx-${Date.now()}`,
      player_id: state.player.id,
      company_id: newCompany.id,
      type: "COMPANY_ACTION_SPEND",
      account: "COMPANY_TREASURY",
      amount: 100_000,
      balance_after: 100_000,
      description: `Formed company ${newCompany.name} with initial treasury.`,
      created_at: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      companies: [newCompany, ...prev.companies],
      activeCompanyId: newCompany.id,
      player: {
        ...prev.player,
        active_company_id: newCompany.id,
      },
      capTables: {
        ...prev.capTables,
        [newCompany.id]: [initialCapTableEntry],
      },
      transactions: [newTx, ...prev.transactions],
    }));

    return newCompany;
  }

  function executeAction(companyId: string, actionType: CompanyActionType) {
    const targetComp = state.companies.find((c) => c.id === companyId);
    if (!targetComp) return { success: false, message: "Company not found" };

    const { company: updatedComp, cost, error } = engineSpendCash(
      targetComp,
      actionType,
      state.marketCondition
    );

    if (error) {
      return { success: false, message: error };
    }

    const tx: TransactionLedgerEntry = {
      id: `tx-${Date.now()}`,
      player_id: state.player.id,
      company_id: companyId,
      type: "COMPANY_ACTION_SPEND",
      account: "COMPANY_TREASURY",
      amount: -cost,
      balance_after: updatedComp.metrics.cash,
      description: `Action executed: ${actionType.replace("_", " ")} (-$${cost.toLocaleString()})`,
      created_at: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === companyId ? updatedComp : c)),
      transactions: [tx, ...prev.transactions],
    }));

    return { success: true, message: `Successfully executed action! Spent $${cost.toLocaleString()}.` };
  }

  function submitPitchToNPC(config: PitchConfig) {
    const cost = getPitchCost(config.company.metrics.stage);
    if (config.company.metrics.cash < cost) {
      return {
        decision: "PASS" as const,
        feedback_reason: `Insufficient company cash to pitch. Pitch fee is $${cost.toLocaleString()}, but company only has $${config.company.metrics.cash.toLocaleString()}.`,
        feedbackReason: `Insufficient company cash to pitch. Pitch fee is $${cost.toLocaleString()}, but company only has $${config.company.metrics.cash.toLocaleString()}.`,
        pitch_cost: cost,
        pitchCost: cost,
        score: 0,
        counter_allowed: false,
      };
    }

    // Deduct pitch fee from company cash
    const outcome = evaluatePitch(config);
    const updatedMetrics = { ...config.company.metrics };
    updatedMetrics.cash -= cost;

    const updatedCompany: Company = {
      ...config.company,
      metrics: updatedMetrics,
      updated_at: new Date().toISOString(),
    };

    const tx: TransactionLedgerEntry = {
      id: `tx-pitch-${Date.now()}`,
      player_id: state.player.id,
      company_id: config.company.id,
      type: "PITCH_FEE",
      account: "COMPANY_TREASURY",
      amount: -cost,
      balance_after: updatedMetrics.cash,
      description: `Paid pitch fee to ${config.target_archetype} investor (-$${cost.toLocaleString()})`,
      created_at: new Date().toISOString(),
    };

    setState((prev) => {
      const nextPending = outcome.term_sheet
        ? [outcome.term_sheet, ...prev.pendingTermSheets]
        : prev.pendingTermSheets;

      return {
        ...prev,
        companies: prev.companies.map((c) => (c.id === config.company.id ? updatedCompany : c)),
        pendingTermSheets: nextPending,
        transactions: [tx, ...prev.transactions],
      };
    });

    return outcome;
  }

  function acceptTermSheet(termSheetId: string) {
    const termSheet = state.pendingTermSheets.find((ts) => ts.id === termSheetId);
    if (!termSheet) return { success: false, message: "Term sheet not found" };

    const company = state.companies.find((c) => c.founder_id === state.player.id);
    if (!company) return { success: false, message: "Active company not found" };

    const currentCapTable = state.capTables[company.id] || [];

    const execution = executeFundingRound({
      company,
      investor_id: termSheet.investor_id,
      investor_name: termSheet.investor_name,
      amount: termSheet.investment_amount,
      pre_money_valuation: termSheet.pre_money_valuation,
      existing_cap_table: currentCapTable,
    });

    const updatedReputation = updateFounderReputation(
      state.player.reputation,
      "FUNDRAISE_SUCCESS"
    );

    const tx: TransactionLedgerEntry = {
      id: `tx-term-${Date.now()}`,
      player_id: state.player.id,
      company_id: company.id,
      type: "INVESTMENT_RECEIVED",
      account: "COMPANY_TREASURY",
      amount: termSheet.investment_amount,
      balance_after: execution.updated_company.metrics.cash,
      description: `Accepted term sheet from ${termSheet.investor_name} (+$${termSheet.investment_amount.toLocaleString()})`,
      created_at: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === company.id ? execution.updated_company : c
      ),
      capTables: {
        ...prev.capTables,
        [company.id]: execution.updated_cap_table,
      },
      investments: [execution.investment_record, ...prev.investments],
      pendingTermSheets: prev.pendingTermSheets.filter((ts) => ts.id !== termSheetId),
      player: {
        ...prev.player,
        reputation: updatedReputation,
      },
      transactions: [tx, ...prev.transactions],
    }));

    return {
      success: true,
      message: `Round closed! Company raised $${termSheet.investment_amount.toLocaleString()} for ${termSheet.ownership_percentage}% equity.`,
    };
  }

  function rejectTermSheet(termSheetId: string) {
    setState((prev) => ({
      ...prev,
      pendingTermSheets: prev.pendingTermSheets.filter((ts) => ts.id !== termSheetId),
    }));
  }

  function counterTermSheet(termSheetId: string, counterPreMoney: number, counterEquity: number) {
    const termSheet = state.pendingTermSheets.find((ts) => ts.id === termSheetId);
    if (!termSheet) return { success: false, message: "Term sheet not found" };

    const result = negotiateCounterOffer(termSheet, counterPreMoney, counterEquity);

    if (result.accepted && result.finalTermSheet) {
      setState((prev) => ({
        ...prev,
        pendingTermSheets: prev.pendingTermSheets.map((ts) =>
          ts.id === termSheetId ? result.finalTermSheet! : ts
        ),
      }));
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.message };
    }
  }

  function investInCompany(companyId: string, amount: number) {
    if (amount <= 0) return { success: false, message: "Amount must be positive." };
    if (state.player.investor_capital < amount) {
      return {
        success: false,
        message: `Insufficient Investor Capital. You have $${state.player.investor_capital.toLocaleString()}, need $${amount.toLocaleString()}.`,
      };
    }

    const company = state.companies.find((c) => c.id === companyId);
    if (!company) return { success: false, message: "Company not found" };

    const currentCapTable = state.capTables[company.id] || [];
    const preMoney = company.metrics.valuation;

    const execution = executeFundingRound({
      company,
      investor_id: state.player.id,
      investor_name: state.player.username,
      amount,
      pre_money_valuation: preMoney,
      existing_cap_table: currentCapTable,
    });

    const newInvestorCapital = state.player.investor_capital - amount;
    const updatedReputation = updateInvestorReputation(
      state.player.reputation,
      "INVESTMENT_MADE"
    );

    const tx: TransactionLedgerEntry = {
      id: `tx-invest-${Date.now()}`,
      player_id: state.player.id,
      company_id: company.id,
      type: "INVESTMENT_DEPLOYED",
      account: "INVESTOR_CAPITAL",
      amount: -amount,
      balance_after: newInvestorCapital,
      description: `Invested $${amount.toLocaleString()} into ${company.name} for ${execution.new_investor_equity}% equity.`,
      created_at: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        investor_capital: newInvestorCapital,
        reputation: updatedReputation,
      },
      companies: prev.companies.map((c) =>
        c.id === company.id ? execution.updated_company : c
      ),
      capTables: {
        ...prev.capTables,
        [company.id]: execution.updated_cap_table,
      },
      investments: [execution.investment_record, ...prev.investments],
      transactions: [tx, ...prev.transactions],
    }));

    return {
      success: true,
      message: `Investment confirmed! You now own ${execution.new_investor_equity}% of ${company.name}.`,
    };
  }

  function createNewSyndicate(input: {
    name: string;
    thesis: string;
    target_amount: number;
    leader_commitment: number;
  }) {
    if (state.player.investor_capital < input.leader_commitment) {
      return {
        success: false,
        message: `Insufficient Investor Capital for leader commitment of $${input.leader_commitment.toLocaleString()}.`,
      };
    }

    try {
      const newSyndicate = engineCreateSyndicate({
        name: input.name,
        thesis: input.thesis,
        leader_id: state.player.id,
        leader_name: state.player.username,
        target_amount: input.target_amount,
        leader_commitment: input.leader_commitment,
      });

      const newInvestorCapital = state.player.investor_capital - input.leader_commitment;
      const updatedReputation = updateInvestorReputation(
        state.player.reputation,
        "SYNDICATE_LED"
      );

      const tx: TransactionLedgerEntry = {
        id: `tx-syn-${Date.now()}`,
        player_id: state.player.id,
        type: "SYNDICATE_COMMITMENT",
        account: "INVESTOR_CAPITAL",
        amount: -input.leader_commitment,
        balance_after: newInvestorCapital,
        description: `Committed leader skin-in-the-game to ${newSyndicate.name}`,
        created_at: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          investor_capital: newInvestorCapital,
          reputation: updatedReputation,
        },
        syndicates: [newSyndicate, ...prev.syndicates],
        transactions: [tx, ...prev.transactions],
      }));

      return { success: true, message: `Syndicate "${newSyndicate.name}" established!` };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to create syndicate" };
    }
  }

  function pledgeToSyndicate(syndicateId: string, amount: number) {
    if (state.player.investor_capital < amount) {
      return { success: false, message: "Insufficient Investor Capital." };
    }

    const syndicate = state.syndicates.find((s) => s.id === syndicateId);
    if (!syndicate) return { success: false, message: "Syndicate not found" };

    try {
      const updatedSyndicate = engineJoinSyndicate(
        syndicate,
        state.player.id,
        state.player.username,
        amount
      );

      const newCapital = state.player.investor_capital - amount;

      const tx: TransactionLedgerEntry = {
        id: `tx-join-syn-${Date.now()}`,
        player_id: state.player.id,
        type: "SYNDICATE_COMMITMENT",
        account: "INVESTOR_CAPITAL",
        amount: -amount,
        balance_after: newCapital,
        description: `Pledged $${amount.toLocaleString()} to ${syndicate.name}`,
        created_at: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          investor_capital: newCapital,
        },
        syndicates: prev.syndicates.map((s) =>
          s.id === syndicateId ? updatedSyndicate : s
        ),
        transactions: [tx, ...prev.transactions],
      }));

      return { success: true, message: `Successfully pledged $${amount.toLocaleString()}!` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  function deploySyndicateToCompany(syndicateId: string, companyId: string) {
    const syndicate = state.syndicates.find((s) => s.id === syndicateId);
    const company = state.companies.find((c) => c.id === companyId);
    if (!syndicate || !company) return { success: false, message: "Resource not found" };

    const currentCapTable = state.capTables[company.id] || [];

    const { syndicate: updatedSyndicate, executionResult } = deploySyndicateInvestment(
      syndicate,
      company,
      company.metrics.valuation,
      currentCapTable
    );

    setState((prev) => ({
      ...prev,
      syndicates: prev.syndicates.map((s) => (s.id === syndicateId ? updatedSyndicate : s)),
      companies: prev.companies.map((c) =>
        c.id === companyId ? executionResult.updated_company : c
      ),
      capTables: {
        ...prev.capTables,
        [company.id]: executionResult.updated_cap_table,
      },
      investments: [executionResult.investment_record, ...prev.investments],
    }));

    return {
      success: true,
      message: `${syndicate.name} deployed $${syndicate.committed_amount.toLocaleString()} into ${company.name}!`,
    };
  }

  function submitJuryEvaluation(
    companyId: string,
    scores: { market: number; team: number; traction: number; business: number; valuation: number },
    recommendation: "PASS" | "INTERESTED" | "RECOMMEND_INVESTMENT",
    notes: string
  ) {
    const review: JuryReview = {
      id: `jury-rev-${Date.now()}`,
      jury_id: state.player.id,
      jury_name: state.player.username,
      company_id: companyId,
      market_score: scores.market,
      team_score: scores.team,
      traction_score: scores.traction,
      business_model_score: scores.business,
      valuation_fairness_score: scores.valuation,
      recommendation,
      notes,
      created_at: new Date().toISOString(),
    };

    const newEvalCount = state.juryReviews.filter((r) => r.jury_id === state.player.id).length + 1;
    const updatedRep = updateJuryReputation(state.player.reputation, newEvalCount, 8);

    setState((prev) => ({
      ...prev,
      juryReviews: [review, ...prev.juryReviews],
      player: {
        ...prev.player,
        reputation: updatedRep,
      },
    }));
  }

  function executeExit(companyId: string, exitType: ExitType) {
    const company = state.companies.find((c) => c.id === companyId);
    if (!company) throw new Error("Company not found");

    const capTable = state.capTables[company.id] || [];
    const exitDetails = calculateExit(company, capTable, exitType);

    // If active player is founder, pay them exit proceeds into INVESTOR capital (ecosystem recycling loop!)
    const isPlayerFounder = company.founder_id === state.player.id;
    let newInvestorCapital = state.player.investor_capital;
    let newFounderRep = state.player.reputation.founder_reputation;

    if (isPlayerFounder && exitDetails.founder_proceeds > 0) {
      newInvestorCapital += exitDetails.founder_proceeds;
      newFounderRep += exitType === "IPO" ? 80 : 40;
    }

    const updatedCompany: Company = {
      ...company,
      metrics: {
        ...company.metrics,
        is_exited: true,
        stage: "Exit",
      },
      exit_details: exitDetails,
      updated_at: new Date().toISOString(),
    };

    const tx: TransactionLedgerEntry = {
      id: `tx-exit-${Date.now()}`,
      player_id: state.player.id,
      company_id: company.id,
      type: "EXIT_PAYOUT",
      account: "INVESTOR_CAPITAL",
      amount: exitDetails.founder_proceeds,
      balance_after: newInvestorCapital,
      description: `Exit finalized (${exitType}): Received $${exitDetails.founder_proceeds.toLocaleString()} proceeds into Investor Capital.`,
      created_at: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        investor_capital: newInvestorCapital,
        reputation: {
          ...prev.player.reputation,
          founder_reputation: newFounderRep,
        },
      },
      companies: prev.companies.map((c) => (c.id === companyId ? updatedCompany : c)),
      transactions: [tx, ...prev.transactions],
    }));

    return exitDetails;
  }

  function advanceCompanyMonth(companyId: string) {
    const company = state.companies.find((c) => c.id === companyId);
    if (!company) return;

    const updated = engineApplyTurnGrowth(company, state.marketCondition);

    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === companyId ? updated : c)),
    }));
  }

  function advanceMarketCycleState() {
    const nextState = cycleMarketCondition(state.marketCondition);
    setState((prev) => ({ ...prev, marketCondition: nextState }));
  }

  function claimReferralInvite(referralPlayerId: string, newUsername: string): Player {
    const newPlayer = createInitialPlayer(`user-${Date.now()}`, newUsername);
    newPlayer.invited_by = referralPlayerId;

    // Credit inviter with referral count
    setState((prev) => {
      const inviter = prev.allPlayers.find((p) => p.id === referralPlayerId);
      const updatedInviter = inviter
        ? { ...inviter, referrals_count: inviter.referrals_count + 1 }
        : null;

      return {
        ...prev,
        allPlayers: updatedInviter
          ? [...prev.allPlayers.map((p) => (p.id === referralPlayerId ? updatedInviter : p)), newPlayer]
          : [...prev.allPlayers, newPlayer],
        player: newPlayer,
        activeCompanyId: null,
      };
    });

    return newPlayer;
  }

  function resetGameToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    setState(getInitialSeedState());
  }

  return (
    <GameContext.Provider
      value={{
        player: state.player,
        allPlayers: state.allPlayers,
        companies: state.companies,
        activeCompany,
        capTables: state.capTables,
        investments: state.investments,
        syndicates: state.syndicates,
        pendingTermSheets: state.pendingTermSheets,
        juryReviews: state.juryReviews,
        transactions: state.transactions,
        marketCondition: state.marketCondition,
        setActiveCompanyId,
        switchPlayer,
        createNewCompany,
        executeAction,
        submitPitchToNPC,
        acceptTermSheet,
        rejectTermSheet,
        counterTermSheet,
        investInCompany,
        createNewSyndicate,
        pledgeToSyndicate,
        deploySyndicateToCompany,
        submitJuryEvaluation,
        executeExit,
        advanceCompanyMonth,
        advanceMarketCycleState,
        claimReferralInvite,
        resetGameToDefault,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
