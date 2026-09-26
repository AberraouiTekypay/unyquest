import {
  CapTableEntry,
  Company,
  Syndicate,
  SyndicateMember,
} from "./types";
import { GAME_CONFIG } from "./config";
import { executeFundingRound } from "./investment";

export interface CreateSyndicateInput {
  name: string;
  thesis: string;
  leader_id: string;
  leader_name: string;
  target_amount: number;
  leader_commitment: number;
  min_investment?: number;
}

export function createSyndicate(input: CreateSyndicateInput): Syndicate {
  const minRequiredLeaderCommitment =
    input.target_amount * GAME_CONFIG.MIN_SYNDICATE_LEADER_PERCENTAGE;

  if (input.leader_commitment < minRequiredLeaderCommitment) {
    throw new Error(
      `Leader skin-in-the-game requirement: Minimum 10% commitment required ($${minRequiredLeaderCommitment.toLocaleString()}). You provided $${input.leader_commitment.toLocaleString()}.`
    );
  }

  const leaderMember: SyndicateMember = {
    investor_id: input.leader_id,
    investor_name: `${input.leader_name} (Lead)`,
    committed_amount: input.leader_commitment,
    ownership_share_percentage:
      Math.round((input.leader_commitment / input.target_amount) * 1000) / 10,
    joined_at: new Date().toISOString(),
  };

  return {
    id: `syn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: input.name,
    thesis: input.thesis,
    leader_id: input.leader_id,
    leader_name: input.leader_name,
    target_amount: input.target_amount,
    committed_amount: input.leader_commitment,
    leader_commitment: input.leader_commitment,
    min_investment: input.min_investment || 5_000,
    members: [leaderMember],
    portfolio_companies: [],
    historical_returns: 1.0,
    reputation: 75,
    is_open: true,
    created_at: new Date().toISOString(),
  };
}

export function joinSyndicate(
  syndicate: Syndicate,
  memberId: string,
  memberName: string,
  amount: number
): Syndicate {
  if (!syndicate.is_open) {
    throw new Error("This syndicate is currently closed to new commitments.");
  }
  if (amount < syndicate.min_investment) {
    throw new Error(
      `Minimum investment for ${syndicate.name} is $${syndicate.min_investment.toLocaleString()}.`
    );
  }

  const remaining = syndicate.target_amount - syndicate.committed_amount;
  if (amount > remaining) {
    throw new Error(
      `Cannot overcommit. Remaining capacity is $${remaining.toLocaleString()}.`
    );
  }

  const newTotalCommitted = syndicate.committed_amount + amount;

  // Add or update member
  const existingMemberIndex = syndicate.members.findIndex(
    (m) => m.investor_id === memberId
  );
  let updatedMembers = [...syndicate.members];

  if (existingMemberIndex >= 0) {
    const prev = updatedMembers[existingMemberIndex];
    updatedMembers[existingMemberIndex] = {
      ...prev,
      committed_amount: prev.committed_amount + amount,
    };
  } else {
    updatedMembers.push({
      investor_id: memberId,
      investor_name: memberName,
      committed_amount: amount,
      ownership_share_percentage: 0,
      joined_at: new Date().toISOString(),
    });
  }

  // Recalculate pro-rata shares across all members based on current committed total
  updatedMembers = updatedMembers.map((m) => ({
    ...m,
    ownership_share_percentage:
      Math.round((m.committed_amount / newTotalCommitted) * 1000) / 10,
  }));

  const isOpen = newTotalCommitted < syndicate.target_amount;

  return {
    ...syndicate,
    committed_amount: newTotalCommitted,
    members: updatedMembers,
    is_open: isOpen,
  };
}

export function deploySyndicateInvestment(
  syndicate: Syndicate,
  company: Company,
  preMoneyValuation: number,
  existingCapTable: CapTableEntry[]
) {
  if (syndicate.committed_amount <= 0) {
    throw new Error("Syndicate has no committed capital to deploy.");
  }

  const executionResult = executeFundingRound({
    company,
    investor_id: syndicate.id,
    investor_name: `${syndicate.name} (Syndicate)`,
    amount: syndicate.committed_amount,
    pre_money_valuation: preMoneyValuation,
    existing_cap_table: existingCapTable,
    is_syndicate: true,
    syndicate_id: syndicate.id,
  });

  const updatedSyndicate: Syndicate = {
    ...syndicate,
    portfolio_companies: [...new Set([...syndicate.portfolio_companies, company.id])],
    is_open: false,
  };

  return {
    syndicate: updatedSyndicate,
    executionResult,
  };
}
