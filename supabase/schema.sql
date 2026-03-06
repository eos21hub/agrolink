-- ============================================================
-- AgroLink AI — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  region      TEXT NOT NULL DEFAULT 'Greater Accra',
  role        TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CROPS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crops (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  crop_name       TEXT NOT NULL,
  quantity        NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  location        TEXT NOT NULL,
  harvest_date    DATE NOT NULL,
  expected_price  NUMERIC(10, 2) NOT NULL CHECK (expected_price >= 0),
  status          TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MARKET PRICES TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.market_prices (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop          TEXT NOT NULL,
  market        TEXT NOT NULL,
  price_per_kg  NUMERIC(10, 2) NOT NULL CHECK (price_per_kg >= 0),
  currency      TEXT NOT NULL DEFAULT 'GHS',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PREDICTIONS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.predictions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  crop_name        TEXT NOT NULL,
  demand_score     INTEGER NOT NULL CHECK (demand_score BETWEEN 0 AND 100),
  predicted_price  NUMERIC(10, 2) NOT NULL,
  best_market      TEXT NOT NULL,
  reasoning        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON public.market_prices(crop);
CREATE INDEX IF NOT EXISTS idx_market_prices_updated ON public.market_prices(updated_at DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── AUTO-CREATE PROFILE ON SIGNUP (belt-and-suspenders) ────
-- This trigger fires when a new auth.users row is created,
-- so even if the client-side insert fails, the profile exists.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, region, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'region', 'Greater Accra'),
    'farmer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crops: farmers can only CRUD their own crops
CREATE POLICY "Farmers can view own crops"
  ON public.crops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own crops"
  ON public.crops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update own crops"
  ON public.crops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can delete own crops"
  ON public.crops FOR DELETE
  USING (auth.uid() = user_id);

-- Market prices: anyone authenticated can read; only admins write
CREATE POLICY "Authenticated users can view market prices"
  ON public.market_prices FOR SELECT
  TO authenticated
  USING (true);

-- Predictions: farmers can only access their own
CREATE POLICY "Farmers can view own predictions"
  ON public.predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── SEED DATA — Market Prices ───────────────────────────────
INSERT INTO public.market_prices (crop, market, price_per_kg, currency) VALUES
  ('Maize',      'Accra - Makola Market',    2.50, 'GHS'),
  ('Maize',      'Kumasi - Kejetia Market',  2.30, 'GHS'),
  ('Cassava',    'Accra - Makola Market',    1.80, 'GHS'),
  ('Cassava',    'Tamale Central Market',    1.60, 'GHS'),
  ('Yam',        'Techiman Market',          4.20, 'GHS'),
  ('Yam',        'Kumasi - Kejetia Market',  4.80, 'GHS'),
  ('Tomato',     'Accra - Makola Market',    5.50, 'GHS'),
  ('Tomato',     'Techiman Market',          4.90, 'GHS'),
  ('Plantain',   'Kumasi - Kejetia Market',  2.10, 'GHS'),
  ('Plantain',   'Takoradi Market Circle',   2.40, 'GHS'),
  ('Pepper',     'Accra - Makola Market',    8.00, 'GHS'),
  ('Onion',      'Accra - Makola Market',    6.50, 'GHS'),
  ('Groundnut',  'Tamale Central Market',    7.20, 'GHS'),
  ('Rice',       'Accra - Makola Market',    5.90, 'GHS'),
  ('Cocoa',      'Techiman Market',          15.00, 'GHS'),
  ('Garden Egg', 'Cape Coast Market',        3.80, 'GHS'),
  ('Okra',       'Accra - Makola Market',    4.20, 'GHS'),
  ('Sorghum',    'Tamale Central Market',    2.80, 'GHS')
ON CONFLICT DO NOTHING;
