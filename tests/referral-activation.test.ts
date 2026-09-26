import { describe, it, expect } from "vitest";
import { createInitialPlayer } from "../src/engine/reputation";
import { createCompany } from "../src/engine/company";
import { executeFundingRound } from "../src/engine/investment";

describe("Referral System and Viral Friend Investment Loop", () => {
  it("should initialize new player with separate $100k Founder and $100k Investor capital", () => {
    const player = createInitialPlayer("user-invitee-1", "friend_sarah");

    expect(player.founder_capital).toBe(100_000);
    expect(player.investor_capital).toBe(100_000);
    expect(player.reputation.founder_level).toBe(1);
    expect(player.reputation.jury_level).toBe("Junior Jury");
  });

  it("should enable friend to use investor capital to invest in the inviting founder company", () => {
    // 1. Founder creates company
    const founder = createInitialPlayer("founder-user", "founder_amine");
    const company = createCompany({
      founder_id: founder.id,
      founder_name: founder.username,
      name: "SolarFlow",
      tagline: "Virtual power plant",
      sector: "Climate",
      market: "Americas",
      business_model: "Infrastructure",
      founder_strengths: ["Technical", "Domain expert"],
    });

    // 2. Friend joins via referral and receives $100K investor capital
    const friend = createInitialPlayer("friend-user", "investor_sarah");
    expect(friend.investor_capital).toBe(100_000);

    // 3. Friend invests $50,000 from investor capital into friend's company
    const investAmount = 50_000;
    const preMoneyValuation = company.metrics.valuation;

    const investmentResult = executeFundingRound({
      company,
      investor_id: friend.id,
      investor_name: friend.username,
      amount: investAmount,
      pre_money_valuation: preMoneyValuation,
      existing_cap_table: [],
    });

    friend.investor_capital -= investAmount;

    // Check balances and cap table
    expect(friend.investor_capital).toBe(50_000);
    expect(investmentResult.updated_company.metrics.cash).toBe(company.metrics.cash + investAmount);

    const friendCapEntry = investmentResult.updated_cap_table.find(
      (e) => e.investor_id === friend.id
    );
    expect(friendCapEntry).toBeDefined();
    expect(friendCapEntry?.equity_percentage).toBe(investmentResult.new_investor_equity);

    // 4. Friend still has $100,000 founder capital left to start their own startup!
    expect(friend.founder_capital).toBe(100_000);
  });
});
