"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  Award,
  ArrowRight,
  Flame,
  Globe2,
  Coins,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/lib/game-store";

export default function LandingPage() {
  const { marketCondition, companies, syndicates } = useGame();

  const activeSeedDeals = companies.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Banner: Global Market Condition */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-neutral-900 to-indigo-950 border-b border-neutral-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-400">Global Market State:</span>
            <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {marketCondition}
            </span>
            <span className="text-neutral-500 hidden sm:inline">
              Multiplayer venture ecosystem live simulation
            </span>
          </div>
          <div className="flex items-center space-x-4 text-neutral-400">
            <span>20+ Seed Startups Live</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">$100K Founder + $100K Investor Starter Capital</span>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-neutral-950 text-lg shadow-lg shadow-emerald-500/20">
              U
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg text-white">
                UNYQUEST
              </span>
              <span className="text-[10px] text-emerald-400 block tracking-widest font-mono uppercase">
                Build. Fund. Grow. Win.
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300">
            <Link href="#features" className="hover:text-emerald-400 transition">
              Gameplay Loop
            </Link>
            <Link href="#deals" className="hover:text-emerald-400 transition">
              Live Deals
            </Link>
            <Link href="#syndicates" className="hover:text-emerald-400 transition">
              Syndicates
            </Link>
            <Link href="#rules" className="hover:text-emerald-400 transition">
              Economics
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard?view=discover"
              className="text-xs px-3.5 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition"
            >
              Explore Deals
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5"
            >
              <span>Play Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fictional Multiplayer Venture Ecosystem</span>
            <span className="text-neutral-600">|</span>
            <span className="text-emerald-400 font-medium">No real-money risk</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6">
            BUILD. FUND. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              GROW. WIN.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Build a company. Raise virtual capital. Invest in other founders. Create
            syndicates. Build your reputation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/dashboard?view=founder"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-base shadow-xl shadow-emerald-500/25 transition flex items-center justify-center space-x-2 group"
            >
              <span>START YOUR COMPANY</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard?view=investor"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-base border border-neutral-700/80 transition flex items-center justify-center space-x-2"
            >
              <span>EXPLORE THE MARKET</span>
              <Globe2 className="w-4 h-4 text-neutral-400" />
            </Link>
          </div>

          {/* Starter Package Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur">
            <div className="p-3 text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                Founder Capital
              </span>
              <span className="text-2xl font-bold text-white">$100,000</span>
              <span className="text-xs text-neutral-400 block mt-0.5">
                For building, hiring, growth & pitch fees
              </span>
            </div>
            <div className="p-3 text-left border-t sm:border-t-0 sm:border-l border-neutral-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 block mb-1">
                Investor Capital
              </span>
              <span className="text-2xl font-bold text-white">$100,000</span>
              <span className="text-xs text-neutral-400 block mt-0.5">
                For backing peer startups & syndicates
              </span>
            </div>
            <div className="p-3 text-left border-t sm:border-t-0 sm:border-l border-neutral-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                Ecosystem Loop
              </span>
              <span className="text-2xl font-bold text-white">Full Stack</span>
              <span className="text-xs text-neutral-400 block mt-0.5">
                Founder → Pitch → Grow → Exit → Super Angel
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Dual Loop */}
      <section id="features" className="py-20 border-b border-neutral-900 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
              GAME ARCHITECTURE
            </h2>
            <p className="text-3xl font-bold text-white tracking-tight">
              Two Fundamental Social & Economic Loops
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Fundamental Loop */}
            <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">The Gameplay Loop</h3>
              <p className="text-sm text-neutral-400 mb-6">
                Every decision has trade-offs. Spend money on hiring or preserve runway?
                Pitch now or polish traction first?
              </p>
              <div className="space-y-3 font-mono text-xs text-neutral-300">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">01.</span>
                  <span>Create company & receive $100K founder capital</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">02.</span>
                  <span>Deploy capital: Product, Marketing, Talent, TAM</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">03.</span>
                  <span>Pitch Generalist, Specialist & Operator VCs</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">04.</span>
                  <span>Accept Term Sheets, dilute equity, scale & exit!</span>
                </div>
              </div>
            </div>

            {/* The Defining Social Loop */}
            <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 relative">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">The Defining Social Loop</h3>
              <p className="text-sm text-neutral-400 mb-6">
                Organic network growth driven by real economic necessity rather than
                artificial referral spam.
              </p>
              <div className="space-y-3 font-mono text-xs text-neutral-300">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-indigo-400 font-bold">01.</span>
                  <span>Founder runs low on cash & needs capital</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-indigo-400 font-bold">02.</span>
                  <span>Invites friend via custom shareable Deal Page</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-indigo-400 font-bold">03.</span>
                  <span>Friend claims $100K investor capital & invests</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
                  <span className="text-indigo-400 font-bold">04.</span>
                  <span>Friend starts their own startup and invites next investor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Deals Preview */}
      <section id="deals" className="py-20 border-b border-neutral-900 bg-neutral-950/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                ACTIVE SECTOR DEALS
              </h2>
              <p className="text-3xl font-bold text-white tracking-tight">
                Live Ecosystem Companies
              </p>
            </div>
            <Link
              href="/dashboard?view=discover"
              className="mt-4 md:mt-0 text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>View all 20+ startups</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeSeedDeals.map((comp) => (
              <div
                key={comp.id}
                className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {comp.sector}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
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
                    <span className="text-neutral-500">Valuation</span>
                    <span className="font-mono font-medium text-white">
                      ${(comp.metrics.valuation / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-neutral-500">Runway</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {comp.metrics.runway} mo
                    </span>
                  </div>
                  <Link
                    href={`/deal/${comp.id}`}
                    className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-xs font-semibold text-neutral-200 transition text-center block"
                  >
                    Review Deal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-role capabilities */}
      <section className="py-20 border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
              PERSISTENT REPUTATION & ROLES
            </h2>
            <p className="text-3xl font-bold text-white tracking-tight">
              One Player. Five Strategic Roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800">
              <Building2 className="w-7 h-7 text-emerald-400 mb-3" />
              <h4 className="font-bold text-white mb-1">Founder</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Build products, hire teams, manage runway, survive distress, pitch term sheets, and orchestrate unicorn exits.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800">
              <Coins className="w-7 h-7 text-indigo-400 mb-3" />
              <h4 className="font-bold text-white mb-1">Investor</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Construct diversified startup portfolios, negotiate equity, track virtual MOIC, and back fellow founders.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800">
              <Users className="w-7 h-7 text-amber-400 mb-3" />
              <h4 className="font-bold text-white mb-1">Syndicate Lead</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Commit 10% leader skin-in-the-game, pool capital from fellow players, and lead competitive investment rounds.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800">
              <Award className="w-7 h-7 text-cyan-400 mb-3" />
              <h4 className="font-bold text-white mb-1">Jury Member</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Evaluate pitches across market, moat, and valuation fairness. Advance from Junior Jury to Investment Committee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 bg-gradient-to-b from-neutral-950 to-neutral-900 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to test your venture strategy?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Receive your initial $100K Founder + $100K Investor virtual capital. Start your first company or back a breakout founder today.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-base shadow-xl shadow-emerald-500/25 transition"
          >
            <span>ENTER VENTURE GAME</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Mandatory User Requirement: Landing Page Footer */}
      <footer className="py-10 bg-neutral-950 border-t border-neutral-900 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">UNYQUEST</span>
            <span>•</span>
            <span>Build. Fund. Grow. Win.</span>
            <span>•</span>
            <span>All currency, equity, and valuations are virtual.</span>
          </div>

          {/* User Requested Link */}
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
