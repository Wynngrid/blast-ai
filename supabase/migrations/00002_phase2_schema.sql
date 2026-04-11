-- BLAST AI Phase 2 Database Schema
-- Supabase Migration: 00002_phase2_schema.sql
-- Tables for practitioner availability and portfolio management

-- ============================================================================
-- TABLES
-- ============================================================================

-- Availability rules (recurring weekly pattern)
-- Per D-04: Practitioners set weekly availability (e.g., Mon/Wed 2-6pm)
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Exception dates (blocked dates, one-off availability changes)
-- Per D-06: Practitioners can block specific dates
CREATE TABLE availability_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio items (structured URL-based storage)
-- Per D-02: Portfolio items are URL-based links only (Behance, Dribbble, YouTube, etc.)
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_availability_rules_practitioner ON availability_rules(practitioner_id);
CREATE INDEX idx_availability_exceptions_practitioner ON availability_exceptions(practitioner_id);
CREATE INDEX idx_availability_exceptions_date ON availability_exceptions(exception_date);
CREATE INDEX idx_portfolio_items_practitioner ON portfolio_items(practitioner_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for availability_rules updated_at
CREATE TRIGGER update_availability_rules_updated_at
  BEFORE UPDATE ON availability_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AVAILABILITY_RULES RLS POLICIES
-- Per T-02-01-01: Practitioners can only modify own rules via practitioner_id check
-- Per T-02-01-03: RLS uses auth.uid() to verify ownership, not client-provided user_id
-- ============================================================================

-- Practitioners can manage their own availability rules
CREATE POLICY "Practitioners can manage own availability rules"
  ON availability_rules FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ))
  WITH CHECK (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Anyone can view approved practitioners' availability (for booking in Phase 3)
CREATE POLICY "Anyone can view approved practitioners availability"
  ON availability_rules FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE application_status = 'approved'
  ));

-- ============================================================================
-- AVAILABILITY_EXCEPTIONS RLS POLICIES
-- ============================================================================

-- Practitioners can manage their own exceptions
CREATE POLICY "Practitioners can manage own exceptions"
  ON availability_exceptions FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ))
  WITH CHECK (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Anyone can view approved practitioners' exceptions (for booking in Phase 3)
CREATE POLICY "Anyone can view approved practitioners exceptions"
  ON availability_exceptions FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE application_status = 'approved'
  ));

-- ============================================================================
-- PORTFOLIO_ITEMS RLS POLICIES
-- Per T-02-01-02: Only approved practitioners' portfolios are publicly readable
-- ============================================================================

-- Practitioners can manage their own portfolio
CREATE POLICY "Practitioners can manage own portfolio"
  ON portfolio_items FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ))
  WITH CHECK (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Anyone can view approved practitioners' portfolio
CREATE POLICY "Anyone can view approved practitioners portfolio"
  ON portfolio_items FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE application_status = 'approved'
  ));
