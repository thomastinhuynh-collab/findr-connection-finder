export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          beta_open: boolean
          gamification_enabled: boolean
          id: boolean
          label_flow_enabled: boolean
          subcategories_browse_enabled: boolean
          subcategories_post_enabled: boolean
          updated_at: string
          waitlist_invite_enabled: boolean
        }
        Insert: {
          beta_open?: boolean
          gamification_enabled?: boolean
          id?: boolean
          label_flow_enabled?: boolean
          subcategories_browse_enabled?: boolean
          subcategories_post_enabled?: boolean
          updated_at?: string
          waitlist_invite_enabled?: boolean
        }
        Update: {
          beta_open?: boolean
          gamification_enabled?: boolean
          id?: boolean
          label_flow_enabled?: boolean
          subcategories_browse_enabled?: boolean
          subcategories_post_enabled?: boolean
          updated_at?: string
          waitlist_invite_enabled?: boolean
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          comment: string | null
          created_at: string
          from_user_id: string
          id: string
          rating: number
          search_id: string | null
          to_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          rating: number
          search_id?: string | null
          to_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          rating?: number
          search_id?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          search_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          search_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          search_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      findr_debits: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          findr_id: string
          id: string
          reason: string
          reservation_id: string | null
          resolved_at: string | null
          status: string
          stripe_dispute_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          findr_id: string
          id?: string
          reason?: string
          reservation_id?: string | null
          resolved_at?: string | null
          status?: string
          stripe_dispute_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          findr_id?: string
          id?: string
          reason?: string
          reservation_id?: string | null
          resolved_at?: string | null
          status?: string
          stripe_dispute_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "findr_debits_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_alerts: {
        Row: {
          created_at: string
          id: string
          keyword: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reports: {
        Row: {
          comment: string | null
          context_snapshot: Json
          created_at: string
          handled_at: string | null
          handled_by: string | null
          id: string
          message_id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          comment?: string | null
          context_snapshot?: Json
          created_at?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          comment?: string | null
          context_snapshot?: Json
          created_at?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          email_notified_at: string | null
          hidden_at: string | null
          hidden_reason: string | null
          id: string
          images: string[] | null
          is_read: boolean | null
          receiver_id: string
          search_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          email_notified_at?: string | null
          hidden_at?: string | null
          hidden_reason?: string | null
          id?: string
          images?: string[] | null
          is_read?: boolean | null
          receiver_id: string
          search_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          email_notified_at?: string | null
          hidden_at?: string | null
          hidden_reason?: string | null
          id?: string
          images?: string[] | null
          is_read?: boolean | null
          receiver_id?: string
          search_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          is_findr: boolean | null
          is_premium: boolean | null
          level: number | null
          negative_balance: number
          notify_message_emails: boolean
          payout_hold: boolean
          preferred_relay_point: Json | null
          ship_from_city: string | null
          ship_from_country: string
          ship_from_first_name: string | null
          ship_from_last_name: string | null
          ship_from_postal_code: string | null
          ship_from_street: string | null
          ship_from_updated_at: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          updated_at: string
          user_id: string
          xp_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_findr?: boolean | null
          is_premium?: boolean | null
          level?: number | null
          negative_balance?: number
          notify_message_emails?: boolean
          payout_hold?: boolean
          preferred_relay_point?: Json | null
          ship_from_city?: string | null
          ship_from_country?: string
          ship_from_first_name?: string | null
          ship_from_last_name?: string | null
          ship_from_postal_code?: string | null
          ship_from_street?: string | null
          ship_from_updated_at?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          user_id: string
          xp_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_findr?: boolean | null
          is_premium?: boolean | null
          level?: number | null
          negative_balance?: number
          notify_message_emails?: boolean
          payout_hold?: boolean
          preferred_relay_point?: Json | null
          ship_from_city?: string | null
          ship_from_country?: string
          ship_from_first_name?: string | null
          ship_from_last_name?: string | null
          ship_from_postal_code?: string | null
          ship_from_street?: string | null
          ship_from_updated_at?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          user_id?: string
          xp_points?: number | null
        }
        Relationships: []
      }
      proposal_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          proposal_id: string
          source_hash: string
          target_lang: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          proposal_id: string
          source_hash: string
          target_lang: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          proposal_id?: string
          source_hash?: string
          target_lang?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_translations_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          created_at: string
          description: string | null
          findr_id: string
          id: string
          image_urls: string[] | null
          object_size: string | null
          parcel_weight_kg: number | null
          product_link: string | null
          proposed_price: number
          search_id: string
          source_lang: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          findr_id: string
          id?: string
          image_urls?: string[] | null
          object_size?: string | null
          parcel_weight_kg?: number | null
          product_link?: string | null
          proposed_price: number
          search_id: string
          source_lang?: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          findr_id?: string
          id?: string
          image_urls?: string[] | null
          object_size?: string | null
          parcel_weight_kg?: number | null
          product_link?: string | null
          proposed_price?: number
          search_id?: string
          source_lang?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          accepted_at: string | null
          approved_duration_days: number | null
          buyr_fee: number | null
          buyr_id: string
          carrier: string | null
          created_at: string
          delivered_at: string | null
          delivery_address: Json | null
          delivery_relay_point: Json | null
          delivery_type: string | null
          dispute_description: string | null
          dispute_open: boolean
          dispute_opened_at: string | null
          dispute_photo_url: string | null
          dispute_reason: string | null
          dispute_resolution_notes: string | null
          dispute_resolution_type: string | null
          dispute_resolved_at: string | null
          dispute_status: string | null
          dropoff_declared_at: string | null
          expired_without_proposal: boolean
          expires_at: string | null
          findr_fee: number | null
          findr_id: string
          findr_payout_amount: number | null
          id: string
          justification: string
          label_carrier: string | null
          label_deadline_at: string | null
          label_path: string | null
          label_provided_at: string | null
          label_rejected_at: string | null
          label_rejection_count: number
          label_reminder_24h_at: string | null
          label_reminder_48h_at: string | null
          label_tracking_number: string | null
          lost_notified_at: string | null
          object_price: number | null
          payment_status: string | null
          proposal_id: string | null
          renewal_count: number
          renewal_requested: boolean
          requested_duration_days: number
          scan_reminder_2d_at: string | null
          scan_reminder_5d_at: string | null
          search_id: string
          ship_from: Json | null
          shipped_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          total_buyr_amount: number | null
          tracking_carrier_key: string | null
          tracking_checked_at: string | null
          tracking_first_event_at: string | null
          tracking_last_attempt_at: string | null
          tracking_number: string | null
          tracking_number_key: string | null
          tracking_recognized: boolean
          tracking_review_notified_at: string | null
          tracking_status: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          approved_duration_days?: number | null
          buyr_fee?: number | null
          buyr_id: string
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_address?: Json | null
          delivery_relay_point?: Json | null
          delivery_type?: string | null
          dispute_description?: string | null
          dispute_open?: boolean
          dispute_opened_at?: string | null
          dispute_photo_url?: string | null
          dispute_reason?: string | null
          dispute_resolution_notes?: string | null
          dispute_resolution_type?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          dropoff_declared_at?: string | null
          expired_without_proposal?: boolean
          expires_at?: string | null
          findr_fee?: number | null
          findr_id: string
          findr_payout_amount?: number | null
          id?: string
          justification: string
          label_carrier?: string | null
          label_deadline_at?: string | null
          label_path?: string | null
          label_provided_at?: string | null
          label_rejected_at?: string | null
          label_rejection_count?: number
          label_reminder_24h_at?: string | null
          label_reminder_48h_at?: string | null
          label_tracking_number?: string | null
          lost_notified_at?: string | null
          object_price?: number | null
          payment_status?: string | null
          proposal_id?: string | null
          renewal_count?: number
          renewal_requested?: boolean
          requested_duration_days?: number
          scan_reminder_2d_at?: string | null
          scan_reminder_5d_at?: string | null
          search_id: string
          ship_from?: Json | null
          shipped_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_buyr_amount?: number | null
          tracking_carrier_key?: string | null
          tracking_checked_at?: string | null
          tracking_first_event_at?: string | null
          tracking_last_attempt_at?: string | null
          tracking_number?: string | null
          tracking_number_key?: string | null
          tracking_recognized?: boolean
          tracking_review_notified_at?: string | null
          tracking_status?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          approved_duration_days?: number | null
          buyr_fee?: number | null
          buyr_id?: string
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_address?: Json | null
          delivery_relay_point?: Json | null
          delivery_type?: string | null
          dispute_description?: string | null
          dispute_open?: boolean
          dispute_opened_at?: string | null
          dispute_photo_url?: string | null
          dispute_reason?: string | null
          dispute_resolution_notes?: string | null
          dispute_resolution_type?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          dropoff_declared_at?: string | null
          expired_without_proposal?: boolean
          expires_at?: string | null
          findr_fee?: number | null
          findr_id?: string
          findr_payout_amount?: number | null
          id?: string
          justification?: string
          label_carrier?: string | null
          label_deadline_at?: string | null
          label_path?: string | null
          label_provided_at?: string | null
          label_rejected_at?: string | null
          label_rejection_count?: number
          label_reminder_24h_at?: string | null
          label_reminder_48h_at?: string | null
          label_tracking_number?: string | null
          lost_notified_at?: string | null
          object_price?: number | null
          payment_status?: string | null
          proposal_id?: string | null
          renewal_count?: number
          renewal_requested?: boolean
          requested_duration_days?: number
          scan_reminder_2d_at?: string | null
          scan_reminder_5d_at?: string | null
          search_id?: string
          ship_from?: Json | null
          shipped_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_buyr_amount?: number | null
          tracking_carrier_key?: string | null
          tracking_checked_at?: string | null
          tracking_first_event_at?: string | null
          tracking_last_attempt_at?: string | null
          tracking_number?: string | null
          tracking_number_key?: string | null
          tracking_recognized?: boolean
          tracking_review_notified_at?: string | null
          tracking_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      search_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          search_id: string
          source_hash: string
          target_lang: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          search_id: string
          source_hash: string
          target_lang: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          search_id?: string
          source_hash?: string
          target_lang?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_translations_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      searches: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_featured: boolean | null
          source_lang: string
          status: string | null
          subcategory: string | null
          title: string
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_featured?: boolean | null
          source_lang?: string
          status?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_featured?: boolean | null
          source_lang?: string
          status?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shipping_rates: {
        Row: {
          carrier: string
          id: string
          max_weight_kg: number
          mode: string
          price_eur: number
          updated_at: string
        }
        Insert: {
          carrier: string
          id?: string
          max_weight_kg: number
          mode: string
          price_eur: number
          updated_at?: string
        }
        Update: {
          carrier?: string
          id?: string
          max_weight_kg?: number
          mode?: string
          price_eur?: number
          updated_at?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          created_at: string
          description: string
          id: string
          is_test: boolean
          location: string | null
          occurred_at: string
          reservation_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_test?: boolean
          location?: string | null
          occurred_at: string
          reservation_id: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_test?: boolean
          location?: string | null
          occurred_at?: string
          reservation_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          findr_id: string
          id: string
          reservation_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          findr_id: string
          id?: string
          reservation_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          findr_id?: string
          id?: string
          reservation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          confirm_sent_at: string | null
          confirm_token: string | null
          confirmed_at: string | null
          consent_given: boolean | null
          created_at: string
          email: string
          email_normalized: string | null
          first_name: string | null
          id: string
          role: string | null
          source: string
        }
        Insert: {
          confirm_sent_at?: string | null
          confirm_token?: string | null
          confirmed_at?: string | null
          consent_given?: boolean | null
          created_at?: string
          email: string
          email_normalized?: string | null
          first_name?: string | null
          id?: string
          role?: string | null
          source?: string
        }
        Update: {
          confirm_sent_at?: string | null
          confirm_token?: string | null
          confirmed_at?: string | null
          consent_given?: boolean | null
          created_at?: string
          email?: string
          email_normalized?: string | null
          first_name?: string | null
          id?: string
          role?: string | null
          source?: string
        }
        Relationships: []
      }
      waitlist_attempts: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      waitlist_invites: {
        Row: {
          invited_at: string
          user_id: string
        }
        Insert: {
          invited_at?: string
          user_id: string
        }
        Update: {
          invited_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist_welcome_emails: {
        Row: {
          email: string
          id: string
          sent_at: string
          waitlist_id: string | null
        }
        Insert: {
          email: string
          id?: string
          sent_at?: string
          waitlist_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          sent_at?: string
          waitlist_id?: string | null
        }
        Relationships: []
      }
      webhook_secrets: {
        Row: {
          created_at: string
          name: string
          secret: string
        }
        Insert: {
          created_at?: string
          name: string
          secret: string
        }
        Update: {
          created_at?: string
          name?: string
          secret?: string
        }
        Relationships: []
      }
      welcome_emails_sent: {
        Row: {
          sent_at: string
          user_id: string
        }
        Insert: {
          sent_at?: string
          user_id: string
        }
        Update: {
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_negative_balance_profiles: {
        Args: { _limit?: number; _offset?: number }
        Returns: {
          full_name: string
          negative_balance: number
          payout_hold: boolean
          user_id: string
        }[]
      }
      cleanup_message_email_markers:
        | { Args: { _at?: string }; Returns: number }
        | { Args: { _at: string; _recipient: string }; Returns: number }
      create_notification: {
        Args: {
          _link?: string
          _message?: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      exchange_filter_counts: {
        Args: never
        Returns: {
          filter: string
          total: number
        }[]
      }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          is_findr: boolean | null
          is_premium: boolean | null
          level: number | null
          negative_balance: number
          notify_message_emails: boolean
          payout_hold: boolean
          preferred_relay_point: Json | null
          ship_from_city: string | null
          ship_from_country: string
          ship_from_first_name: string | null
          ship_from_last_name: string | null
          ship_from_postal_code: string | null
          ship_from_street: string | null
          ship_from_updated_at: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          updated_at: string
          user_id: string
          xp_points: number | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_waitlist_count: { Args: never; Returns: number }
      handle_message_report: {
        Args: { _action: string; _report_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hide_message: {
        Args: { _message_id: string; _reason: string }
        Returns: undefined
      }
      list_my_exchanges: {
        Args: {
          _before?: string
          _before_unread?: boolean
          _filter?: string
          _limit?: number
        }
        Returns: {
          amount: number
          expires_at: string
          kind: string
          last_activity_at: string
          last_message_at: string
          last_message_preview: string
          needs_action: boolean
          partner_avatar_url: string
          partner_id: string
          partner_name: string
          partner_role: string
          search_id: string
          search_title: string
          state: string
          unread_count: number
        }[]
      }
      message_digest_recipients: {
        Args: { _after?: string; _at?: string }
        Returns: string[]
      }
      message_digest_snapshot: {
        Args: { _at?: string; _recipient: string }
        Returns: Json
      }
      message_email_rollout_at: { Args: never; Returns: string }
      purge_reservation_ship_from: { Args: never; Returns: number }
      report_message: {
        Args: { _comment?: string; _message_id: string; _reason: string }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      tracking_carrier_key: { Args: { value: string }; Returns: string }
      unread_exchanges_count: { Args: never; Returns: number }
      update_message_email_preference: {
        Args: { _enabled: boolean }
        Returns: boolean
      }
      update_ship_from: {
        Args: {
          _city: string
          _country?: string
          _first_name: string
          _last_name: string
          _postal_code: string
          _street: string
        }
        Returns: undefined
      }
      withdraw_proposal: { Args: { _proposal_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
