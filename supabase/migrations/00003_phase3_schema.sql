-- BLAST AI Phase 3 Database Schema
-- Supabase Migration: 00003_phase3_schema.sql
-- Tables for coin-based payments, bookings, practitioner earnings, payouts, and notification logging

-- ============================================================================
-- TABLES
-- ============================================================================

-- BLAST Coins ledger (immutable, append-only)
-- Per D-12, D-16: 1 coin = $10 (~830 INR), expires 12 months from purchase
-- Per T-03-01: Append-only ledger (no UPDATE/DELETE), balance calculated from transactions
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'expire', 'refund')),
  amount INTEGER NOT NULL, -- Positive for purchase/refund, negative for spend/expire
  unit_price_inr INTEGER, -- For purchases: price per coin at time of purchase
  expires_at TIMESTAMPTZ, -- For purchases: 12 months from created_at per D-16
  reference_id TEXT, -- booking_id for spend, razorpay_order_id for purchase
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings table
-- Per D-04 through D-11: Multi-step wizard, session types, briefs, scheduling
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  session_duration INTEGER NOT NULL CHECK (session_duration IN (20, 40, 60, 90)),
  scheduled_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),

  -- Session brief (required per D-06)
  brief_stuck_on TEXT NOT NULL,
  brief_desired_outcome TEXT NOT NULL,
  brief_context TEXT,

  -- Meeting details (per D-08, D-09)
  meet_link TEXT,
  calendar_event_id TEXT,

  -- Payment
  coins_spent INTEGER NOT NULL,
  coin_transaction_id UUID REFERENCES coin_transactions(id),

  -- Cancellation (per D-10, D-11)
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT CHECK (cancelled_by IN ('enterprise', 'practitioner', 'admin')),
  refunded BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Practitioner earnings (derived from completed bookings)
-- Per PAY-03, PAY-04: 30% platform commission, practitioner gets 70%
CREATE TABLE practitioner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  gross_amount_inr INTEGER NOT NULL, -- Before commission
  commission_inr INTEGER NOT NULL, -- 30% platform fee per D-14
  net_amount_inr INTEGER NOT NULL, -- What practitioner earns
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'requested', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payout requests (per D-19: Manual payout request when balance reaches 5,000 INR)
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  amount_inr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_details JSONB, -- Stored securely, admin-only access
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Notification log (for debugging and audit)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'booking_confirmed', 'new_booking', 'reminder_24h'
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('enterprise', 'practitioner')),
  email TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resend_id TEXT -- Resend API response ID
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- coin_transactions indexes
CREATE INDEX idx_coin_transactions_enterprise ON coin_transactions(enterprise_id, created_at);
CREATE INDEX idx_coin_transactions_expiry ON coin_transactions(expires_at) WHERE type = 'purchase';

-- bookings indexes
CREATE INDEX idx_bookings_enterprise ON bookings(enterprise_id, status);
CREATE INDEX idx_bookings_practitioner ON bookings(practitioner_id, status);
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_at) WHERE status = 'confirmed';

-- practitioner_earnings indexes
CREATE INDEX idx_practitioner_earnings_practitioner ON practitioner_earnings(practitioner_id, status);

-- payout_requests indexes
CREATE INDEX idx_payout_requests_practitioner ON payout_requests(practitioner_id, status);

-- notification_log indexes
CREATE INDEX idx_notification_log_recipient ON notification_log(recipient_id, recipient_type);
CREATE INDEX idx_notification_log_booking ON notification_log(booking_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COIN_TRANSACTIONS RLS POLICIES
-- Per T-03-01: Append-only ledger, enterprises can only view their own transactions
-- ============================================================================

-- Enterprises can view their own coin transactions
CREATE POLICY "Enterprises view own coin transactions"
  ON coin_transactions FOR SELECT
  TO authenticated
  USING (enterprise_id IN (
    SELECT id FROM enterprises WHERE user_id = auth.uid()
  ));

-- Service role can insert coin transactions (via Server Actions)
-- No direct INSERT policy for users - all transactions via verified Server Actions
CREATE POLICY "Service role manages coin transactions"
  ON coin_transactions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- BOOKINGS RLS POLICIES
-- Per T-03-02: Enterprises see own bookings, practitioners see their bookings
-- ============================================================================

-- Enterprises can view their own bookings
CREATE POLICY "Enterprises view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (enterprise_id IN (
    SELECT id FROM enterprises WHERE user_id = auth.uid()
  ));

-- Practitioners can view bookings where they are the practitioner
CREATE POLICY "Practitioners view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Service role manages bookings (creation, status updates via Server Actions)
CREATE POLICY "Service role manages bookings"
  ON bookings FOR ALL
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- PRACTITIONER_EARNINGS RLS POLICIES
-- Per T-03-03: Practitioners see only their own earnings
-- ============================================================================

-- Practitioners can view their own earnings
CREATE POLICY "Practitioners view own earnings"
  ON practitioner_earnings FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Service role manages earnings (created when booking completes)
CREATE POLICY "Service role manages earnings"
  ON practitioner_earnings FOR ALL
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- PAYOUT_REQUESTS RLS POLICIES
-- Per T-03-04: Practitioners can INSERT own, admins manage all
-- ============================================================================

-- Practitioners can view their own payout requests
CREATE POLICY "Practitioners view own payout requests"
  ON payout_requests FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Practitioners can insert their own payout requests
CREATE POLICY "Practitioners insert own payout requests"
  ON payout_requests FOR INSERT
  TO authenticated
  WITH CHECK (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Admins can view all payout requests
CREATE POLICY "Admins view all payout requests"
  ON payout_requests FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Admins can update payout requests (approve/reject/complete)
CREATE POLICY "Admins update payout requests"
  ON payout_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- NOTIFICATION_LOG RLS POLICIES
-- Recipients can view their own notifications
-- ============================================================================

-- Enterprise recipients can view their notifications
CREATE POLICY "Enterprise recipients view own notifications"
  ON notification_log FOR SELECT
  TO authenticated
  USING (
    recipient_type = 'enterprise' AND
    recipient_id IN (
      SELECT id FROM enterprises WHERE user_id = auth.uid()
    )
  );

-- Practitioner recipients can view their notifications
CREATE POLICY "Practitioner recipients view own notifications"
  ON notification_log FOR SELECT
  TO authenticated
  USING (
    recipient_type = 'practitioner' AND
    recipient_id IN (
      SELECT id FROM practitioners WHERE user_id = auth.uid()
    )
  );

-- Service role manages notification log
CREATE POLICY "Service role manages notification log"
  ON notification_log FOR ALL
  TO service_role
  WITH CHECK (true);
