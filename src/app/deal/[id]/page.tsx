"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Coins,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/lib/game-store";

export default function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const {
    companies,
    player,
    investInCompany,
    claimReferralInvite,
  } = useGame();

  const [investmentAmount, setInvestmentAmount] = useState<number>(50_000);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [friendName, setFriendName] = useState("");
  const [claiming, setClaiming] = useState(false);

  const company = companies.find((c) => c.id === id);

  if (!company) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Deal Not Found</h1>
        <p className="text-neutral-400 mb-6">
          The requested startup opportunity does not exist or has been removed.
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg bg-emerald-500 text-neutral-950 font-semibold text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Pre-calculate what ownership this investment will yield
  const postMoneyEst = company.metrics.valuation + investmentAmount;
  const equityYieldEst =
    Math.round((investmentAmount / postMoneyEst) * 1000) / 10;

  function handleClaimAndInvest() {
    if (!friendName.trim()) {
      setFeedback({ message: "Please enter your investor name to claim your starter capital.", isError: true });
      return;
    }
    setClaiming(true);
    // Claim referral package: receives $100K Founder + $100K Investor
    claimReferralInvite(refCode || "direct-invite", friendName.trim());
    setFeedback({
      message: `Welcome, ${friendName}! $100,000 Founder & $100,000 Investor Capital activated.`,
      isError: false,
    });
    setClaiming(false);
  }

  function handleInvest() {
    const res = investInCompany(company!.id, investmentAmount);
    if (res.success) {
      setFeedback({ message: res.message, isError: false });
      setTimeout(() => {
        router.push("/dashboard?view=investor");
      }, 1500);
    } else {
      setFeedback({ message: res.message, isError: true });
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-sm text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-neutral-400">Your Investor Capital:</span>
            <span className="font-mono font-bold text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded border border-indigo-800/40">
              ${player.investor_capital.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Deal Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 w-full flex-1">
        {/* Deal Header Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {company.sector}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {company.business_model}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                  {company.market}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {company.name}
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 mt-1">
                {company.tagline}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-neutral-400 block font-mono">Current Valuation</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${(company.metrics.valuation / 1_000_000).toFixed(2)}M
              </span>
              <span className="text-xs text-neutral-500 block">
                Founder: {company.founder_name}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-800">
            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block">Monthly Revenue</span>
              <span className="text-lg font-bold text-white font-mono">
                ${company.metrics.revenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                +{company.metrics.growth}% mo/mo
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block">Active Users</span>
              <span className="text-lg font-bold text-white font-mono">
                {company.metrics.users.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Traction: {company.metrics.traction_score}/100
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block">Monthly Burn</span>
              <span className="text-lg font-bold text-white font-mono">
                ${company.metrics.monthly_burn.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Cash: ${company.metrics.cash.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block">Runway</span>
              <span
                className={`text-lg font-bold font-mono ${
                  company.metrics.runway < 1
                    ? "text-red-400"
                    : company.metrics.runway < 3
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {company.metrics.runway} Months
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Stage: {company.metrics.stage}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Box / Claim Invitation Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                <Coins className="w-5 h-5 text-indigo-400" />
                <span>Invest in this Round</span>
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Invest virtual capital directly from your balance. The startup receives treasury cash, dilutes founder equity, and adds this company to your portfolio.
              </p>

              {/* Slider / Amount selector */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-neutral-300 font-medium">
                    Investment Amount
                  </label>
                  <span className="font-mono text-xl font-bold text-emerald-400">
                    ${investmentAmount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[10_000, 25_000, 50_000, 100_000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInvestmentAmount(amt)}
                      className={`py-2 text-xs font-mono font-medium rounded-lg border transition ${
                        investmentAmount === amt
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                      }`}
                    >
                      ${(amt / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Pre-Money Valuation</span>
                    <span>${(company.metrics.valuation / 1_000_000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Estimated Post-Money</span>
                    <span>${(postMoneyEst / 1_000_000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-800 text-emerald-300 font-bold">
                    <span>Target Equity Acquired</span>
                    <span>{equityYieldEst}%</span>
                  </div>
                </div>
              </div>

              {/* Investment Feedback */}
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs mb-4 flex items-center space-x-2 ${
                    feedback.isError
                      ? "bg-red-950/60 border border-red-800 text-red-300"
                      : "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                  }`}
                >
                  {feedback.isError ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleInvest}
                disabled={player.investor_capital < investmentAmount}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
              >
                {player.investor_capital >= investmentAmount
                  ? `CONFIRM $${investmentAmount.toLocaleString()} INVESTMENT`
                  : `INSUFFICIENT INVESTOR CAPITAL ($${player.investor_capital.toLocaleString()})`}
              </button>
            </div>
          </div>

          {/* Right Sidebar: New Player Package Claim */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-neutral-900 border border-indigo-900/50">
              <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <h4 className="font-bold text-white text-sm">New Player Package</h4>
              </div>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                Invited by a founder? Claim your starter package to join the ecosystem.
              </p>

              <div className="space-y-2 mb-4 text-xs font-mono">
                <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 flex justify-between">
                  <span className="text-emerald-400">Founder Capital</span>
                  <span className="font-bold">$100,000</span>
                </div>
                <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 flex justify-between">
                  <span className="text-indigo-400">Investor Capital</span>
                  <span className="font-bold">$100,000</span>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter your username..."
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleClaimAndInvest}
                  disabled={claiming}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  Activate Starter Package
                </button>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Simulated Security</span>
              </div>
              <p>
                All balances, cap table dilution, and transactions are validated server-side. Virtual currency has no real-world monetary value.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-neutral-950 border-t border-neutral-900 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">UNYQUEST</span>
            <span>•</span>
            <span>Build. Fund. Grow. Win.</span>
            <span>•</span>
            <span>Deal Discovery & Syndicate Engine</span>
          </div>

          <div className="flex items-center space-x-1.5 text-neutral-400 font-medium">
            <span>An</span>
            <a
              href="https://em300.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 transition"
            >
              EM300.co
            </a>
            <span>Company</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
