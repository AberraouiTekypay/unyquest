import { describe, it, expect } from "vitest";
import { createCompany } from "../src/engine/company";
import { evaluatePitch, getPitchCost } from "../src/engine/pitch";

describe("Pitch Evaluation and Archetype Logic", () => {
  it("should charge correct pitch costs according to company stage", () => {
    expect(getPitchCost("Pre-seed")).toBe(5_000);
    expect(getPitchCost("Seed")).toBe(10_000);
    expect(getPitchCost("Series A")).toBe(25_000);
    expect(getPitchCost("Series B")).toBe(50_000);
  });

  it("should reject pitch with specific feedback when valuation is unrealistically high", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "Wild Dream AI",
      tagline: "Unsubstantiated claims",
      sector: "AI",
      market: "Global",
      business_model: "SaaS",
      founder_strengths: ["Technical"],
    });

    // Pitch asking for $25M valuation when intrinsic valuation is under $2M
    const outcome = evaluatePitch({
      company,
      problem: "Big problem",
      solution: "Unfinished algorithm",
      ask: 2_000_000,
      valuation: 25_000_000,
      target_archetype: "GENERALIST",
      use_of_funds: {
        product: 1_000_000,
        marketing: 500_000,
        hiring: 300_000,
        sales: 100_000,
        reserve: 100_000,
      },
    });

    expect(outcome.decision).toBe("PASS");
    expect(outcome.feedbackReason).toContain("valuation");
    expect(outcome.term_sheet).toBeUndefined();
  });

  it("should generate a valid Term Sheet when metrics and valuation align with archetype", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "Precision Moat",
      tagline: "Proprietary deep tech",
      sector: "AI",
      market: "Global",
      business_model: "Enterprise",
      founder_strengths: ["Technical", "Domain expert"],
    });

    // Boost stats to represent high traction company
    company.metrics.traction_score = 80;
    company.metrics.product_score = 85;
    company.metrics.defensibility_score = 90;
    company.metrics.revenue = 65_000;
    company.metrics.valuation = 4_000_000;

    const outcome = evaluatePitch({
      company,
      problem: "Enterprise security gap",
      solution: "Proprietary zero-trust AI mesh",
      ask: 500_000,
      valuation: 4_000_000,
      target_archetype: "SPECIALIST",
      use_of_funds: {
        product: 200_000,
        marketing: 100_000,
        hiring: 100_000,
        sales: 50_000,
        reserve: 50_000,
      },
    });

    expect(outcome.decision).toBe("TERM_SHEET");
    expect(outcome.term_sheet).toBeDefined();
    expect(outcome.term_sheet?.investment_amount).toBe(500_000);
    expect(outcome.term_sheet?.ownership_percentage).toBeGreaterThan(0);
    expect(outcome.term_sheet?.post_money_valuation).toBe(
      (outcome.term_sheet?.pre_money_valuation || 0) + 500_000
    );
  });
});
