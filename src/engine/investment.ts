import {
  CapTableEntry,
  Company,
  CompanyStage,
  Investment,
} from "./types";

export interface InvestmentExecutionParams {
  company: Company;
  investor_id: string;
  investor_name: string;
  amount: number;
  pre_money_valuation: number;
  existing_cap_table: CapTableEntry[];
  is_syndicate?: boolean;
  syndicate_id?: string;
}

export interface InvestmentExecutionResult {
  updated_company: Company;
  updated_cap_table: CapTableEntry[];
  investment_record: Investment;
  dilution_percentage: number;
  new_investor_equity: number;
  post_money_valuation: number;
}

export const STAGE_PROGRESSION: Record<CompanyStage, CompanyStage> = {
  "Pre-seed": "Seed",
  Seed: "Series A",
  "Series A": "Series B",
  "Series B": "Growth",
  Growth: "Growth",
  Exit: "Exit",
};

/**
 * Executes a formal venture funding round.
 * Calculates post-money valuation, investor equity share, and proportional
 * dilution across all existing cap table holders. Normalizes cap table sum to 100%,
 * updates company treasury cash, and checks stage promotion thresholds.
 *
 * @param params - Execution parameters (company, investor details, amount, pre-money, cap table)
 * @returns InvestmentExecutionResult containing updated company, cap table, dilution %, and investment record
 */
export function executeFundingRound(
  params: InvestmentExecutionParams
): InvestmentExecutionResult {
  const {
    company,
    investor_id,
    investor_name,
    amount,
    pre_money_valuation,
    existing_cap_table,
    is_syndicate,
    syndicate_id,
  } = params;

  if (amount <= 0) {
    throw new Error("Investment amount must be greater than zero.");
  }
  if (pre_money_valuation <= 0) {
    throw new Error("Pre-money valuation must be positive.");
  }

  // 1. Calculate post-money and dilution factor
  const postMoneyValuation = pre_money_valuation + amount;
  const newInvestorEquityFraction = amount / postMoneyValuation;
  const newInvestorEquityPct = Math.round(newInvestorEquityFraction * 1000) / 10; // e.g. 14.3%
  const dilutionFactor = 1 - newInvestorEquityFraction;

  // 2. Dilute existing cap table entries proportionally
  let updatedCapTable: CapTableEntry[] = [];

  if (!existing_cap_table || existing_cap_table.length === 0) {
    // Initialize if empty: founder owned 100%
    const founderEquity = Math.round(100 * dilutionFactor * 10) / 10;
    updatedCapTable = [
      {
        investor_id: company.founder_id,
        investor_name: `${company.founder_name} (Founder)`,
        equity_percentage: founderEquity,
        invested_amount: 0,
        entry_valuation: pre_money_valuation,
        is_founder: true,
      },
      {
        investor_id,
        investor_name,
        equity_percentage: newInvestorEquityPct,
        invested_amount: amount,
        entry_valuation: postMoneyValuation,
        is_syndicate,
        syndicate_id,
      },
    ];
  } else {
    // Dilute each existing stakeholder
    updatedCapTable = existing_cap_table.map((entry) => ({
      ...entry,
      equity_percentage: Math.round(entry.equity_percentage * dilutionFactor * 10) / 10,
    }));

    // Check if investor already on cap table
    const existingIndex = updatedCapTable.findIndex(
      (e) => e.investor_id === investor_id
    );

    if (existingIndex >= 0) {
      updatedCapTable[existingIndex].equity_percentage =
        Math.round(
          (updatedCapTable[existingIndex].equity_percentage + newInvestorEquityPct) * 10
        ) / 10;
      updatedCapTable[existingIndex].invested_amount += amount;
    } else {
      updatedCapTable.push({
        investor_id,
        investor_name,
        equity_percentage: newInvestorEquityPct,
        invested_amount: amount,
        entry_valuation: postMoneyValuation,
        is_syndicate,
        syndicate_id,
      });
    }
  }

  // 3. Normalize cap table sum to ensure exactly 100%
  const totalEquity = updatedCapTable.reduce((sum, e) => sum + e.equity_percentage, 0);
  const diff = 100 - totalEquity;
  if (Math.abs(diff) > 0 && Math.abs(diff) < 2) {
    // Minor rounding adjustment to founder or largest holder
    const founderEntry = updatedCapTable.find((e) => e.is_founder) || updatedCapTable[0];
    founderEntry.equity_percentage =
      Math.round((founderEntry.equity_percentage + diff) * 10) / 10;
  }

  // Calculate new founder ownership and total investor ownership
  const founderEquity =
    updatedCapTable.find((e) => e.is_founder)?.equity_percentage ??
    Math.round(100 * dilutionFactor * 10) / 10;
  const totalInvestorEquity = Math.round((100 - founderEquity) * 10) / 10;

  // 4. Update company metrics
  const newCash = company.metrics.cash + amount;
  const newBurn = company.metrics.monthly_burn;
  const newRunway =
    newBurn > 0 ? Math.round((newCash / newBurn) * 10) / 10 : 99.9;

  // Check stage progression
  let currentStage = company.metrics.stage;
  const newTotalRaised = (company.total_raised || 0) + amount;

  if (currentStage === "Pre-seed" && newTotalRaised >= 250_000) {
    currentStage = "Seed";
  } else if (currentStage === "Seed" && newTotalRaised >= 1_000_000) {
    currentStage = "Series A";
  } else if (currentStage === "Series A" && newTotalRaised >= 5_000_000) {
    currentStage = "Series B";
  } else if (currentStage === "Series B" && newTotalRaised >= 20_000_000) {
    currentStage = "Growth";
  }

  const updatedCompany: Company = {
    ...company,
    total_raised: newTotalRaised,
    metrics: {
      ...company.metrics,
      cash: newCash,
      runway: newRunway,
      valuation: postMoneyValuation,
      founder_ownership: founderEquity,
      investor_ownership: totalInvestorEquity,
      is_distressed: false, // Influx of cash resolves distress mode
      stage: currentStage,
    },
    updated_at: new Date().toISOString(),
  };

  // 5. Build investment record for investor portfolio
  const investmentRecord: Investment = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    investor_id,
    investor_name,
    company_id: company.id,
    company_name: company.name,
    amount_invested: amount,
    equity_percentage: newInvestorEquityPct,
    entry_valuation: postMoneyValuation,
    current_valuation: postMoneyValuation,
    virtual_return: Math.round(postMoneyValuation * (newInvestorEquityPct / 100)),
    moic: 1.0,
    is_exited: false,
    created_at: new Date().toISOString(),
  };

  return {
    updated_company: updatedCompany,
    updated_cap_table: updatedCapTable,
    investment_record: investmentRecord,
    dilution_percentage: Math.round((1 - dilutionFactor) * 1000) / 10,
    new_investor_equity: newInvestorEquityPct,
    post_money_valuation: postMoneyValuation,
  };
}

/**
 * Aggregates portfolio performance metrics across all active and exited investments.
 * Calculates total deployed capital, current unrealized valuation, aggregate virtual MOIC,
 * and tracks breakout winners vs written-off positions.
 *
 * @param investments - Array of investment positions
 * @returns Object containing totalInvested, totalCurrentValue, virtualMOIC, winners, and failures
 */
export function calculatePortfolioStats(investments: Investment[]) {
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount_invested, 0);
  const totalCurrentValue = investments.reduce(
    (acc, inv) =>
      acc + (inv.is_exited ? (inv.exit_proceeds ?? 0) : inv.virtual_return),
    0
  );

  const virtualMOIC =
    totalInvested > 0
      ? Math.round((totalCurrentValue / totalInvested) * 100) / 100
      : 1.0;

  const winners = investments.filter((inv) => inv.moic >= 1.5).length;
  const failures = investments.filter(
    (inv) => inv.is_exited && (inv.exit_proceeds ?? 0) < inv.amount_invested
  ).length;

  return {
    totalInvested,
    totalCurrentValue,
    virtualMOIC,
    winners,
    failures,
    activeCount: investments.filter((inv) => !inv.is_exited).length,
  };
}
