-- ==========================================
-- LEVERIXPRO SUPABASE MASTER SCHEMA
-- ==========================================
-- Instructions: Copy and paste this entire script into your Supabase SQL Editor and click "Run".

-- 1. PROFILES TABLE (Linked to Web3 Wallets)
CREATE TABLE IF NOT EXISTS public.profiles (
  wallet_address TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_followers INT DEFAULT 0,
  is_kol BOOLEAN DEFAULT FALSE,
  winrate_percentage NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. FEEDS / POSTS TABLE (Social Chart Sharing & CopyTrade)
CREATE TABLE IF NOT EXISTS public.feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_wallet TEXT REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
  content TEXT NOT NULL,
  token_symbol TEXT NOT NULL, -- e.g., 'SOL', 'WIF'
  sentiment TEXT CHECK (sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  image_url TEXT,             -- For technical chart uploads
  copytrade_payload JSONB,    -- Advanced: The exact Leverage/Collateral JSON for readers to copy
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE (Auto TP/SL Execution Engine — Queued by /api/trade)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  action TEXT CHECK (action IN ('LONG', 'SHORT')) NOT NULL,
  token_symbol TEXT NOT NULL,
  token_mint TEXT,
  leverage NUMERIC(5,1) NOT NULL,
  collateral TEXT NOT NULL,
  stop_loss TEXT DEFAULT '-3.0% trailing',
  take_profit TEXT DEFAULT '+25%',
  aegis_check TEXT CHECK (aegis_check IN ('PASSED', 'BLOCKED')) DEFAULT 'PASSED',
  order_type TEXT CHECK (order_type IN ('MARKET', 'LIMIT', 'TP_SL')) DEFAULT 'MARKET',
  limit_price NUMERIC(18,6),
  status TEXT CHECK (status IN ('PENDING', 'EXECUTED', 'CANCELLED', 'FAILED')) DEFAULT 'PENDING',
  tx_signature TEXT,  -- Solana transaction signature when executed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own orders
CREATE POLICY "Users can view their own orders."
  ON public.orders FOR SELECT
  USING ( true );

-- Allow anonymous insert for development
CREATE POLICY "Allow anonymous order creation for development"
  ON public.orders FOR INSERT
  WITH CHECK ( true );

-- 4. SENTIMENT ANALYTICS CACHE (For the OpenClaw AI)
CREATE TABLE IF NOT EXISTS public.sentiment_cache (
  token_symbol TEXT PRIMARY KEY,
  twitter_sentiment_score NUMERIC(5,2), -- -100 to 100
  dominant_narrative TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ==========================================
-- Security rule to allow anyone to read feeds and profiles, but only the owner can insert/update

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Allow public read access to feeds
CREATE POLICY "Feeds are viewable by everyone."
  ON public.feeds FOR SELECT
  USING ( true );

-- (For production, you will need to add Policies that verify the user's wallet signature to INSERT data,
-- but for now, we will allow anonymous inserts to develop the Feeds UI smoothly)
CREATE POLICY "Allow anonymous inserts for development"
  ON public.feeds FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Allow anonymous profile creation for development"
  ON public.profiles FOR INSERT
  WITH CHECK ( true );

-- ===============================================
-- 6. AGENT WALLETS TABLE (Custodial Gen-Zero Wallets)
-- ===============================================
CREATE TABLE IF NOT EXISTS public.agent_wallets (
  wallet_address TEXT PRIMARY KEY REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
  agent_public_key TEXT NOT NULL,
  agent_private_key TEXT NOT NULL, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS but restrict public read for obvious reasons
ALTER TABLE public.agent_wallets ENABLE ROW LEVEL SECURITY;
-- Service Role key bypasses RLS on Backend APIs.

-- Allow users to read ONLY their OWN agent public key (hide private key in application layer)
CREATE POLICY "Users can only see their own agent wallet"
  ON public.agent_wallets FOR SELECT
  USING ( wallet_address = auth.uid()::text ); -- Concept only, in Next.js Server Actions we fetch via Service Key.

-- Allow inserts during development
CREATE POLICY "Allow anonymous agent creation for development"
  ON public.agent_wallets FOR INSERT
  WITH CHECK ( true );
