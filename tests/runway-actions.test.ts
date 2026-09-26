import { describe, it, expect } from "vitest";
import { calculateRunway, createCompany, spendCash } from "../src/engine/company";

describe("Runway and Action Trade-offs", () => {
  it("should calculate correct runway in months", () => {
    expect(calculateRunway(100_000, 20_000)).toBe(5.0);
    expect(calculateRunway(50_000, 20_000)).toBe(2.5);
    expect(calculateRunway(15_000, 20_000)).toBe(0.8);
    expect(calculateRunway(0, 20_000)).toBe(0);
    expect(calculateRunway(100_000, 0)).toBe(99.9);
  });

  it("should enforce action trade-offs and not just make everything strictly better", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "SaaS Scale",
      tagline: "B2B productivity",
      sector: "SaaS",
      market: "Americas",
      business_model: "Subscription",
      founder_strengths: ["Product"],
      initial_treasury: 100_000,
    });

    const initialBurn = company.metrics.monthly_burn;
    const initialCash = company.metrics.cash;

    // Action: Hire Key Talent ($25,000 cost, +9 team, but adds +$4,000 monthly burn!)
    const result = spendCash(company, "hire");
    expect(result.error).toBeUndefined();
    expect(result.company.metrics.cash).toBe(initialCash - 25_000);
    expect(result.company.metrics.team_score).toBeGreaterThan(company.metrics.team_score);
    // Burn MUST have increased as trade-off
    expect(result.company.metrics.monthly_burn).toBe(initialBurn + 4000);
    // Runway must have shortened due to both cash spent and higher burn
    expect(result.company.metrics.runway).toBeLessThan(company.metrics.runway);
  });

  it("should trigger distress mode when cash reaches zero", () => {
    const company = createCompany({
      founder_id: "founder-1",
      founder_name: "Amine",
      name: "Cash Strangled",
      tagline: "Running out of runway",
      sector: "Food",
      market: "Americas",
      business_model: "Marketplace",
      founder_strengths: ["Operations"],
      initial_treasury: 25_000,
    });

    // Hire costs 25,000 -> cash becomes 0
    const result = spendCash(company, "hire");
    expect(result.company.metrics.cash).toBe(0);
    expect(result.company.metrics.is_distressed).toBe(true);
    expect(result.company.metrics.runway).toBe(0);
  });
});
