# UNYQUEST
### Build. Fund. Grow. Win.
> An [EM300.co](https://em300.co) Company

A browser-based multiplayer entrepreneurship and venture-capital strategy game where players navigate a persistent fictional venture ecosystem as a **Founder**, **Investor**, **Syndicate Leader**, and **Jury Member**.

---

## 1. Product Vision & Thesis

UNYQUEST is not an educational lecture disguised as software. It is a modern strategy game combining elements of tycoon games, pitch competitions, and multiplayer capital allocation:

- **The Gameplay Loop**:
  $$\text{Create Company} \to \text{Spend Capital} \to \text{Build Traction} \to \text{Pitch VCs} \to \text{Raise Capital} \to \text{Scale} \to \text{Exit} \to \text{Reinvest}$$
- **The Social Viral Loop**:
  $$\text{Founder needs capital} \to \text{Invites player via Deal Room} \to \text{Friend receives \$100K Starter Package} \to \text{Friend invests} \to \text{Friend builds their own startup} \to \text{Invites next investor}$$

---

## 2. Core Architecture

The codebase strictly decouples business logic from presentation:

```
├── src/
│   ├── engine/                # Pure TypeScript Game Engine (zero UI dependencies)
│   │   ├── types.ts           # Master domain entities & data contracts
│   │   ├── config.ts          # Tunable economy parameters, fees & weights
│   │   ├── company.ts         # Creation, actions with trade-offs, runway, exits
│   │   ├── pitch.ts           # Pitch evaluation, archetypes, term sheets
│   │   ├── investment.ts      # Dilution, pre/post-money, cap tables, MOIC
│   │   ├── syndicate.ts       # 10% leader commitment, pooling, deployment
│   │   ├── reputation.ts      # Founder, investor, and jury tier progression
│   │   ├── market.ts          # BOOM/NORMAL/TIGHT/CRISIS cycles & events
│   │   └── archetypes.ts      # 20+ seed startups & NPC investor profiles
│   ├── lib/
│   │   ├── game-store.tsx     # Reactive state store & multiplayer simulation
│   │   └── supabase.ts        # Supabase client integration
│   └── app/
│       ├── page.tsx           # Landing page with live market ticker
│       ├── dashboard/page.tsx # Master Operating Cockpit & Action Hub
│       ├── deal/[id]/page.tsx # Public shareable deal page for viral raises
│       └── api/               # Validated server-side endpoints
├── supabase/
│   └── migrations/            # Complete PostgreSQL DDL, RLS & seed migrations
└── tests/                     # Vitest test suite for all economic formulas
```

---

## 3. Starter Economy & Roles

Every new player receives two strictly separated balances:
- **$100,000 Founder Capital**: Used for product development, marketing sprints, hiring talent, sales, and pitch fees.
- **$100,000 Investor Capital**: Used solely for investing in peer companies and leading or joining syndicates.

### Player Roles:
1. **Founder**: Manage runway (`cash / monthly_burn`), steer clear of distress mode, negotiate term sheets, and orchestrate IPOs or strategic acquisitions.
2. **Investor**: Build a diversified portfolio, track virtual MOIC, and allocate capital to high-growth startups.
3. **Syndicate Leader**: Commit a minimum of 10% skin-in-the-game, pool capital, and lead funding rounds.
4. **Jury Member**: Deliberate on pitch competitions, evaluate unit economics and defensibility, and level up from *Junior Jury* to *Investment Committee*.

---

## 4. 20 Pre-Seeded Startup Archetypes

UNYQUEST comes seeded with 20 diverse startup archetypes across global corridors:
- **AI Logistics** (*FleetMind AI*)
- **African Cross-Border Fintech** (*AfriPay Corridor*)
- **Specialist Healthcare Marketplace** (*DocDirect Care*)
- **Construction Safety SaaS** (*SitePulse Build*)
- **Carbon Accounting Enterprise Software** (*TerraScope Zero*)
- **Farm-to-Restaurant B2B Marketplace** (*ChefConnect Direct*)
- **Commercial PropTech AI** (*TenantFlow OS*)
- **Technical Micro-Credentialing** (*SkillForge Micro*)
- **Zero-Trust Autonomous Security** (*CipherGuard AI*)
- **Middle East Net-60 Working Capital** (*OmniPay B2B*)
- **AgTech Soil Analytics & Fertilizer Exchange** (*AgriRoots Yield*)
- **Digital Nomad Subscription Pass** (*NomadPass Hub*)
- **EU SME Cloud Accounting** (*LedgerBooks Cloud*)
- **Satellite-Verified Biodiversity Carbon Credits** (*CarbonCredit Ex*)
- **AI Recruiting & Technical Interview Evaluator** (*TalentScout Neural*)
- **Supply-Chain Container Detention Prevention** (*SupplyTrace Ledger*)
- **Fractional Luxury Resale Vault** (*VintageSwap Vault*)
- **Virtual Power Plant Orchestrator** (*SolarGrid Sync*)
- **Parametric Marine Cargo Insurtech** (*InsureWave Cargo*)
- **Hospitality & Fine Dining PMS** (*DineDesk PMS*)

---

## 5. Automated Test Coverage

The game engine is covered by an automated test suite verifying core formulas:
- `tests/investment-dilution.test.ts`: Validates pre-money, post-money, and proportional cap table dilution.
- `tests/pitch-evaluation.test.ts`: Validates archetype scoring weights and feedback reasons.
- `tests/runway-actions.test.ts`: Verifies runway calculations, non-linear action trade-offs, and distress triggers.
- `tests/syndicate-allocation.test.ts`: Validates the mandatory 10% leader commitment and pro-rata ownership.
- `tests/referral-activation.test.ts`: Verifies starter capital grants and friend direct investments.
- `tests/exit-recycling.test.ts`: Validates acquisition and IPO payouts and proceeds recycling into Investor Capital.

Run tests:
```bash
npm test
```

---

## 6. Local Setup & Build

```bash
# Clone the repository
git clone https://github.com/AberraouiTekypay/unyquest.git
cd unyquest

# Install dependencies
npm install --legacy-peer-deps

# Run test suite
npm test

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to play.

---

## 7. Supabase Database Setup (Optional)

To connect your own Supabase instance:
1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run the SQL migration in `supabase/migrations/20260927000000_init.sql` inside the Supabase SQL editor.

*(Note: The game operates completely out-of-the-box in standalone mode with reactive local persistence even without Supabase credentials).*

---

## 8. Deployment & Attribution

- Built as a modern Next.js web application deployable to Vercel.
- **An [EM300.co](https://em300.co) Company**.
