-- BLAST AI Initial Database Schema
-- Supabase Migration: 00001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('enterprise', 'practitioner', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE practitioner_tier AS ENUM ('rising', 'expert', 'master');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enterprises table
CREATE TABLE enterprises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  billing_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_enterprise_user UNIQUE (user_id)
);

-- Practitioners table
CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT,
  specializations TEXT[],
  industries TEXT[],
  tier practitioner_tier,
  hourly_rate INTEGER,
  tools TEXT[],
  portfolio JSONB,
  application_status application_status DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_practitioner_user UNIQUE (user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_practitioners_user_id ON practitioners(user_id);
CREATE INDEX idx_practitioners_status ON practitioners(application_status);
CREATE INDEX idx_practitioners_approved ON practitioners(application_status) WHERE application_status = 'approved';
CREATE INDEX idx_enterprises_user_id ON enterprises(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- ENTERPRISES RLS POLICIES
-- ============================================================================

-- Enterprise users can view their own enterprise data
CREATE POLICY "Enterprise users can view own data"
  ON enterprises FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Enterprise users can update their own enterprise data
CREATE POLICY "Enterprise users can update own data"
  ON enterprises FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enterprise users can insert their own enterprise data
CREATE POLICY "Enterprise users can insert own data"
  ON enterprises FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all enterprise data
CREATE POLICY "Admins can view all enterprises"
  ON enterprises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PRACTITIONERS RLS POLICIES
-- ============================================================================

-- Practitioners can view their own data
CREATE POLICY "Practitioners can view own data"
  ON practitioners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Practitioners can update their own data
CREATE POLICY "Practitioners can update own data"
  ON practitioners FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Practitioners can insert their own data
CREATE POLICY "Practitioners can insert own data"
  ON practitioners FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Approved practitioners are publicly visible (for browse)
CREATE POLICY "Anyone can view approved practitioners"
  ON practitioners FOR SELECT
  TO authenticated
  USING (application_status = 'approved');

-- Admins can view all practitioners (including pending)
CREATE POLICY "Admins can view all practitioners"
  ON practitioners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update practitioner status (approve/reject)
CREATE POLICY "Admins can update practitioners"
  ON practitioners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- AUTH TRIGGER: Create profile on signup
-- ============================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'enterprise'),
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
