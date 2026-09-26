# UNYQUEST — Architectural Specification
> *Build. Fund. Grow. Win.* — An [EM300.co](https://em300.co) Company

---

## 1. High-Level System Architecture

UNYQUEST is designed around a strict four-tier separation of concerns:

```
+--------------------------------------------------------------------+
|                         PRESENTATION LAYER                         |
|   Next.js 16 (App Router) + React 19 + Tailwind CSS + Lucide Icons  |
|                                                                    |
|  - Landing Page (Hero, Value Prop, Live Market & Deal Feed)         |
|  - Founder HQ (Runway HUD, Company Cockpit, Strategic Action Deck) |
|  - Pitch Arena (VC Pitch Deck Builder, Term Sheet Negotiation)     |
|  - Social Deal Room (Viral Friend Loop with Referral Capital Grant)|
|  - Investor Dashboard (Cap Tables, Portfolio MOIC Tracking)        |
|  - Syndicate Hub (Skin-in-the-game Pooling & Pro-rata Equity)      |
|  - Jury Chamber (Pitch Scoring & Multi-tier Promotion)             |
+---------------------------------+----------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                         APPLICATION STATE                          |
|         Client/Server GameStore (`src/lib/game-store.tsx`)         |
|  - Multi-persona simulation (Founder, Friend, Angel, Syndicate Lead)|
|  - Deterministic localStorage cache with instant client hydration  |
|  - Optional Supabase PostgreSQL live synchronization               |
+---------------------------------+----------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                     PURE TYPESCRIPT GAME ENGINE                    |
|                        (`src/engine/*`)                            |
|                                                                    |
|  - Zero React / Browser dependencies (usable by Web, CLI, Roblox)  |
|  - Tunable Economy & Archetype Configuration (`config.ts`)         |
|  - Valuation, Runway & Distress Engine (`company.ts`)              |
|  - Pitch Scoring & Term Sheet Generation (`pitch.ts`)              |
|  - Dilution & Pro-Rata Cap Table Algebra (`investment.ts`)         |
|  - Syndicate Skin-in-the-Game & Pooling (`syndicate.ts`)           |
|  - Tri-Role Reputation Tracking (`reputation.ts`)                  |
|  - Market Cycle & Stochastic Event Engine (`market.ts`)            |
+---------------------------------+----------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                         PERSISTENCE LAYER                          |
|            Supabase / PostgreSQL Schema (`supabase/`)              |
|                                                                    |
|  - Immutable transaction ledger for auditability                   |
|  - Row Level Security (RLS) policies                               |
|  - Multi-tenant profiles, cap tables, and pitch reviews            |
+--------------------------------------------------------------------+
```

---

## 2. Decoupling for Future Platforms (Roblox & Mobile)

As mandated in Section 53 of the product specification, the game engine in `src/engine/` contains zero framework-specific imports:

```typescript
// Pure TypeScript engine signature example
export function executeFundingRound(
  params: InvestmentExecutionParams
): InvestmentExecutionResult;

export function evaluatePitch(
  config: PitchConfig
): PitchOutcome;
```

This guarantees that:
1. **Roblox Client**: The TypeScript logic can be transpiled directly to Luau using `roblox-ts` or consumed via JSON-RPC / REST endpoints.
2. **Mobile (React Native / Flutter / Swift)**: The same pure engine services can run on-device or via the Next.js API routes.
3. **Headless Simulations**: Automated bot simulations and balance tests run in pure Node.js environments via Vitest.

---

## 3. Data Integrity & Immutable Ledger

All financial operations adhere to double-entry ledger principles:
- Balances are never modified directly without an associated `TransactionLedgerEntry`.
- Each ledger entry records:
  - `id`: Unique transaction identifier.
  - `player_id`: The originating actor.
  - `company_id`: Associated startup (if applicable).
  - `account`: `FOUNDER_CAPITAL`, `INVESTOR_CAPITAL`, or `COMPANY_TREASURY`.
  - `amount`: Signed credit or debit.
  - `balance_after`: Running balance snapshot for cryptographic auditability.
  - `description`: Human-readable context.
