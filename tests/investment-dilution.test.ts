import { describe, it, expect } from "vitest";
import { createCompany } from "../src/engine/company";
import { executeFundingRound, calculatePortfolioStats } from "../src/engine/investment";
import { Investment } from "../src/engine/types";

describe("Investment, Dilution, and Ownership Calculations", () => {
  it("should calculate correct pre-money, post-money, and investor equity in round", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "Atlas Flow",
      tagline: "Autonomous Logistics",
      sector: "Logistics",
      market: "Global",
      business_model: "SaaS",
      founder_strengths: ["Technical", "Operations"],
      initial_treasury: 100_000,
    });

    const preMoney = 1_500_000;
    const investmentAmount = 250_000;

    const result = executeFundingRound({
      company,
      investor_id: "investor-1",
      investor_name: "Eleanor Vance",
      amount: investmentAmount,
      pre_money_valuation: preMoney,
      existing_cap_table: [],
    });

    // Post-money = $1.5M + $250k = $1.75M
    expect(result.post_money_valuation).toBe(1_750_000);
    // Investor equity = 250k / 1.75M = 14.285% -> ~14.3%
    expect(result.new_investor_equity).toBeCloseTo(14.3, 1);
    // Founder equity should be diluted from 100% to ~85.7%
    const founderEntry = result.updated_cap_table.find((e) => e.is_founder);
    expect(founderEntry?.equity_percentage).toBeCloseTo(85.7, 1);
    // Total cap table equity must sum to 100%
    const totalEquity = result.updated_cap_table.reduce(
      (sum, e) => sum + e.equity_percentage,
      0
    );
    expect(totalEquity).toBeCloseTo(100, 1);
    // Company cash increased by $250k
    expect(result.updated_company.metrics.cash).toBe(100_000 + 250_000);
  });

  it("should dilute existing investors proportionally in subsequent rounds", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "Atlas Flow",
      tagline: "Autonomous Logistics",
      sector: "Logistics",
      market: "Global",
      business_model: "SaaS",
      founder_strengths: ["Technical"],
    });

    // Round 1: $250K at $1.75M post-money
    const round1 = executeFundingRound({
      company,
      investor_id: "angel-1",
      investor_name: "Seed Angel",
      amount: 250_000,
      pre_money_valuation: 1_500_000,
      existing_cap_table: [],
    });

    // Round 2 (Series A): $1M at $4M pre-money ($5M post-money = 20% to Series A lead)
    const round2 = executeFundingRound({
      company: round1.updated_company,
      investor_id: "vc-1",
      investor_name: "Tier 1 VC",
      amount: 1_000_000,
      pre_money_valuation: 4_000_000,
      existing_cap_table: round1.updated_cap_table,
    });

    expect(round2.post_money_valuation).toBe(5_000_000);
    expect(round2.new_investor_equity).toBeCloseTo(20.0, 1);

    // Angel was 14.3%, diluted by 20% -> 14.3 * 0.8 = ~11.4%
    const angelEntry = round2.updated_cap_table.find((e) => e.investor_id === "angel-1");
    expect(angelEntry?.equity_percentage).toBeCloseTo(11.4, 1);

    // Cap table must total 100%
    const totalEquity = round2.updated_cap_table.reduce(
      (sum, e) => sum + e.equity_percentage,
      0
    );
    expect(totalEquity).toBeCloseTo(100, 1);
  });

  it("should calculate correct investor portfolio stats and MOIC", () => {
    const investments: Investment[] = [
      {
        id: "inv-1",
        investor_id: "inv-user",
        investor_name: "User",
        company_id: "comp-1",
        company_name: "Startup A",
        amount_invested: 50_000,
        equity_percentage: 10,
        entry_valuation: 500_000,
        current_valuation: 2_000_000,
        virtual_return: 200_000, // 4x
        moic: 4.0,
        is_exited: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "inv-2",
        investor_id: "inv-user",
        investor_name: "User",
        company_id: "comp-2",
        company_name: "Startup B",
        amount_invested: 50_000,
        equity_percentage: 5,
        entry_valuation: 1_000_000,
        current_valuation: 600_000,
        virtual_return: 30_000, // 0.6x
        moic: 0.6,
        is_exited: false,
        created_at: new Date().toISOString(),
      },
    ];

    const stats = calculatePortfolioStats(investments);
    expect(stats.totalInvested).toBe(100_000);
    expect(stats.totalCurrentValue).toBe(230_000);
    expect(stats.virtualMOIC).toBe(2.3);
    expect(stats.winners).toBe(1); // MOIC >= 1.5
    expect(stats.failures).toBe(0);
  });
});
