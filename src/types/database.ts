import type { GenericRelationship } from '@supabase/supabase-js'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      publications: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          from_name: string
          from_email: string
          reply_to_email: string | null
          email_template: string | null
          web_template: string | null
          brand: Json
          default_footer_id: string | null
          is_public: boolean
          is_archived: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          from_name: string
          from_email: string
          reply_to_email?: string | null
          email_template?: string | null
          web_template?: string | null
          brand?: Json
          default_footer_id?: string | null
          is_public?: boolean
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          from_name?: string
          from_email?: string
          reply_to_email?: string | null
          email_template?: string | null
          web_template?: string | null
          brand?: Json
          default_footer_id?: string | null
          is_public?: boolean
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      publication_admins: {
        Row: {
          id: string
          publication_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          publication_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          publication_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          publication_id: string
          slug: string
          subject: string
          preheader: string | null
          status: 'draft' | 'published' | 'sent' | 'scheduled'
          footer_override_id: string | null
          published_at: string | null
          sent_at: string | null
          scheduled_for: string | null
          send_count: number
          open_count: number
          click_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          publication_id: string
          slug: string
          subject: string
          preheader?: string | null
          status?: 'draft' | 'published' | 'sent' | 'scheduled'
          footer_override_id?: string | null
          published_at?: string | null
          sent_at?: string | null
          scheduled_for?: string | null
          send_count?: number
          open_count?: number
          click_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          publication_id?: string
          slug?: string
          subject?: string
          preheader?: string | null
          status?: 'draft' | 'published' | 'sent' | 'scheduled'
          footer_override_id?: string | null
          published_at?: string | null
          sent_at?: string | null
          scheduled_for?: string | null
          send_count?: number
          open_count?: number
          click_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      blocks: {
        Row: {
          id: string
          issue_id: string
          type: 'story' | 'promo' | 'text' | 'divider' | 'image' | 'footer'
          sort_order: number
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          type: 'story' | 'promo' | 'text' | 'divider' | 'image' | 'footer'
          sort_order: number
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          type?: 'story' | 'promo' | 'text' | 'divider' | 'image' | 'footer'
          sort_order?: number
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscribers: {
        Row: {
          id: string
          publication_id: string
          email: string
          status: 'pending' | 'active' | 'unsubscribed' | 'bounced' | 'complained'
          confirmation_token: string
          unsubscribe_token: string
          confirmed_at: string | null
          unsubscribed_at: string | null
          bounced_at: string | null
          complained_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          publication_id: string
          email: string
          status?: 'pending' | 'active' | 'unsubscribed' | 'bounced' | 'complained'
          confirmation_token?: string
          unsubscribe_token?: string
          confirmed_at?: string | null
          unsubscribed_at?: string | null
          bounced_at?: string | null
          complained_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          publication_id?: string
          email?: string
          status?: 'pending' | 'active' | 'unsubscribed' | 'bounced' | 'complained'
          confirmation_token?: string
          unsubscribe_token?: string
          confirmed_at?: string | null
          unsubscribed_at?: string | null
          bounced_at?: string | null
          complained_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      send_jobs: {
        Row: {
          id: string
          publication_id: string
          issue_id: string
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          total_recipients: number
          sent_count: number
          failed_count: number
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          publication_id: string
          issue_id: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          publication_id?: string
          issue_id?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      send_messages: {
        Row: {
          id: string
          send_job_id: string
          subscriber_id: string
          issue_id: string
          resend_message_id: string | null
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained'
          error_message: string | null
          sent_at: string | null
          delivered_at: string | null
          opened_at: string | null
          clicked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          send_job_id: string
          subscriber_id: string
          issue_id: string
          resend_message_id?: string | null
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained'
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          send_job_id?: string
          subscriber_id?: string
          issue_id?: string
          resend_message_id?: string | null
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained'
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      send_events: {
        Row: {
          id: string
          subscriber_id: string | null
          issue_id: string | null
          send_message_id: string | null
          type: string
          payload: Json
          resend_event_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscriber_id?: string | null
          issue_id?: string | null
          send_message_id?: string | null
          type: string
          payload?: Json
          resend_event_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscriber_id?: string | null
          issue_id?: string | null
          send_message_id?: string | null
          type?: string
          payload?: Json
          resend_event_id?: string | null
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          identifier: string
          endpoint: string
          count: number
          window_start: string
          created_at: string
        }
        Insert: {
          id?: string
          identifier: string
          endpoint: string
          count?: number
          window_start?: string
          created_at?: string
        }
        Update: {
          id?: string
          identifier?: string
          endpoint?: string
          count?: number
          window_start?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          publication_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          changes: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          publication_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          publication_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      default_footers: {
        Row: {
          id: string
          publication_id: string
          name: string
          content: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          publication_id: string
          name: string
          content?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          publication_id?: string
          name?: string
          content?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      publication_subscriber_stats: {
        Row: {
          publication_id: string
          active_count: number
          pending_count: number
          unsubscribed_count: number
          bounced_count: number
          complained_count: number
          total_count: number
        }
      }
      issue_stats: {
        Row: {
          issue_id: string
          publication_id: string
          subject: string
          sent_at: string | null
          total_recipients: number | null
          sent_count: number | null
          failed_count: number | null
          unique_opens: number
          unique_clicks: number
          open_rate: number
          click_rate: number
        }
      }
    }
    Functions: {
      is_publication_admin: {
        Args: { pub_id: string; usr_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type TablesWithRelationships<T extends Record<string, { Row: unknown; Insert: unknown; Update: unknown }>> = {
  [K in keyof T]: T[K] & { Relationships: GenericRelationship[] }
}

type ViewsWithRelationships<T extends Record<string, { Row: unknown }>> = {
  [K in keyof T]: T[K] & { Relationships: GenericRelationship[] }
}

export type DatabaseWithRelationships = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables' | 'Views'> & {
    Tables: TablesWithRelationships<Database['public']['Tables']>
    Views: ViewsWithRelationships<Database['public']['Views']>
  }
}
