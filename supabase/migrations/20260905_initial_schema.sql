-- ============================================================
-- CapitalGuard Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  organization  TEXT,
  job_role      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PORTFOLIOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL DEFAULT 'My Portfolio',
  total_capital  NUMERIC NOT NULL DEFAULT 100000000,  -- ₹10 Cr in paise? Or direct ₹
  risk_profile   TEXT NOT NULL DEFAULT 'Balanced' CHECK (risk_profile IN ('Conservative', 'Balanced', 'Aggressive')),
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ASSETS (Global reference table) ─────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  symbol              TEXT NOT NULL UNIQUE,
  asset_class         TEXT NOT NULL,
  price               NUMERIC NOT NULL DEFAULT 0,
  expected_return     NUMERIC NOT NULL DEFAULT 0,
  volatility          NUMERIC NOT NULL DEFAULT 0,
  liquidity_score     NUMERIC NOT NULL DEFAULT 0.8,
  risk_score          NUMERIC NOT NULL DEFAULT 0.5,
  minimum_allocation  NUMERIC NOT NULL DEFAULT 0,
  maximum_allocation  NUMERIC NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PORTFOLIO HOLDINGS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id   UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  asset_name     TEXT NOT NULL,
  asset_class    TEXT NOT NULL,
  allocation     NUMERIC NOT NULL DEFAULT 0,
  current_value  NUMERIC NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RISK POLICIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_policies (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_equity          NUMERIC NOT NULL DEFAULT 0.65,
  max_volatility      NUMERIC NOT NULL DEFAULT 0.18,
  warning_var         NUMERIC NOT NULL DEFAULT 0.05,
  critical_var        NUMERIC NOT NULL DEFAULT 0.08,
  max_drawdown        NUMERIC NOT NULL DEFAULT 0.15,
  max_concentration   NUMERIC NOT NULL DEFAULT 0.50,
  min_liquidity       NUMERIC NOT NULL DEFAULT 0.70,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── ALERTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id   UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  severity       TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  metric         TEXT NOT NULL,
  current_value  NUMERIC,
  threshold      NUMERIC,
  message        TEXT NOT NULL,
  recommendation TEXT,
  status         TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at    TIMESTAMPTZ
);

-- ─── DECISIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decisions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id    UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL DEFAULT 'REBALANCE',
  trigger         TEXT,
  reason          TEXT,
  action          TEXT,
  before_metrics  JSONB,
  after_metrics   JSONB,
  status          TEXT NOT NULL DEFAULT 'EXECUTED',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STRESS TESTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stress_tests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id      UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  scenario_name     TEXT NOT NULL,
  scenario_type     TEXT NOT NULL,
  shock_data        JSONB,
  portfolio_impact  NUMERIC,
  capital_loss      NUMERIC,
  new_risk          NUMERIC,
  new_var           NUMERIC,
  new_liquidity     NUMERIC,
  risk_status       TEXT,
  recommendation    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USER SETTINGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme                   TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  simulation_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  simulation_interval     INTEGER NOT NULL DEFAULT 6000,
  notifications_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stress_tests_user_id ON stress_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_tests_created_at ON stress_tests(created_at DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- profiles: users can only access their own profile
CREATE POLICY "profiles_own" ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- portfolios: users can only access their own portfolios
CREATE POLICY "portfolios_own" ON portfolios FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- portfolio_holdings: users can only access holdings in their own portfolios
CREATE POLICY "holdings_own" ON portfolio_holdings FOR ALL
  USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
  )
  WITH CHECK (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
  );

-- risk_policies: users can only access their own risk policy
CREATE POLICY "risk_policies_own" ON risk_policies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- alerts: users can only access their own alerts
CREATE POLICY "alerts_own" ON alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- decisions: users can only access their own decisions
CREATE POLICY "decisions_own" ON decisions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- stress_tests: users can only access their own stress tests
CREATE POLICY "stress_tests_own" ON stress_tests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_settings: users can only access their own settings
CREATE POLICY "user_settings_own" ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── AUTO-PROFILE CREATION TRIGGER ──────────────────────────
-- Automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, organization, job_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', NULL),
    COALESCE(NEW.raw_user_meta_data->>'job_role', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default risk policy
  INSERT INTO public.risk_policies (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default user settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── SEED: Default assets (global reference data) ────────────
INSERT INTO assets (name, symbol, asset_class, expected_return, volatility, liquidity_score, risk_score, minimum_allocation, maximum_allocation) VALUES
  ('Indian Equity Large Cap', 'EQUITY_LC', 'Equity', 0.14, 0.18, 0.90, 0.65, 0.10, 0.65),
  ('Government Bonds', 'GOV_BOND', 'Fixed Income', 0.07, 0.04, 0.95, 0.20, 0.05, 0.50),
  ('Corporate Bonds AA', 'CORP_BOND', 'Fixed Income', 0.09, 0.06, 0.80, 0.30, 0.05, 0.40),
  ('Gold ETF', 'GOLD_ETF', 'Commodity', 0.08, 0.12, 0.85, 0.40, 0.02, 0.20),
  ('Real Estate Investment Trust', 'REIT', 'Real Estate', 0.10, 0.14, 0.60, 0.50, 0.02, 0.20),
  ('Cash & Equivalents', 'CASH', 'Cash', 0.05, 0.01, 1.00, 0.05, 0.03, 0.30)
ON CONFLICT (symbol) DO NOTHING;
