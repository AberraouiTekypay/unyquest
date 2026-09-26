"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Building2,
  Coins,
  Users,
  Award,
  AlertTriangle,
  ArrowRight,
  Plus,
  Share2,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/lib/game-store";
import {
  BusinessModel,
  CompanyActionType,
  ExitType,
  FounderStrength,
  InvestorArchetype,
  MarketRegion,
  Sector,
} from "@/engine/types";
import { GAME_CONFIG } from "@/engine/config";
import { NPC_INVESTORS } from "@/engine/archetypes";
import { UnyCoachBanner } from "@/components/UnyCoachBanner";
import { WhyModal } from "@/components/WhyModal";
import { VentureLibraryModal } from "@/components/VentureLibraryModal";
import { VentureJourneyHUD } from "@/components/VentureJourneyHUD";
import { QuestsTab } from "@/components/QuestsTab";
import { MiniChallengeModal } from "@/components/MiniChallengeModal";

export default function DashboardPage() {
  const {
    player,
    allPlayers,
    companies,
    activeCompany,
    capTables,
    investments,
    syndicates,
    pendingTermSheets,
    juryReviews,
    transactions,
    marketCondition,
    unlockTier,
    triggerWhy,
    openLibrary,
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
  } = useGame();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "founder" | "pitch" | "friends" | "investor" | "syndicates" | "jury" | "leaderboard" | "quests" | "admin"
  >("founder");

  // Local UI state
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Modals
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [showCreateSyndicateModal, setShowCreateSyndicateModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(25_000);

  // Company creation form
  const [newCompName, setNewCompName] = useState("");
  const [newCompTagline, setNewCompTagline] = useState("");
  const [newCompSector, setNewCompSector] = useState<Sector>("AI");
  const [newCompMarket, setNewCompMarket] = useState<MarketRegion>("Global");
  const [newCompModel, setNewCompModel] = useState<BusinessModel>("SaaS");
  const [newCompStrengths, setNewCompStrengths] = useState<FounderStrength[]>([
    "Technical",
    "Product",
  ]);

  // Pitch state
  const [pitchTarget, setPitchTarget] = useState<InvestorArchetype>("GENERALIST");
  const [pitchAsk, setPitchAsk] = useState<number>(250_000);
  const [pitchValuation, setPitchValuation] = useState<number>(2_000_000);
  const [lastPitchOutcome, setLastPitchOutcome] = useState<any>(null);

  // Counter offer state
  const [counterPreMoney, setCounterPreMoney] = useState<number>(2_500_000);
  const [counterEquity, setCounterEquity] = useState<number>(10);

  // Syndicate creation form
  const [synName, setSynName] = useState("");
  const [synThesis, setSynThesis] = useState("");
  const [synTarget, setSynTarget] = useState<number>(250_000);
  const [synCommitment, setSynCommitment] = useState<number>(25_000); // 10% minimum

  // Jury evaluation state
  const [juryTargetCompanyId, setJuryTargetCompanyId] = useState<string>("");
  const [juryScores, setJuryScores] = useState({
    market: 7,
    team: 8,
    traction: 6,
    business: 7,
    valuation: 7,
  });
  const [juryNotes, setJuryNotes] = useState("");

  // Helper alert banner
  function showBanner(message: string, isError = false) {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 5000);
  }

  // Handle action spending
  function handleActionClick(actionType: CompanyActionType) {
    if (!activeCompany) return;
    const res = executeAction(activeCompany.id, actionType);
    showBanner(res.message, !res.success);
    if (res.success) {
      // Trigger small sparkle animation
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }
  }

  // Handle month advance
  function handleAdvanceMonth() {
    if (!activeCompany) return;
    advanceCompanyMonth(activeCompany.id);
    showBanner(`Simulated 1 month forward for ${activeCompany.name}. Revenue & burn applied.`);
  }

  // Handle Pitch Submit
  function handlePitchSubmit() {
    if (!activeCompany) return;
    const outcome = submitPitchToNPC({
      company: activeCompany,
      problem: `High inefficiency in ${activeCompany.sector} space for ${activeCompany.market} corridor.`,
      solution: activeCompany.tagline,
      ask: pitchAsk,
      valuation: pitchValuation,
      use_of_funds: {
        product: pitchAsk * 0.4,
        marketing: pitchAsk * 0.3,
        hiring: pitchAsk * 0.15,
        sales: pitchAsk * 0.1,
        reserve: pitchAsk * 0.05,
      },
      target_archetype: pitchTarget,
    });

    setLastPitchOutcome(outcome);
    if (outcome.decision === "TERM_SHEET") {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      showBanner(`Term Sheet Received! Offered $${outcome.term_sheet?.investment_amount.toLocaleString()}`);
    } else if (outcome.decision === "INTERESTED") {
      showBanner(outcome.feedback_reason, false);
    } else {
      showBanner(outcome.feedback_reason, true);
    }
  }

  // Handle Accept Term Sheet
  function handleAcceptTermSheet(id: string) {
    const res = acceptTermSheet(id);
    showBanner(res.message, !res.success);
    if (res.success) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  }

  // Handle Create Company
  function handleCreateCompanySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newCompName.trim()) {
      showBanner("Please enter a company name.", true);
      return;
    }
    const created = createNewCompany({
      name: newCompName.trim(),
      tagline: newCompTagline.trim() || "Next-gen venture platform",
      sector: newCompSector,
      market: newCompMarket,
      business_model: newCompModel,
      founder_strengths: newCompStrengths,
    });
    setShowCreateCompanyModal(false);
    confetti({ particleCount: 80, spread: 70 });
    showBanner(`Company "${created.name}" established with $100K initial treasury!`);
  }

  // Handle Simulate Friend Loop
  function handleSimulateFriendLoop() {
    if (!activeCompany) return;
    const friendNames = ["Sarah Chen", "David O'Connor", "Zainab Malik", "Alex Rivera"];
    const randomFriend = friendNames[Math.floor(Math.random() * friendNames.length)];
    const friend = claimReferralInvite(player.id, randomFriend);

    // Friend invests $50,000 from their $100,000 investor capital directly into this company!
    const investRes = investInCompany(activeCompany.id, 50_000);

    confetti({ particleCount: 120, spread: 90 });
    showBanner(
      `Viral Loop Completed! Friend "${friend.username}" joined via referral, received $100K capital, and invested $50,000 into ${activeCompany.name}!`
    );
  }

  // Handle Exit
  function handleTriggerExit(exitType: ExitType) {
    if (!activeCompany) return;
    const details = executeExit(activeCompany.id, exitType);
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 } });
    showBanner(
      `Exit finalized (${exitType})! Company valued at $${details.exit_valuation.toLocaleString()}. Founder proceeds: $${details.founder_proceeds.toLocaleString()} reinvested into Investor Capital.`
    );
  }

  // Current company cap table
  const activeCapTable = activeCompany ? capTables[activeCompany.id] || [] : [];

  // Compute portfolio stats
  const totalPortfolioInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const totalPortfolioValue = investments.reduce(
    (sum, inv) => sum + (inv.is_exited ? (inv.exit_proceeds ?? 0) : inv.virtual_return),
    0
  );
  const portfolioMOIC =
    totalPortfolioInvested > 0
      ? (totalPortfolioValue / totalPortfolioInvested).toFixed(2)
      : "1.00";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Global Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-neutral-950 text-base shadow-md shadow-emerald-500/20">
                U
              </div>
              <span className="font-bold tracking-tight text-white hidden sm:inline">
                UNYQUEST
              </span>
            </Link>

            {/* Persona Switcher for Quick Multiplayer Testing */}
            <div className="flex items-center space-x-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-xs">
              <span className="text-neutral-500">Player:</span>
              <select
                value={player.id}
                onChange={(e) => switchPlayer(e.target.value)}
                className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                    {p.username} {p.id === player.id ? "(You)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capital Balances HUD */}
          <div className="flex items-center space-x-4">
            {/* Founder Capital */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400">
                Founder Capital
              </span>
              <span className="font-mono font-bold text-sm text-white">
                ${player.founder_capital.toLocaleString()}
              </span>
            </div>

            {/* Investor Capital */}
            <div className="flex flex-col text-right pl-3 sm:border-l border-neutral-800">
              <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-400">
                Investor Capital
              </span>
              <span className="font-mono font-bold text-sm text-white">
                ${player.investor_capital.toLocaleString()}
              </span>
            </div>

            {/* Persistent LEARN Button for Venture Academy */}
            <button
              type="button"
              onClick={() => openLibrary()}
              title="Open Venture Academy Knowledge Base"
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <span>📚</span>
              <span>LEARN</span>
            </button>

            {/* Advance Market Cycle */}
            <button
              type="button"
              onClick={advanceMarketCycleState}
              title="Click to cycle market state (BOOM -> NORMAL -> TIGHT -> CRISIS)"
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono border border-neutral-700 text-neutral-300 flex items-center space-x-1 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{marketCondition}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary HUD: Reputations & Main Tab Navigation */}
      <div className="bg-neutral-900/30 border-b border-neutral-800 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
          {/* Reputation Badges */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-400">Founder Rep:</span>
              <span className="font-bold text-white">
                {player.reputation.founder_reputation} (Lv.{player.reputation.founder_level})
              </span>
            </div>

            <div className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-neutral-400">Investor Rep:</span>
              <span className="font-bold text-white">
                {player.reputation.investor_reputation} (Lv.{player.reputation.investor_level})
              </span>
            </div>

            <div className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-neutral-400">Jury:</span>
              <span className="font-bold text-amber-300">
                {player.reputation.jury_level}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("founder")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === "founder"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              🏢 Founder HQ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quests")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "quests"
                  ? "bg-amber-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span>🎯</span>
              <span>Quests & Skills</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pitch")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "pitch"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span>🎤 Pitch Arena</span>
              {unlockTier < 2 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-amber-400 border border-amber-500/30">
                  T2
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("friends")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "friends"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span>🚀 Raise from Friends</span>
              {unlockTier < 3 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-amber-400 border border-amber-500/30">
                  T3
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("investor")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "investor"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span>💼 Investor Portfolio</span>
              {unlockTier < 4 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-amber-400 border border-amber-500/30">
                  T4
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("syndicates")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "syndicates"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span>🤝 Syndicates</span>
              {unlockTier < 5 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-amber-400 border border-amber-500/30">
                  T5
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("jury")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "jury"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span>⚖️ Jury Room</span>
              {unlockTier < 4 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-amber-400 border border-amber-500/30">
                  T4
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("leaderboard")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === "leaderboard"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              🏆 Leaderboards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === "admin"
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              ⚙️ Admin
            </button>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`px-4 py-2.5 text-xs text-center font-medium transition flex items-center justify-center space-x-2 ${
            feedback.isError
              ? "bg-red-950 border-b border-red-800 text-red-200"
              : "bg-emerald-950 border-b border-emerald-800 text-emerald-200"
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Venture Journey Progression HUD */}
        <VentureJourneyHUD onOpenQuests={() => setActiveTab("quests")} />

        {/* ========================================================================= */}
        {/* TAB: QUESTS & VENTURE SKILL TREE                                          */}
        {/* ========================================================================= */}
        {activeTab === "quests" && <QuestsTab />}

        {/* ========================================================================= */}
        {/* TAB 1: FOUNDER HQ                                                         */}
        {/* ========================================================================= */}
        {activeTab === "founder" && (
          <div className="space-y-8">
            {!activeCompany ? (
              /* No Active Company: Show Creation Prompt */
              <div className="text-center py-16 px-4 rounded-3xl bg-neutral-900/30 border border-neutral-800 max-w-2xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Active Startup</h2>
                <p className="text-sm text-neutral-400 mb-6">
                  You have not created a company yet. Receive $100,000 initial founder treasury and start your venture.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateCompanyModal(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>START YOUR COMPANY</span>
                </button>
              </div>
            ) : (
              /* Active Company Cockpit */
              <div className="space-y-6">
                {/* Distress Banner if Cash = 0 */}
                {activeCompany.metrics.is_distressed && (
                  <div className="p-4 rounded-xl bg-red-950/80 border-2 border-red-600 text-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-sm uppercase tracking-wide">
                          CRITICAL: DISTRESS MODE ACTIVATED
                        </h4>
                        <p className="text-xs text-red-200">
                          Cash has reached $0. The company faces insolvency unless you raise emergency financing or cut operations!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab("friends")}
                        className="px-3 py-1.5 rounded-lg bg-white text-neutral-950 font-bold text-xs"
                      >
                        Invite Investor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerExit("FAILURE")}
                        className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-semibold text-xs"
                      >
                        Orderly Shutdown
                      </button>
                    </div>
                  </div>
                )}

                {/* Company Header Card with Runway Gauge */}
                <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {activeCompany.sector}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-neutral-300">
                        {activeCompany.business_model}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-neutral-400">
                        {activeCompany.market}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                        {activeCompany.metrics.stage}
                      </span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                      {activeCompany.name}
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1 max-w-xl">
                      {activeCompany.tagline}
                    </p>
                  </div>

                  {/* RUNWAY GAUGE (Prominently displayed) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                          RUNWAY HEALTH
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerWhy("runway")}
                          className="text-[10px] text-amber-400 font-bold hover:underline"
                        >
                          WHY?
                        </button>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span
                          className={`text-3xl font-black font-mono tracking-tight ${
                            activeCompany.metrics.runway < 1
                              ? "text-red-400"
                              : activeCompany.metrics.runway < 3
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          RUNWAY: {activeCompany.metrics.runway} MO
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-500">
                          Monthly Burn: ${activeCompany.metrics.monthly_burn.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerWhy("burn_rate")}
                          className="text-[9px] text-amber-400 hover:underline"
                        >
                          (Why?)
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdvanceMonth}
                      className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white border border-neutral-700 flex items-center space-x-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Next Month ⏭️</span>
                    </button>
                  </div>
                </div>

                {/* Company Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                    <span className="text-[11px] text-neutral-400 block">Treasury Cash</span>
                    <span className="text-xl font-bold font-mono text-white">
                      ${activeCompany.metrics.cash.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Liquid balance</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400 block">Monthly Revenue</span>
                      <button
                        type="button"
                        onClick={() => triggerWhy("cac_ltv")}
                        className="text-[9px] text-amber-400 hover:underline"
                      >
                        WHY?
                      </button>
                    </div>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      ${activeCompany.metrics.revenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 block mt-0.5">
                      +{activeCompany.metrics.growth}% mo/mo
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                    <span className="text-[11px] text-neutral-400 block">Active Users</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {activeCompany.metrics.users.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Customers</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400 block">Valuation</span>
                      <button
                        type="button"
                        onClick={() => triggerWhy("valuation")}
                        className="text-[9px] text-amber-400 hover:underline"
                      >
                        WHY?
                      </button>
                    </div>
                    <span className="text-xl font-bold font-mono text-white">
                      ${(activeCompany.metrics.valuation / 1_000_000).toFixed(2)}M
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Implied post</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400 block">Founder Equity</span>
                      <button
                        type="button"
                        onClick={() => triggerWhy("dilution")}
                        className="text-[9px] text-amber-400 hover:underline"
                      >
                        WHY?
                      </button>
                    </div>
                    <span className="text-xl font-bold font-mono text-white">
                      {activeCompany.metrics.founder_ownership}%
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Your stake</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                    <span className="text-[11px] text-neutral-400 block">Capital Raised</span>
                    <span className="text-xl font-bold font-mono text-indigo-400">
                      ${activeCompany.total_raised.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Cumulative</span>
                  </div>
                </div>

                {/* Performance Radar Scores */}
                <div className="p-5 rounded-xl bg-neutral-900/30 border border-neutral-800">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
                    COMPANY CHARACTERISTICS & DEFENSIVE MOATS
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Product</span>
                        <span className="font-mono text-white">{activeCompany.metrics.product_score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${activeCompany.metrics.product_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Team</span>
                        <span className="font-mono text-white">{activeCompany.metrics.team_score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${activeCompany.metrics.team_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Traction</span>
                        <span className="font-mono text-white">{activeCompany.metrics.traction_score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${activeCompany.metrics.traction_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Distribution</span>
                        <span className="font-mono text-white">{activeCompany.metrics.distribution_score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${activeCompany.metrics.distribution_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Moat Defensibility</span>
                        <span className="font-mono text-white">{activeCompany.metrics.defensibility_score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${activeCompany.metrics.defensibility_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Actions Deck with Non-Linear Trade-offs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Strategic Operating Actions</h3>
                      <p className="text-xs text-neutral-400">
                        Every action has trade-offs. Spend cash strategically to build traction before pitching.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {GAME_CONFIG.ACTIONS.map((action) => (
                      <div
                        key={action.type}
                        className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white text-sm">{action.label}</h4>
                            <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                              ${action.baseCost.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mb-3">{action.description}</p>
                          <div className="p-2 rounded bg-neutral-950 text-[11px] text-neutral-300 font-mono border border-neutral-800/80 mb-4">
                            {action.tradeoffSummary}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleActionClick(action.type)}
                          disabled={activeCompany.metrics.cash < action.baseCost}
                          className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 disabled:bg-neutral-900 disabled:text-neutral-600 text-xs font-semibold text-white transition"
                        >
                          {activeCompany.metrics.cash >= action.baseCost
                            ? "Execute Action"
                            : "Insufficient Cash"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cap Table and Exit Options */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  {/* Cap Table */}
                  <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                    <h3 className="text-base font-bold text-white mb-3">Capitalization Table</h3>
                    <div className="space-y-2">
                      {activeCapTable.map((entry, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <span className="text-white font-medium">{entry.investor_name}</span>
                            {entry.is_founder && (
                              <span className="ml-2 text-[10px] text-emerald-400">Founder</span>
                            )}
                            {entry.is_syndicate && (
                              <span className="ml-2 text-[10px] text-indigo-400">Syndicate</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-white">{entry.equity_percentage}%</span>
                            <span className="text-[10px] text-neutral-500 block">
                              ${entry.invested_amount.toLocaleString()} invested
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exit Execution Portal */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-900/60 to-neutral-950 border border-neutral-800">
                    <h3 className="text-base font-bold text-white mb-2">Exit & Liquidity Portal</h3>
                    <p className="text-xs text-neutral-400 mb-4">
                      When your metrics qualify, trigger an exit to realize returns. Proceeds are reinvested into your Investor Capital to back new founders!
                    </p>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleTriggerExit("ACQUISITION")}
                        className="w-full p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white text-xs block">Strategic Acquisition</span>
                          <span className="text-[11px] text-neutral-400">
                            1.2x - 1.8x multiple based on product & defensibility scores
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerExit("IPO")}
                        className="w-full p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white text-xs block">Initial Public Offering (IPO)</span>
                          <span className="text-[11px] text-neutral-400">
                            2.5x multiple on high growth public tech market
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerExit("FOUNDER_BUYOUT")}
                        className="w-full p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white text-xs block">Founder Recapitalization</span>
                          <span className="text-[11px] text-neutral-400">
                            Consolidate 100% equity through friendly buyout
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PITCH ARENA                                                        */}
        {/* ========================================================================= */}
        {activeTab === "pitch" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {!activeCompany ? (
              <div className="text-center py-12">
                <p className="text-neutral-400">Please create a company first in Founder HQ.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Pitch Arena</h2>
                      <p className="text-xs text-neutral-400">
                        Pitch NPC institutional venture investors. Every pitch costs virtual company capital.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
                      <span className="text-[10px] text-neutral-400 block font-mono">PITCH FEE</span>
                      <span className="text-lg font-bold font-mono text-amber-400">
                        ${GAME_CONFIG.PITCH_FEES[activeCompany.metrics.stage].toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Investor Selection */}
                  <div className="mb-6">
                    <label className="text-xs font-semibold text-neutral-300 block mb-2">
                      Select Target Venture Capitalist
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {NPC_INVESTORS.map((npc) => (
                        <div
                          key={npc.id}
                          onClick={() => setPitchTarget(npc.archetype)}
                          className={`p-4 rounded-xl border cursor-pointer transition ${
                            pitchTarget === npc.archetype
                              ? "bg-emerald-500/10 border-emerald-500 text-white"
                              : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          <div className="text-2xl mb-2">{npc.avatar}</div>
                          <h4 className="font-bold text-sm text-white">{npc.name}</h4>
                          <span className="text-[10px] text-emerald-400 font-mono block mb-1">
                            {npc.firm} ({npc.archetype})
                          </span>
                          <p className="text-[11px] text-neutral-400 line-clamp-3">
                            {npc.bio}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pitch Terms: Ask & Valuation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <label className="text-neutral-300">Capital Ask ($)</label>
                        <span className="font-mono font-bold text-emerald-400">
                          ${pitchAsk.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100000"
                        max="2000000"
                        step="25000"
                        value={pitchAsk}
                        onChange={(e) => setPitchAsk(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <label className="text-neutral-300">Valuation Expectation ($)</label>
                        <span className="font-mono font-bold text-emerald-400">
                          ${pitchValuation.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="500000"
                        max="10000000"
                        step="100000"
                        value={pitchValuation}
                        onChange={(e) => setPitchValuation(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-neutral-500 block mt-1">
                        Company intrinsic valuation: ${(activeCompany.metrics.valuation / 1_000_000).toFixed(2)}M
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePitchSubmit}
                    disabled={activeCompany.metrics.cash < GAME_CONFIG.PITCH_FEES[activeCompany.metrics.stage]}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
                  >
                    DELIVER PITCH (SPEND ${GAME_CONFIG.PITCH_FEES[activeCompany.metrics.stage].toLocaleString()})
                  </button>
                </div>

                {/* Pitch Outcome Box */}
                {lastPitchOutcome && (
                  <div
                    className={`p-6 rounded-2xl border ${
                      lastPitchOutcome.decision === "TERM_SHEET"
                        ? "bg-emerald-950/40 border-emerald-500"
                        : lastPitchOutcome.decision === "INTERESTED"
                        ? "bg-amber-950/40 border-amber-600"
                        : "bg-red-950/40 border-red-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">
                        DECISION: {lastPitchOutcome.decision}
                      </span>
                      <span className="text-xs font-mono">
                        Composite Score: {lastPitchOutcome.score}/100
                      </span>
                    </div>
                    <p className="text-sm text-neutral-200 mb-4 italic">
                      &quot;{lastPitchOutcome.feedbackReason}&quot;
                    </p>

                    {/* Term sheet preview if generated */}
                    {lastPitchOutcome.term_sheet && (
                      <div className="p-4 rounded-xl bg-neutral-950/90 border border-emerald-500/50 space-y-3">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                          <span className="font-bold text-sm text-emerald-400">
                            OFFICIAL TERM SHEET
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {lastPitchOutcome.term_sheet.investor_name}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-neutral-500 block">Investment</span>
                            <span className="font-bold text-white">
                              ${lastPitchOutcome.term_sheet.investment_amount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Pre-Money</span>
                            <span className="font-bold text-white">
                              ${(lastPitchOutcome.term_sheet.pre_money_valuation / 1_000_000).toFixed(2)}M
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Post-Money</span>
                            <span className="font-bold text-white">
                              ${(lastPitchOutcome.term_sheet.post_money_valuation / 1_000_000).toFixed(2)}M
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Equity Stake</span>
                            <span className="font-bold text-emerald-400">
                              {lastPitchOutcome.term_sheet.ownership_percentage}%
                            </span>
                          </div>
                        </div>

                        {lastPitchOutcome.term_sheet.special_condition && (
                          <div className="text-[11px] text-amber-300 font-mono">
                            Condition: {lastPitchOutcome.term_sheet.special_condition}
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptTermSheet(lastPitchOutcome.term_sheet.id)}
                            className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
                          >
                            ACCEPT TERM SHEET
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const ts = lastPitchOutcome.term_sheet;
                              setCounterPreMoney(Math.round(ts.pre_money_valuation * 1.1));
                              setCounterEquity(Math.max(5, Math.round(ts.ownership_percentage * 0.9)));
                              setShowCounterModal(true);
                            }}
                            className="px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                          >
                            COUNTER
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectTermSheet(lastPitchOutcome.term_sheet.id)}
                            className="px-3 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition"
                          >
                            REJECT
                          </button>
                        </div>

                        {showCounterModal && (
                          <div className="p-3 mt-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                            <span className="font-semibold text-white block">Negotiate Counter-Offer</span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-400">Counter Pre-Money ($)</label>
                                <input
                                  type="number"
                                  value={counterPreMoney}
                                  onChange={(e) => setCounterPreMoney(Number(e.target.value))}
                                  className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-400">Offered Equity (%)</label>
                                <input
                                  type="number"
                                  value={counterEquity}
                                  onChange={(e) => setCounterEquity(Number(e.target.value))}
                                  className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-white font-mono"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const res = counterTermSheet(
                                    lastPitchOutcome.term_sheet.id,
                                    counterPreMoney,
                                    counterEquity
                                  );
                                  setShowCounterModal(false);
                                  showBanner(res.message, !res.success);
                                  if (res.success) {
                                    confetti({ particleCount: 70, spread: 60 });
                                  }
                                }}
                                className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                              >
                                Submit Counter
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowCounterModal(false)}
                                className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-400 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RAISE FROM FRIENDS (VIRAL LOOP)                                    */}
        {/* ========================================================================= */}
        {activeTab === "friends" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {!activeCompany ? (
              <div className="text-center py-12">
                <p className="text-neutral-400">Please create a company first.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-neutral-900 to-neutral-950 border border-indigo-900/50">
                  <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase">
                      THE DEFINING SOCIAL LOOP
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">
                    Raise Capital from Friends
                  </h2>
                  <p className="text-sm text-neutral-300 max-w-xl mb-6">
                    When your company needs capital, invite other players. When they join, they receive $100K Founder + $100K Investor capital and can immediately back your startup!
                  </p>

                  {/* Target Raise Progress */}
                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-neutral-400">Round Target: $250,000</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        ${activeCompany.metrics.cash >= 250_000 ? "250,000" : activeCompany.metrics.cash.toLocaleString()} Committed
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((activeCompany.metrics.cash / 250_000) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      You are raising $250K. Share your deal page with investors.
                    </span>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="space-y-3 mb-6">
                    <label className="text-xs font-semibold text-neutral-300">
                      Your Unique Deal Room Link
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://venturegame.io/deal/${activeCompany.id}?ref=${player.id}`}
                        className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `https://venturegame.io/deal/${activeCompany.id}?ref=${player.id}`
                          );
                          showBanner("Link copied to clipboard!");
                        }}
                        className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  {/* One-Click Multiplayer Simulator */}
                  <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <h4 className="font-bold text-sm text-white mb-1">
                      Test Multiplayer Loop (Simulation)
                    </h4>
                    <p className="text-xs text-neutral-400 mb-4">
                      Simulates a friend clicking your invite, receiving $100K starter capital, and investing $50K into {activeCompany.name}.
                    </p>
                    <button
                      type="button"
                      onClick={handleSimulateFriendLoop}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
                    >
                      Simulate Friend Joining & Investing $50,000
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INVESTOR PORTFOLIO & DEAL DISCOVERY                                */}
        {/* ========================================================================= */}
        {activeTab === "investor" && (
          <div className="space-y-8">
            {/* Investor Top Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-xs text-neutral-400 block">Available Capital</span>
                <span className="text-2xl font-black font-mono text-indigo-400">
                  ${player.investor_capital.toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-1">Ready to deploy</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-xs text-neutral-400 block">Total Invested</span>
                <span className="text-2xl font-black font-mono text-white">
                  ${totalPortfolioInvested.toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-1">Across all deals</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-xs text-neutral-400 block">Portfolio Value</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${totalPortfolioValue.toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-1">Unrealized position</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-xs text-neutral-400 block">Virtual MOIC</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {portfolioMOIC}×
                </span>
                <span className="text-[10px] text-neutral-500 block mt-1">Multiple on invested</span>
              </div>
            </div>

            {/* Active Portfolio Positions */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Portfolio Holdings</h3>
              {investments.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/20 border border-neutral-800 text-center">
                  <p className="text-sm text-neutral-400">
                    You have no active investments yet. Discover startups below and deploy your $100K Investor Capital.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investments.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-base">{inv.company_name}</h4>
                          <span className="text-xs text-emerald-400 font-mono">
                            {inv.equity_percentage}% Equity
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {inv.moic}× MOIC
                        </span>
                      </div>

                      <div className="border-t border-neutral-800 pt-3 text-xs font-mono space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>Amount Invested</span>
                          <span>${inv.amount_invested.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Entry Valuation</span>
                          <span>${(inv.entry_valuation / 1_000_000).toFixed(2)}M</span>
                        </div>
                        <div className="flex justify-between text-white font-semibold">
                          <span>Position Value</span>
                          <span className="text-emerald-400">${inv.virtual_return.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deal Discovery (20+ Seed Startups) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Discover & Invest in Startups</h3>
                  <p className="text-xs text-neutral-400">
                    Browse active deals across AI, Fintech, Climate, Healthcare, and Logistics.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {comp.sector}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {comp.metrics.stage}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-base mb-1">{comp.name}</h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-4">
                        {comp.tagline}
                      </p>
                    </div>

                    <div className="border-t border-neutral-800 pt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Valuation</span>
                        <span className="font-mono text-white">
                          ${(comp.metrics.valuation / 1_000_000).toFixed(2)}M
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mb-3">
                        <span className="text-neutral-400">Monthly Revenue</span>
                        <span className="font-mono text-emerald-400">
                          ${comp.metrics.revenue.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowInvestModal(comp.id);
                            setInvestAmount(25_000);
                          }}
                          className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition"
                        >
                          Invest Capital
                        </button>
                        <Link
                          href={`/deal/${comp.id}`}
                          className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SYNDICATES                                                         */}
        {/* ========================================================================= */}
        {activeTab === "syndicates" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Investment Syndicates</h2>
                <p className="text-xs text-neutral-400">
                  Pool capital to write larger checks. Leaders must commit a minimum of 10% skin-in-the-game.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateSyndicateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE SYNDICATE</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {syndicates.map((syn) => (
                <div
                  key={syn.id}
                  className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-lg">{syn.name}</h3>
                      <span className="text-xs text-indigo-400 font-mono block">
                        Lead: {syn.leader_name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        syn.is_open
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {syn.is_open ? "OPEN FOR CAPITAL" : "DEPLOYED"}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 italic">{syn.thesis}</p>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Target Raise</span>
                      <span>${syn.target_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Committed Capital</span>
                      <span className="text-emerald-400 font-bold">
                        ${syn.committed_amount.toLocaleString()} (
                        {Math.round((syn.committed_amount / syn.target_amount) * 100)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Lead Skin-in-the-game</span>
                      <span>${syn.leader_commitment.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions for Syndicate */}
                  <div className="flex items-center space-x-2 pt-2">
                    {syn.is_open && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = pledgeToSyndicate(syn.id, 25_000);
                          showBanner(res.message, !res.success);
                        }}
                        className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                      >
                        Pledge $25,000 Capital
                      </button>
                    )}

                    {syn.leader_id === player.id && activeCompany && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = deploySyndicateToCompany(syn.id, activeCompany.id);
                          showBanner(res.message, !res.success);
                        }}
                        className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
                      >
                        Deploy to {activeCompany.name}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: JURY ROOM                                                          */}
        {/* ========================================================================= */}
        {activeTab === "jury" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Jury Evaluation Booth</h2>
                  <p className="text-xs text-neutral-400">
                    Evaluate startup pitches. Increase your Jury Reputation and progress toward Investment Committee.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 font-mono block">YOUR STATUS</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {player.reputation.jury_level}
                  </span>
                </div>
              </div>

              {/* Startup selector */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  Select Startup to Evaluate
                </label>
                <select
                  value={juryTargetCompanyId || companies[0]?.id}
                  onChange={(e) => setJuryTargetCompanyId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sector} • Valuation: ${(c.metrics.valuation / 1_000_000).toFixed(1)}M)
                    </option>
                  ))}
                </select>
              </div>

              {/* Scoring Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Market Size (TAM)</span>
                    <span className="font-mono text-emerald-400 font-bold">{juryScores.market}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={juryScores.market}
                    onChange={(e) =>
                      setJuryScores((prev) => ({ ...prev, market: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Founder & Team Execution</span>
                    <span className="font-mono text-emerald-400 font-bold">{juryScores.team}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={juryScores.team}
                    onChange={(e) =>
                      setJuryScores((prev) => ({ ...prev, team: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Traction & Moat</span>
                    <span className="font-mono text-emerald-400 font-bold">{juryScores.traction}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={juryScores.traction}
                    onChange={(e) =>
                      setJuryScores((prev) => ({ ...prev, traction: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Valuation Fairness</span>
                    <span className="font-mono text-emerald-400 font-bold">{juryScores.valuation}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={juryScores.valuation}
                    onChange={(e) =>
                      setJuryScores((prev) => ({ ...prev, valuation: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Jury Deliberation Notes
                </label>
                <textarea
                  rows={2}
                  value={juryNotes}
                  onChange={(e) => setJuryNotes(e.target.value)}
                  placeholder="Strong product-market fit, sensible unit economics..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                />
              </div>

              {/* Recommendation actions */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = juryTargetCompanyId || companies[0]?.id;
                    submitJuryEvaluation(target, juryScores, "RECOMMEND_INVESTMENT", juryNotes);
                    showBanner("Evaluation submitted: Recommended Investment! Jury reputation gained.");
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
                >
                  RECOMMEND INVESTMENT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = juryTargetCompanyId || companies[0]?.id;
                    submitJuryEvaluation(target, juryScores, "PASS", juryNotes);
                    showBanner("Evaluation submitted: Passed.");
                  }}
                  className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition"
                >
                  PASS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: LEADERBOARDS                                                       */}
        {/* ========================================================================= */}
        {activeTab === "leaderboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Multiplayer Leaderboards</h2>
              <p className="text-xs text-neutral-400">
                Rankings based on merit, exits, and portfolio construction rather than pure pay-to-win wealth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Founder Rankings */}
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Top Founders</span>
                </h3>
                <div className="space-y-3">
                  {companies.slice(0, 5).map((comp, idx) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-neutral-500 font-bold">#{idx + 1}</span>
                        <div>
                          <span className="font-bold text-white block">{comp.name}</span>
                          <span className="text-[10px] text-neutral-400">{comp.founder_name}</span>
                        </div>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">
                        ${(comp.metrics.valuation / 1_000_000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investor Rankings */}
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-indigo-400" />
                  <span>Top Investors</span>
                </h3>
                <div className="space-y-3">
                  {allPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-neutral-500 font-bold">#{idx + 1}</span>
                        <span className="font-bold text-white">{p.username}</span>
                      </div>
                      <span className="font-mono text-indigo-400 font-bold">
                        {p.reputation.investor_reputation} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jury Rankings */}
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Top Jury Members</span>
                </h3>
                <div className="space-y-3">
                  {allPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-neutral-500 font-bold">#{idx + 1}</span>
                        <div>
                          <span className="font-bold text-white block">{p.username}</span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {p.reputation.jury_level}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">
                        {p.reputation.jury_reputation} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: ADMIN & ECONOMY TUNING                                             */}
        {/* ========================================================================= */}
        {activeTab === "admin" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Economy Balancing Console</h2>
                <p className="text-xs text-neutral-400">
                  Inspect engine weights, market states, fee tiers, and reset game state.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Current Market Condition</span>
                  <span className="text-emerald-400 font-bold">{marketCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Valuation Multiplier</span>
                  <span>
                    {GAME_CONFIG.MARKET_CONDITIONS[marketCondition].valuationMultiplier}×
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Investor Appetite</span>
                  <span>
                    {GAME_CONFIG.MARKET_CONDITIONS[marketCondition].investorAppetite}×
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Growth Multiplier</span>
                  <span>
                    {GAME_CONFIG.MARKET_CONDITIONS[marketCondition].growthMultiplier}×
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">Reset Game State</span>
                  <span className="text-[11px] text-neutral-400">
                    Restores pristine initial starter balances and seed companies.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Reset game state to pristine defaults?")) {
                      resetGameToDefault();
                      showBanner("Game state restored to defaults.");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset State</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CREATE COMPANY                                                     */}
      {/* ========================================================================= */}
      {showCreateCompanyModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Create Your Startup</h3>
              <button
                type="button"
                onClick={() => setShowCreateCompanyModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateCompanySubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Flow AI"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous logistics and corridor dispatch"
                  value={newCompTagline}
                  onChange={(e) => setNewCompTagline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">Sector</label>
                  <select
                    value={newCompSector}
                    onChange={(e) => setNewCompSector(e.target.value as Sector)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  >
                    {[
                      "AI",
                      "Fintech",
                      "Logistics",
                      "Healthcare",
                      "Education",
                      "Climate",
                      "Food",
                      "PropTech",
                      "Consumer",
                      "SaaS",
                      "Marketplace",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">Market</label>
                  <select
                    value={newCompMarket}
                    onChange={(e) => setNewCompMarket(e.target.value as MarketRegion)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  >
                    {["Global", "Americas", "Europe", "Asia", "Middle East", "Africa"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Business Model</label>
                <select
                  value={newCompModel}
                  onChange={(e) => setNewCompModel(e.target.value as BusinessModel)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                >
                  {[
                    "SaaS",
                    "Marketplace",
                    "Transaction",
                    "Subscription",
                    "Consumer",
                    "Enterprise",
                    "Infrastructure",
                  ].map((bm) => (
                    <option key={bm} value={bm}>
                      {bm}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition mt-2"
              >
                CONFIRM & RECEIVE $100K TREASURY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIRECT INVEST                                                      */}
      {/* ========================================================================= */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Invest Capital</h3>
              <button
                type="button"
                onClick={() => setShowInvestModal(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Available Investor Capital:</span>
                <span className="font-mono font-bold text-indigo-400">
                  ${player.investor_capital.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">
                  Investment Check Size
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10_000, 25_000, 50_000, 100_000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInvestAmount(amt)}
                      className={`py-2 text-xs font-mono font-medium rounded-lg border transition ${
                        investAmount === amt
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300"
                      }`}
                    >
                      ${(amt / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const res = investInCompany(showInvestModal, investAmount);
                  setShowInvestModal(null);
                  showBanner(res.message, !res.success);
                  if (res.success) {
                    confetti({ particleCount: 80, spread: 70 });
                  }
                }}
                disabled={player.investor_capital < investAmount}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold text-xs shadow-md transition"
              >
                CONFIRM ${investAmount.toLocaleString()} INVESTMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE SYNDICATE                                                   */}
      {/* ========================================================================= */}
      {showCreateSyndicateModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Create Syndicate</h3>
              <button
                type="button"
                onClick={() => setShowCreateSyndicateModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Syndicate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Atlas Horizon Syndicate"
                  value={synName}
                  onChange={(e) => setSynName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Investment Thesis</label>
                <textarea
                  rows={2}
                  placeholder="Backing AI and fintech startups with high defensibility..."
                  value={synThesis}
                  onChange={(e) => setSynThesis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">Target Raise ($)</label>
                  <input
                    type="number"
                    value={synTarget}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      setSynTarget(t);
                      setSynCommitment(Math.round(t * 0.1)); // auto enforce 10%
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">
                    Leader Skin-in-the-game (Min 10%)
                  </label>
                  <input
                    type="number"
                    value={synCommitment}
                    onChange={(e) => setSynCommitment(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const res = createNewSyndicate({
                    name: synName || "Alpha Syndicate",
                    thesis: synThesis || "High moat seed investments",
                    target_amount: synTarget,
                    leader_commitment: synCommitment,
                  });
                  setShowCreateSyndicateModal(false);
                  showBanner(res.message, !res.success);
                  if (res.success) {
                    confetti({ particleCount: 80, spread: 70 });
                  }
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
              >
                ESTABLISH SYNDICATE & COMMIT CAPITAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venture Academy Modals & UNY Coach Banner */}
      <UnyCoachBanner />
      <WhyModal />
      <VentureLibraryModal />
      <MiniChallengeModal />

      {/* Footer */}
      <footer className="py-8 bg-neutral-950 border-t border-neutral-900 text-xs text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">UNYQUEST</span>
            <span>•</span>
            <span>Build. Fund. Grow. Win.</span>
            <span>•</span>
            <span>Multiplayer Entrepreneurship & Venture Strategy Engine</span>
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
