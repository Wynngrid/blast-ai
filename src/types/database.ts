export type UserRole = 'enterprise' | 'practitioner' | 'admin'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type PractitionerTier = 'rising' | 'expert' | 'master'

// Phase 3: Coin and booking types
export type CoinTransactionType = 'purchase' | 'spend' | 'expire' | 'refund'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
export type EarningsStatus = 'pending' | 'available' | 'requested' | 'paid'
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'completed'
export type NotificationRecipientType = 'enterprise' | 'practitioner'
export type CancelledByType = 'enterprise' | 'practitioner' | 'admin'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      enterprises: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_size: string | null
          industry: string | null
          billing_email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_size?: string | null
          industry?: string | null
          billing_email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_size?: string | null
          industry?: string | null
          billing_email?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'enterprises_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      practitioners: {
        Row: {
          id: string
          user_id: string
          full_name: string
          bio: string | null
          specializations: string[] | null
          industries: string[] | null
          tier: PractitionerTier | null
          hourly_rate: number | null
          tools: string[] | null
          portfolio: Record<string, unknown> | null
          application_status: ApplicationStatus
          approved_at: string | null
          rejected_at: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          bio?: string | null
          specializations?: string[] | null
          industries?: string[] | null
          tier?: PractitionerTier | null
          hourly_rate?: number | null
          tools?: string[] | null
          portfolio?: Record<string, unknown> | null
          application_status?: ApplicationStatus
          approved_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          bio?: string | null
          specializations?: string[] | null
          industries?: string[] | null
          tier?: PractitionerTier | null
          hourly_rate?: number | null
          tools?: string[] | null
          portfolio?: Record<string, unknown> | null
          application_status?: ApplicationStatus
          approved_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'practitioners_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      availability_rules: {
        Row: {
          id: string
          practitioner_id: string
          day_of_week: number
          start_time: string
          end_time: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practitioner_id: string
          day_of_week: number
          start_time: string
          end_time: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practitioner_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'availability_rules_practitioner_id_fkey'
            columns: ['practitioner_id']
            isOneToOne: false
            referencedRelation: 'practitioners'
            referencedColumns: ['id']
          }
        ]
      }
      availability_exceptions: {
        Row: {
          id: string
          practitioner_id: string
          exception_date: string
          is_blocked: boolean
          start_time: string | null
          end_time: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          practitioner_id: string
          exception_date: string
          is_blocked?: boolean
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          practitioner_id?: string
          exception_date?: string
          is_blocked?: boolean
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'availability_exceptions_practitioner_id_fkey'
            columns: ['practitioner_id']
            isOneToOne: false
            referencedRelation: 'practitioners'
            referencedColumns: ['id']
          }
        ]
      }
      portfolio_items: {
        Row: {
          id: string
          practitioner_id: string
          url: string
          title: string | null
          description: string | null
          thumbnail_url: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          practitioner_id: string
          url: string
          title?: string | null
          description?: string | null
          thumbnail_url?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          practitioner_id?: string
          url?: string
          title?: string | null
          description?: string | null
          thumbnail_url?: string | null
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'portfolio_items_practitioner_id_fkey'
            columns: ['practitioner_id']
            isOneToOne: false
            referencedRelation: 'practitioners'
            referencedColumns: ['id']
          }
        ]
      }
      // Phase 3 Tables
      coin_transactions: {
        Row: {
          id: string
          enterprise_id: string
          type: CoinTransactionType
          amount: number
          unit_price_inr: number | null
          expires_at: string | null
          reference_id: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          enterprise_id: string
          type: CoinTransactionType
          amount: number
          unit_price_inr?: number | null
          expires_at?: string | null
          reference_id?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          enterprise_id?: string
          type?: CoinTransactionType
          amount?: number
          unit_price_inr?: number | null
          expires_at?: string | null
          reference_id?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coin_transactions_enterprise_id_fkey'
            columns: ['enterprise_id']
            isOneToOne: false
            referencedRelation: 'enterprises'
            referencedColumns: ['id']
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          enterprise_id: string
          practitioner_id: string
          session_duration: number
          scheduled_at: string
          ends_at: string
          timezone: string
          status: BookingStatus
          brief_stuck_on: string
          brief_desired_outcome: string
          brief_context: string | null
          meet_link: string | null
          calendar_event_id: string | null
          coins_spent: number
          coin_transaction_id: string | null
          cancelled_at: string | null
          cancelled_by: CancelledByType | null
          refunded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enterprise_id: string
          practitioner_id: string
          session_duration: number
          scheduled_at: string
          ends_at: string
          timezone: string
          status?: BookingStatus
          brief_stuck_on: string
          brief_desired_outcome: string
          brief_context?: string | null
          meet_link?: string | null
          calendar_event_id?: string | null
          coins_spent: number
          coin_transaction_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: CancelledByType | null
          refunded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enterprise_id?: string
          practitioner_id?: string
          session_duration?: number
          scheduled_at?: string
          ends_at?: string
          timezone?: string
          status?: BookingStatus
          brief_stuck_on?: string
          brief_desired_outcome?: string
          brief_context?: string | null
          meet_link?: string | null
          calendar_event_id?: string | null
          coins_spent?: number
          coin_transaction_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: CancelledByType | null
          refunded?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_enterprise_id_fkey'
            columns: ['enterprise_id']
            isOneToOne: false
            referencedRelation: 'enterprises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_practitioner_id_fkey'
            columns: ['practitioner_id']
            isOneToOne: false
            referencedRelation: 'practitioners'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_coin_transaction_id_fkey'
            columns: ['coin_transaction_id']
            isOneToOne: false
            referencedRelation: 'coin_transactions'
            referencedColumns: ['id']
          }
        ]
      }
      practitioner_earnings: {
        Row: {
          id: string
          practitioner_id: string
          booking_id: string
          gross_amount_inr: number
          commission_inr: number
          net_amount_inr: number
          status: EarningsStatus
          created_at: string
        }
        Insert: {
          id?: string
          practitioner_id: string
          booking_id: string
          gross_amount_inr: number
          commission_inr: number
          net_amount_inr: number
          status?: EarningsStatus
          created_at?: string
        }
        Update: {
          id?: string
          practitioner_id?: string
          booking_id?: string
          gross_amount_inr?: number
          commission_inr?: number
          net_amount_inr?: number
          status?: EarningsStatus
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'practitioner_earnings_practitioner_id_fkey'
            columns: ['practitioner_id']
            isOneToOne: false
            referencedRelation: 'practitioners'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'practitioner_earnings_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: true
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          }
        ]
      }
      payout_requests: {
        Row: {
          id: string
          practitioner_id: string
          amount_inr: number
          status: PayoutStatus
          bank_details: Record<string, unknown> | null
          admin_notes: string | null
          requested_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          practitioner_id: string
          amount_inr: number
          status?: PayoutStatus
          bank_details?: Record<string, unknown> | null
          admin_notes?: string | null
          requested_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          practitioner_id?: string
          amount_inr?: number
          status?: PayoutStatus
          bank_details?: Record<string, unknown> | null
          admin_notes?: string | null
          requested_at?: string
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'payout_requests_practitioner_id_fkey'
            columns: ['practitioner_id']
            isOneToOne: false
            referencedRelation: 'practitioners'
            referencedColumns: ['id']
          }
        ]
      }
      notification_log: {
        Row: {
          id: string
          type: string
          recipient_id: string
          recipient_type: NotificationRecipientType
          email: string
          booking_id: string | null
          sent_at: string
          resend_id: string | null
        }
        Insert: {
          id?: string
          type: string
          recipient_id: string
          recipient_type: NotificationRecipientType
          email: string
          booking_id?: string | null
          sent_at?: string
          resend_id?: string | null
        }
        Update: {
          id?: string
          type?: string
          recipient_id?: string
          recipient_type?: NotificationRecipientType
          email?: string
          booking_id?: string | null
          sent_at?: string
          resend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notification_log_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      application_status: ApplicationStatus
      practitioner_tier: PractitionerTier
      // Phase 3 enums
      coin_transaction_type: CoinTransactionType
      booking_status: BookingStatus
      earnings_status: EarningsStatus
      payout_status: PayoutStatus
      notification_recipient_type: NotificationRecipientType
    }
    CompositeTypes: Record<string, never>
  }
}
