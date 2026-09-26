-- ====================================================================
-- VENTURE GAME - Master Database Schema (Supabase / PostgreSQL)
-- Multi-player Entrepreneurship & Venture Capital Strategy Game
-- ====================================================================

-- 1. Profiles (Players)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT DEFAULT '🚀',
  email TEXT,
  founder_capital NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  investor_capital NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  founder_reputation INTEGER NOT NULL DEFAULT 50,
  investor_reputation INTEGER NOT NULL DEFAULT 50,
  jury_reputation INTEGER NOT NULL DEFAULT 50,
  founder_level INTEGER NOT NULL DEFAULT 1,
  investor_level INTEGER NOT NULL DEFAULT 1,
  jury_level TEXT NOT NULL DEFAULT 'Junior Jury',
  referrals_count INTEGER NOT NULL DEFAULT 0,
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  founder_name TEXT NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  sector TEXT NOT NULL,
  market TEXT NOT NULL,
  business_model TEXT NOT NULL,
  founder_strengths TEXT[] NOT NULL DEFAULT '{}',
  stage TEXT NOT NULL DEFAULT 'Pre-seed',
  total_raised NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  is_distressed BOOLEAN NOT NULL DEFAULT FALSE,
  is_exited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Company Metrics
CREATE TABLE IF NOT EXISTS public.company_metrics (
  company_id TEXT PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  cash NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  users INTEGER NOT NULL DEFAULT 0,
  growth NUMERIC(6, 2) NOT NULL DEFAULT 15.00,
  monthly_burn NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
  runway NUMERIC(6, 2) NOT NULL DEFAULT 10.00,
  valuation NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
  market_size NUMERIC(15, 2) NOT NULL DEFAULT 10000000000.00,
  product_score INTEGER NOT NULL DEFAULT 50,
  team_score INTEGER NOT NULL DEFAULT 50,
  traction_score INTEGER NOT NULL DEFAULT 40,
  distribution_score INTEGER NOT NULL DEFAULT 40,
  defensibility_score INTEGER NOT NULL DEFAULT 35,
  founder_ownership NUMERIC(6, 2) NOT NULL DEFAULT 100.00,
  investor_ownership NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  employee_ownership NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Cap Table Entries
CREATE TABLE IF NOT EXISTS public.cap_table_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  investor_id TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  equity_percentage NUMERIC(6, 2) NOT NULL,
  invested_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  entry_valuation NUMERIC(15, 2) NOT NULL,
  is_founder BOOLEAN NOT NULL DEFAULT FALSE,
  is_syndicate BOOLEAN NOT NULL DEFAULT FALSE,
  syndicate_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Funding Rounds
CREATE TABLE IF NOT EXISTS public.funding_rounds (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  committed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  pre_money_valuation NUMERIC(15, 2) NOT NULL,
  post_money_valuation NUMERIC(15, 2) NOT NULL,
  equity_offered_percentage NUMERIC(6, 2) NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  closed_at TIMESTAMPTZ
);

-- 6. Investments
CREATE TABLE IF NOT EXISTS public.investments (
  id TEXT PRIMARY KEY,
  investor_id TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  amount_invested NUMERIC(15, 2) NOT NULL,
  equity_percentage NUMERIC(6, 2) NOT NULL,
  entry_valuation NUMERIC(15, 2) NOT NULL,
  current_valuation NUMERIC(15, 2) NOT NULL,
  virtual_return NUMERIC(15, 2) NOT NULL,
  moic NUMERIC(8, 2) NOT NULL DEFAULT 1.00,
  is_exited BOOLEAN NOT NULL DEFAULT FALSE,
  exit_proceeds NUMERIC(15, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Syndicates
CREATE TABLE IF NOT EXISTS public.syndicates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  thesis TEXT NOT NULL,
  leader_id TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  committed_amount NUMERIC(15, 2) NOT NULL,
  leader_commitment NUMERIC(15, 2) NOT NULL,
  min_investment NUMERIC(15, 2) NOT NULL DEFAULT 5000.00,
  historical_returns NUMERIC(8, 2) NOT NULL DEFAULT 1.00,
  reputation INTEGER NOT NULL DEFAULT 75,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Syndicate Members
CREATE TABLE IF NOT EXISTS public.syndicate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_id TEXT NOT NULL REFERENCES public.syndicates(id) ON DELETE CASCADE,
  investor_id TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  committed_amount NUMERIC(15, 2) NOT NULL,
  ownership_share_percentage NUMERIC(6, 2) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Pitches & Term Sheets
CREATE TABLE IF NOT EXISTS public.pitches (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  founder_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  ask NUMERIC(15, 2) NOT NULL,
  valuation NUMERIC(15, 2) NOT NULL,
  problem TEXT,
  solution TEXT,
  target_archetype TEXT NOT NULL,
  score INTEGER NOT NULL,
  decision TEXT NOT NULL,
  feedback_reason TEXT,
  pitch_cost NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.term_sheets (
  id TEXT PRIMARY KEY,
  pitch_id TEXT NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  investor_id TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  investor_archetype TEXT NOT NULL,
  investment_amount NUMERIC(15, 2) NOT NULL,
  pre_money_valuation NUMERIC(15, 2) NOT NULL,
  post_money_valuation NUMERIC(15, 2) NOT NULL,
  ownership_percentage NUMERIC(6, 2) NOT NULL,
  special_condition TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Jury Reviews
CREATE TABLE IF NOT EXISTS public.jury_reviews (
  id TEXT PRIMARY KEY,
  jury_id TEXT NOT NULL,
  jury_name TEXT NOT NULL,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  market_score INTEGER NOT NULL,
  team_score INTEGER NOT NULL,
  traction_score INTEGER NOT NULL,
  business_model_score INTEGER NOT NULL,
  valuation_fairness_score INTEGER NOT NULL,
  recommendation TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Immutable Transaction Ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  company_id TEXT,
  type TEXT NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  balance_after NUMERIC(15, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Market Conditions
CREATE TABLE IF NOT EXISTS public.market_conditions (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'NORMAL',
  valuation_multiplier NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
  investor_appetite NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
  growth_multiplier NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
  description TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_founder ON public.companies(founder_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON public.investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_company ON public.investments(company_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_company ON public.cap_table_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_player ON public.transactions(player_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cap_table_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndicate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jury_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_conditions ENABLE ROW LEVEL SECURITY;

-- Public read policies for open game exploration
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Companies readable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Company metrics readable by everyone" ON public.company_metrics FOR SELECT USING (true);
CREATE POLICY "Cap table readable by everyone" ON public.cap_table_entries FOR SELECT USING (true);
CREATE POLICY "Funding rounds readable by everyone" ON public.funding_rounds FOR SELECT USING (true);
CREATE POLICY "Investments readable by everyone" ON public.investments FOR SELECT USING (true);
CREATE POLICY "Syndicates readable by everyone" ON public.syndicates FOR SELECT USING (true);
CREATE POLICY "Syndicate members readable by everyone" ON public.syndicate_members FOR SELECT USING (true);
CREATE POLICY "Jury reviews readable by everyone" ON public.jury_reviews FOR SELECT USING (true);
CREATE POLICY "Market conditions readable by everyone" ON public.market_conditions FOR SELECT USING (true);
