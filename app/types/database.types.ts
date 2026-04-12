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
      game_players: {
        Row: {
          added_by: string
          alignment_end: string | null
          alignment_start: string | null
          created_at: string | null
          ending_role_id: string | null
          game_id: string
          id: string
          is_alive: boolean | null
          is_mvp: boolean
          player_id: string
          starting_role_id: string | null
        }
        Insert: {
          added_by: string
          alignment_end?: string | null
          alignment_start?: string | null
          created_at?: string | null
          ending_role_id?: string | null
          game_id: string
          id?: string
          is_alive?: boolean | null
          is_mvp?: boolean
          player_id: string
          starting_role_id?: string | null
        }
        Update: {
          added_by?: string
          alignment_end?: string | null
          alignment_start?: string | null
          created_at?: string | null
          ending_role_id?: string | null
          game_id?: string
          id?: string
          is_alive?: boolean | null
          is_mvp?: boolean
          player_id?: string
          starting_role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_ending_role_id_fkey"
            columns: ["ending_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_starting_role_id_fkey"
            columns: ["starting_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rsvps: {
        Row: {
          created_at: string
          game_id: string
          id: string
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          profile_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_rsvps_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_rsvps_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string | null
          created_by: string
          custom_script_name: string | null
          date: string
          id: string
          mvp_player_id: string | null
          notes: string | null
          player_count: number | null
          script: string
          status: string
          storyteller_id: string | null
          winner: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          custom_script_name?: string | null
          date: string
          id?: string
          mvp_player_id?: string | null
          notes?: string | null
          player_count?: number | null
          script: string
          status?: string
          storyteller_id?: string | null
          winner?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          custom_script_name?: string | null
          date?: string
          id?: string
          mvp_player_id?: string | null
          notes?: string | null
          player_count?: number | null
          script?: string
          status?: string
          storyteller_id?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_mvp_player_id_fkey"
            columns: ["mvp_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_votes: {
        Row: {
          candidate_id: string
          created_at: string | null
          game_id: string
          id: string
          voter_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          game_id: string
          id?: string
          voter_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          game_id?: string
          id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_manual: boolean
          nickname: string
          role: string
          telegram_id: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_manual?: boolean
          nickname: string
          role?: string
          telegram_id?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_manual?: boolean
          nickname?: string
          role?: string
          telegram_id?: number | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description_en: string
          description_ua: string
          edition: string
          id: string
          image_url: string | null
          meta: Json | null
          name_en: string
          name_ua: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description_en: string
          description_ua: string
          edition: string
          id: string
          image_url?: string | null
          meta?: Json | null
          name_en: string
          name_ua: string
          type: string
        }
        Update: {
          created_at?: string | null
          description_en?: string
          description_ua?: string
          edition?: string
          id?: string
          image_url?: string | null
          meta?: Json | null
          name_en?: string
          name_ua?: string
          type?: string
        }
        Relationships: []
      }
      telegram_link_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_link_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_home_stats: { Args: never; Returns: Json }
      get_player_leaderboard: {
        Args: { result_limit?: number }
        Returns: {
          avatar_url: string
          created_at: string
          evil_games: number
          games_played: number
          good_games: number
          id: string
          is_manual: boolean
          mvp_count: number
          nickname: string
          points: number
          role: string
          win_streak: number
          wins: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      link_manual_profile: {
        Args: { auth_id: string; manual_id: string }
        Returns: undefined
      }
      transfer_player_history: {
        Args: { from_id: string; to_id: string }
        Returns: undefined
      }
      unlink_profile: {
        Args: { auth_id: string; manual_nickname: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
