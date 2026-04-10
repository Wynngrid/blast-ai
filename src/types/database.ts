export type UserRole = 'enterprise' | 'practitioner' | 'admin'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type PractitionerTier = 'rising' | 'expert' | 'master'

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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      application_status: ApplicationStatus
      practitioner_tier: PractitionerTier
    }
    CompositeTypes: Record<string, never>
  }
}
