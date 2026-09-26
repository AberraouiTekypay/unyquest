import { describe, it, expect } from "vitest";
import { createSyndicate, joinSyndicate, deploySyndicateInvestment } from "../src/engine/syndicate";
import { createCompany } from "../src/engine/company";

describe("Syndicate Allocation and Leader Rules", () => {
  it("should enforce minimum 10% leader commitment", () => {
    // Target $500,000 -> minimum $50,000 required
    expect(() =>
      createSyndicate({
        name: "Atlas Syndicate",
        thesis: "AI & Fintech focus",
        leader_id: "lead-1",
        leader_name: "Amine",
        target_amount: 500_000,
        leader_commitment: 40_000, // Only 8% -> should throw!
      })
    ).toThrow(/Minimum 10% commitment required/);

    const validSyndicate = createSyndicate({
      name: "Atlas Syndicate",
      thesis: "AI & Fintech focus",
      leader_id: "lead-1",
      leader_name: "Amine",
      target_amount: 500_000,
      leader_commitment: 50_000, // Exactly 10%
    });

    expect(validSyndicate.committed_amount).toBe(50_000);
    expect(validSyndicate.members.length).toBe(1);
    expect(validSyndicate.members[0].committed_amount).toBe(50_000);
  });

  it("should allocate pro-rata ownership shares according to member contributions", () => {
    const syndicate = createSyndicate({
      name: "Atlas Syndicate",
      thesis: "Frontier tech",
      leader_id: "lead-1",
      leader_name: "Amine",
      target_amount: 200_000,
      leader_commitment: 50_000, // 25% of target
    });

    // Member 1 joins with $100,000
    const syn2 = joinSyndicate(syndicate, "mem-1", "Sarah", 100_000);
    // Member 2 joins with $50,000 (total now $200,000)
    const synFinal = joinSyndicate(syn2, "mem-2", "David", 50_000);

    expect(synFinal.committed_amount).toBe(200_000);
    expect(synFinal.is_open).toBe(false); // Reached target

    const lead = synFinal.members.find((m) => m.investor_id === "lead-1");
    const sarah = synFinal.members.find((m) => m.investor_id === "mem-1");
    const david = synFinal.members.find((m) => m.investor_id === "mem-2");

    // Leader: $50k / $200k = 25%
    expect(lead?.ownership_share_percentage).toBe(25);
    // Sarah: $100k / $200k = 50%
    expect(sarah?.ownership_share_percentage).toBe(50);
    // David: $50k / $200k = 25%
    expect(david?.ownership_share_percentage).toBe(25);
  });

  it("should deploy pooled capital into company cap table correctly", () => {
    const syndicate = createSyndicate({
      name: "Atlas Syndicate",
      thesis: "Frontier tech",
      leader_id: "lead-1",
      leader_name: "Amine",
      target_amount: 200_000,
      leader_commitment: 50_000,
    });
    const filledSyndicate = joinSyndicate(syndicate, "mem-1", "Sarah", 150_000);

    const company = createCompany({
      founder_id: "founder-2",
      founder_name: "Elena",
      name: "Nexus Bio",
      tagline: "Synthetic biology platform",
      sector: "Healthcare",
      market: "Global",
      business_model: "Enterprise",
      founder_strengths: ["Technical", "Domain expert"],
    });

    const { syndicate: closedSyn, executionResult } = deploySyndicateInvestment(
      filledSyndicate,
      company,
      1_800_000,
      []
    );

    expect(closedSyn.is_open).toBe(false);
    expect(closedSyn.portfolio_companies).toContain(company.id);
    // Post-money = $1.8M + $200k = $2M -> Syndicate gets 10%
    expect(executionResult.post_money_valuation).toBe(2_000_000);
    expect(executionResult.new_investor_equity).toBe(10);
    expect(executionResult.updated_company.metrics.cash).toBe(company.metrics.cash + 200_000);
  });
});
