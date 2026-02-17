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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          priority: string
          created_by: string
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: string
          priority?: string
          created_by: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          priority?: string
          created_by?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_views: {
        Row: {
          id: string
          announcement_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          announcement_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          announcement_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_views_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reason: string
          requested_days: string[]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reason: string
          requested_days: string[]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reason?: string
          requested_days?: string[]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      noc_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reason: string
          requested_days: string[]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reason: string
          requested_days: string[]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reason?: string
          requested_days?: string[]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          discord_id: string | null
          facebook_id: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          discord_id?: string | null
          facebook_id?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          discord_id?: string | null
          facebook_id?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          activity_type: string
          created_at: string | null
          created_by: string | null
          discord_server_link: string | null
          entry_fee: string | null
          hoster_name: string | null
          id: string
          location: string | null
          match_day: string | null
          name: string
          notes: string | null
          participation_status: string | null
          price_pool: string | null
          roster_players: string | null
          start_date: string
          start_time: string | null
          tournament_link: string | null
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          discord_server_link?: string | null
          entry_fee?: string | null
          hoster_name?: string | null
          id?: string
          location?: string | null
          match_day?: string | null
          name: string
          notes?: string | null
          participation_status?: string | null
          price_pool?: string | null
          roster_players?: string | null
          start_date: string
          start_time?: string | null
          tournament_link?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          discord_server_link?: string | null
          entry_fee?: string | null
          hoster_name?: string | null
          id?: string
          location?: string | null
          match_day?: string | null
          name?: string
          notes?: string | null
          participation_status?: string | null
          price_pool?: string | null
          roster_players?: string | null
          start_date?: string
          start_time?: string | null
          tournament_link?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      update_logs: {
        Row: {
          changes: Json
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
          title: string
          version: string
        }
        Insert: {
          changes?: Json
          created_at?: string
          created_by?: string | null
          date?: string
          description: string
          id?: string
          title: string
          version: string
        }
        Update: {
          changes?: Json
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          report_type: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          report_type: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          report_type?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      valorant_profiles: {
        Row: {
          created_at: string | null
          id: string
          player_data: Json | null
          riot_name: string
          riot_tag: string
          status: string | null
          tracker_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          player_data?: Json | null
          riot_name: string
          riot_tag: string
          status?: string | null
          tracker_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          player_data?: Json | null
          riot_name?: string
          riot_tag?: string
          status?: string | null
          tracker_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      alter_table_set_replica_identity_full: {
        Args: { table_name: string }
        Returns: undefined
      }
      get_announcement_view_counts: {
        Args: Record<string, never>
        Returns: {
          announcement_id: string
          view_count: number
        }[]
      }
      get_user_emails: {
        Args: never
        Returns: {
          email: string
          id: string
        }[]
      }
      mark_absent_users: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "kr_admin" | "kr_manager" | "kr_member"
      noc_status: "pending" | "approved" | "rejected"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["kr_admin", "kr_manager", "kr_member"],
      noc_status: ["pending", "approved", "rejected"],
    },
  },
} as const
