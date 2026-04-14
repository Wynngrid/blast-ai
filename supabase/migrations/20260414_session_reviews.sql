-- Phase 4: Session Reviews and Outcomes Schema
-- Migration: 20260414_session_reviews.sql
-- Purpose: Create tables for review collection, session outcomes, and trust signals

-- =====================================================
-- session_reviews table per D-07 (multi-criteria rating)
-- =====================================================
CREATE TABLE session_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),

  -- Multi-criteria ratings per D-07 (1-5 scale)
  communication_rating SMALLINT NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  expertise_rating SMALLINT NOT NULL CHECK (expertise_rating BETWEEN 1 AND 5),
  helpfulness_rating SMALLINT NOT NULL CHECK (helpfulness_rating BETWEEN 1 AND 5),

  -- NPS per REV-01 (0-10 scale)
  nps_score SMALLINT NOT NULL CHECK (nps_score BETWEEN 0 AND 10),

  -- Written review per D-08 (required if nps_score <= 6, enforced at app level)
  comment TEXT,

  -- Visibility per D-09 (public by default)
  is_public BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure one review per booking (REV-01, REV-02)
CREATE UNIQUE INDEX idx_reviews_booking ON session_reviews(booking_id);

-- Index for practitioner review lookups (REV-03, REV-04, MENT-04)
CREATE INDEX idx_reviews_practitioner ON session_reviews(practitioner_id);

-- Index for enterprise review lookups
CREATE INDEX idx_reviews_enterprise ON session_reviews(enterprise_id);

-- =====================================================
-- session_outcomes table per D-04 (self-reported outcomes)
-- =====================================================
CREATE TABLE session_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),

  -- Multi-select tags per D-04
  -- Allowed values: 'skill_learned', 'blocker_resolved', 'need_followup', 'not_helpful'
  outcome_tags TEXT[] NOT NULL DEFAULT '{}',

  -- Optional notes per D-04
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure one outcome record per booking
CREATE UNIQUE INDEX idx_outcomes_booking ON session_outcomes(booking_id);

-- Index for enterprise outcome lookups (dashboard insights)
CREATE INDEX idx_outcomes_enterprise ON session_outcomes(enterprise_id);

-- =====================================================
-- Add needs_review column to bookings table
-- For tracking which completed sessions need reviews
-- =====================================================
ALTER TABLE bookings ADD COLUMN needs_review BOOLEAN NOT NULL DEFAULT false;

-- Index for finding bookings that need reviews
CREATE INDEX idx_bookings_needs_review ON bookings(enterprise_id, needs_review) WHERE needs_review = true;

-- =====================================================
-- RLS Policies for session_reviews
-- =====================================================
ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;

-- Enterprises can read public reviews (for browsing practitioners) per D-09
CREATE POLICY "Public reviews readable by enterprises"
  ON session_reviews FOR SELECT
  USING (is_public = true);

-- Enterprises can create reviews for their own bookings (T-04-01 mitigation)
CREATE POLICY "Enterprises can create reviews for their bookings"
  ON session_reviews FOR INSERT
  WITH CHECK (
    enterprise_id = (SELECT id FROM enterprises WHERE user_id = auth.uid())
  );

-- Practitioners can read reviews about themselves (MENT-04)
CREATE POLICY "Practitioners can read their own reviews"
  ON session_reviews FOR SELECT
  USING (
    practitioner_id = (SELECT id FROM practitioners WHERE user_id = auth.uid())
  );

-- Enterprises can read their own submitted reviews (for session history view)
CREATE POLICY "Enterprises can read their own reviews"
  ON session_reviews FOR SELECT
  USING (
    enterprise_id = (SELECT id FROM enterprises WHERE user_id = auth.uid())
  );

-- Admins full access to reviews (for reporting and moderation)
CREATE POLICY "Admins full access to reviews"
  ON session_reviews FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- RLS Policies for session_outcomes
-- =====================================================
ALTER TABLE session_outcomes ENABLE ROW LEVEL SECURITY;

-- Enterprises can create outcomes for their own bookings
CREATE POLICY "Enterprises can create outcomes for their bookings"
  ON session_outcomes FOR INSERT
  WITH CHECK (
    enterprise_id = (SELECT id FROM enterprises WHERE user_id = auth.uid())
  );

-- Enterprises can read their own outcomes (dashboard insights)
CREATE POLICY "Enterprises can read their own outcomes"
  ON session_outcomes FOR SELECT
  USING (
    enterprise_id = (SELECT id FROM enterprises WHERE user_id = auth.uid())
  );

-- Admins full access to outcomes (for AI insights and reporting)
CREATE POLICY "Admins full access to outcomes"
  ON session_outcomes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
