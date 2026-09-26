-- ====================================================================
-- UNYQUEST — Venture Academy & Learning Progression Schema
-- Tracks Quests, Granular Skills, Role XP, Mistakes, and Achievements
-- ====================================================================

-- 1. Player Role Progression (High-level Role XP & Levels)
CREATE TABLE IF NOT EXISTS public.player_progression (
  player_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  founder_xp INTEGER NOT NULL DEFAULT 0,
  founder_level INTEGER NOT NULL DEFAULT 1,
  investor_xp INTEGER NOT NULL DEFAULT 0,
  investor_level INTEGER NOT NULL DEFAULT 1,
  jury_xp INTEGER NOT NULL DEFAULT 0,
  jury_level INTEGER NOT NULL DEFAULT 1,
  syndicate_xp INTEGER NOT NULL DEFAULT 0,
  syndicate_level INTEGER NOT NULL DEFAULT 1,
  unlock_tier INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Player Granular Skills (Skill Tree: 10 Founder, 10 Investor, 7 Jury)
CREATE TABLE IF NOT EXISTS public.player_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('FOUNDER', 'INVESTOR', 'JURY')),
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(player_id, skill_id)
);

-- 3. Player Quests (Action-driven milestone quests)
CREATE TABLE IF NOT EXISTS public.player_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(player_id, quest_id)
);

-- 4. Player Achievements (Badges & Milestones)
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(player_id, achievement_id)
);

-- 5. Player Mistake Tracker (For Adaptive UNY Coaching)
CREATE TABLE IF NOT EXISTS public.player_mistakes (
  player_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  distress_count INTEGER NOT NULL DEFAULT 0,
  burn_excess_count INTEGER NOT NULL DEFAULT 0,
  overvaluation_pitch_count INTEGER NOT NULL DEFAULT 0,
  failed_pitches_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.player_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_mistakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own progression"
  ON public.player_progression FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own progression"
  ON public.player_progression FOR ALL
  USING (auth.uid() = player_id);

CREATE POLICY "Users can view their own skills"
  ON public.player_skills FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own skills"
  ON public.player_skills FOR ALL
  USING (auth.uid() = player_id);

CREATE POLICY "Users can view their own quests"
  ON public.player_quests FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own quests"
  ON public.player_quests FOR ALL
  USING (auth.uid() = player_id);

CREATE POLICY "Users can view their own achievements"
  ON public.player_achievements FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own achievements"
  ON public.player_achievements FOR ALL
  USING (auth.uid() = player_id);

CREATE POLICY "Users can view their own mistakes"
  ON public.player_mistakes FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own mistakes"
  ON public.player_mistakes FOR ALL
  USING (auth.uid() = player_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_skills_player_cat ON public.player_skills(player_id, category);
CREATE INDEX IF NOT EXISTS idx_player_quests_player ON public.player_quests(player_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON public.player_achievements(player_id, is_unlocked);
