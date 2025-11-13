-- TrueFund Database Schema and RLS Policies
-- This file should be executed in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  profile_photo_url TEXT,
  is_ngo BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location TEXT,
  cause TEXT NOT NULL,
  goal_amount BIGINT DEFAULT 0,
  collected_amount BIGINT DEFAULT 0,
  unique_code TEXT UNIQUE,
  qr_url TEXT,
  verified BOOLEAN DEFAULT false,
  is_temporary BOOLEAN DEFAULT false,
  hospital_email TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  donor_name TEXT,
  donor_id UUID REFERENCES users(id),
  amount BIGINT NOT NULL,
  tip_amount BIGINT DEFAULT 0,
  type TEXT DEFAULT 'donation',
  released BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_image TEXT,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ngo_verifications table
CREATE TABLE IF NOT EXISTS ngo_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  documents_url TEXT,
  verified BOOLEAN DEFAULT false,
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for campaigns
CREATE POLICY "Anyone can view campaigns" ON campaigns
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create campaigns" ON campaigns
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Campaign owners can update their campaigns" ON campaigns
  FOR UPDATE USING (auth.uid()::text = created_by::text);

-- RLS Policies for donations
CREATE POLICY "Anyone can view donations" ON donations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create donations" ON donations
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for tickets
CREATE POLICY "Anyone can create tickets" ON tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view tickets" ON tickets
  FOR SELECT USING (true);

-- RLS Policies for ngo_verifications
CREATE POLICY "Users can view their own verifications" ON ngo_verifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create verification requests" ON ngo_verifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

-- Create storage buckets (run these commands in Supabase Dashboard > Storage)
-- Note: These need to be created manually in the Supabase Dashboard
-- 1. Create bucket 'campaign-images' with public access
-- 2. Create bucket 'ngo-docs' with private access

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_cause ON campaigns(cause);
CREATE INDEX IF NOT EXISTS idx_campaigns_verified ON campaigns(verified);
CREATE INDEX IF NOT EXISTS idx_campaigns_unique_code ON campaigns(unique_code);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_ngo_verifications_user_id ON ngo_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_verifications_verified ON ngo_verifications(verified);
