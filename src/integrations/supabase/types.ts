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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ab_events: {
        Row: {
          created_at: string
          cta: string | null
          event_type: string
          experiment: string
          id: string
          session_id: string
          user_id: string | null
          variant: string
        }
        Insert: {
          created_at?: string
          cta?: string | null
          event_type: string
          experiment: string
          id?: string
          session_id: string
          user_id?: string | null
          variant: string
        }
        Update: {
          created_at?: string
          cta?: string | null
          event_type?: string
          experiment?: string
          id?: string
          session_id?: string
          user_id?: string | null
          variant?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          gamification_enabled: boolean
          id: boolean
          updated_at: string
        }
        Insert: {
          gamification_enabled?: boolean
          id?: boolean
          updated_at?: string
        }
        Update: {
          gamification_enabled?: boolean
          id?: boolean
          updated_at?: string
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
      messages: {
        Row: {
          content: string
          created_at: string
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
          payout_hold: boolean
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
          payout_hold?: boolean
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
          payout_hold?: boolean
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          user_id?: string
          xp_points?: number | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string
          description: string | null
          findr_id: string
          id: string
          image_urls: string[] | null
          product_link: string | null
          proposed_price: number
          search_id: string
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
          product_link?: string | null
          proposed_price: number
          search_id: string
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
          product_link?: string | null
          proposed_price?: number
          search_id?: string
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
          dispute_description: string | null
          dispute_open: boolean
          dispute_opened_at: string | null
          dispute_photo_url: string | null
          dispute_reason: string | null
          dispute_resolution_notes: string | null
          dispute_resolution_type: string | null
          dispute_resolved_at: string | null
          dispute_status: string | null
          expired_without_proposal: boolean
          expires_at: string | null
          findr_fee: number | null
          findr_id: string
          findr_payout_amount: number | null
          id: string
          justification: string
          lost_notified_at: string | null
          object_price: number | null
          payment_status: string | null
          proposal_id: string | null
          renewal_count: number
          renewal_requested: boolean
          requested_duration_days: number
          search_id: string
          shipped_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          total_buyr_amount: number | null
          tracking_number: string | null
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
          dispute_description?: string | null
          dispute_open?: boolean
          dispute_opened_at?: string | null
          dispute_photo_url?: string | null
          dispute_reason?: string | null
          dispute_resolution_notes?: string | null
          dispute_resolution_type?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          expired_without_proposal?: boolean
          expires_at?: string | null
          findr_fee?: number | null
          findr_id: string
          findr_payout_amount?: number | null
          id?: string
          justification: string
          lost_notified_at?: string | null
          object_price?: number | null
          payment_status?: string | null
          proposal_id?: string | null
          renewal_count?: number
          renewal_requested?: boolean
          requested_duration_days?: number
          search_id: string
          shipped_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_buyr_amount?: number | null
          tracking_number?: string | null
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
          dispute_description?: string | null
          dispute_open?: boolean
          dispute_opened_at?: string | null
          dispute_photo_url?: string | null
          dispute_reason?: string | null
          dispute_resolution_notes?: string | null
          dispute_resolution_type?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          expired_without_proposal?: boolean
          expires_at?: string | null
          findr_fee?: number | null
          findr_id?: string
          findr_payout_amount?: number | null
          id?: string
          justification?: string
          lost_notified_at?: string | null
          object_price?: number | null
          payment_status?: string | null
          proposal_id?: string | null
          renewal_count?: number
          renewal_requested?: boolean
          requested_duration_days?: number
          search_id?: string
          shipped_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_buyr_amount?: number | null
          tracking_number?: string | null
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
          title?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
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
          consent_given: boolean | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          consent_given?: boolean | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          consent_given?: boolean | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          role?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_waitlist_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
