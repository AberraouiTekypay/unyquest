import { describe, it, expect } from "vitest";
import { calculateExit, createCompany } from "../src/engine/company";
import { executeFundingRound } from "../src/engine/investment";
import { updateFounderReputation, updateInvestorReputation } from "../src/engine/reputation";

describe("Exit Calculations and Ecosystem Recycling", () => {
  it("should calculate correct acquisition proceeds for founder and investors", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "CloudScale OS",
      tagline: "Enterprise cloud orchestration",
      sector: "SaaS",
      market: "Global",
      business_model: "SaaS",
      founder_strengths: ["Technical", "Sales"],
    });

    company.metrics.valuation = 10_000_000;
    company.metrics.defensibility_score = 80;
    company.metrics.product_score = 90;

    // Investor put in $2M at $8M pre-money ($10M post -> 20% equity)
    const round = executeFundingRound({
      company,
      investor_id: "vc-1",
      investor_name: "Apex Ventures",
      amount: 2_000_000,
      pre_money_valuation: 8_000_000,
      existing_cap_table: [],
    });

    const exit = calculateExit(round.updated_company, round.updated_cap_table, "ACQUISITION");

    expect(exit.exit_valuation).toBeGreaterThan(10_000_000);
    // Founder owns 80%, investor owns 20%
    const expectedFounderProceeds = Math.round(exit.exit_valuation * 0.8);
    expect(exit.founder_proceeds).toBe(expectedFounderProceeds);

    const investorPayout = exit.investor_payouts.find((p) => p.investor_id === "vc-1");
    expect(investorPayout).toBeDefined();
    expect(investorPayout?.payout).toBe(Math.round(exit.exit_valuation * 0.2));
    expect(investorPayout?.moic).toBeGreaterThan(1.0);
  });

  it("should handle IPO exits with high MOIC and update reputations", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "BioNova",
      tagline: "Genomics",
      sector: "Healthcare",
      market: "Americas",
      business_model: "Enterprise",
      founder_strengths: ["Technical"],
    });

    company.metrics.valuation = 50_000_000;

    const round = executeFundingRound({
      company,
      investor_id: "angel-1",
      investor_name: "Early Angel",
      amount: 250_000,
      pre_money_valuation: 2_250_000,
      existing_cap_table: [],
    });

    // Simulate company growing to $50M valuation before executing IPO
    round.updated_company.metrics.valuation = 50_000_000;

    const exit = calculateExit(round.updated_company, round.updated_cap_table, "IPO");

    // IPO multiple is 2.5x of valuation -> $125M
    expect(exit.exit_valuation).toBe(125_000_000);

    const angelPayout = exit.investor_payouts.find((p) => p.investor_id === "angel-1");
    expect(angelPayout?.moic).toBeGreaterThan(10.0); // Monster return!

    // Check reputation gains
    const initialRep = {
      founder_reputation: 50,
      investor_reputation: 50,
      jury_reputation: 50,
      founder_level: 1,
      investor_level: 1,
      jury_level: "Junior Jury" as const,
    };

    const updatedFounderRep = updateFounderReputation(initialRep, "SUCCESSFUL_EXIT");
    expect(updatedFounderRep.founder_reputation).toBe(95);

    const updatedInvestorRep = updateInvestorReputation(initialRep, "WINNER_EXIT");
    expect(updatedInvestorRep.investor_reputation).toBe(90);
  });
});
