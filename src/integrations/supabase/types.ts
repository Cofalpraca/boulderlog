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
      boulder_logs: {
        Row: {
          count: number
          created_at: string
          grade_raw: string
          grade_type: Database["public"]["Enums"]["grading_type"]
          id: string
          notes: string | null
          session_id: string
          tags: string[] | null
        }
        Insert: {
          count?: number
          created_at?: string
          grade_raw: string
          grade_type: Database["public"]["Enums"]["grading_type"]
          id?: string
          notes?: string | null
          session_id: string
          tags?: string[] | null
        }
        Update: {
          count?: number
          created_at?: string
          grade_raw?: string
          grade_type?: Database["public"]["Enums"]["grading_type"]
          id?: string
          notes?: string | null
          session_id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "boulder_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          description: string | null
          exercise_type: string | null
          id: string
          is_system: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          description?: string | null
          exercise_type?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          description?: string | null
          exercise_type?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      gym_difficulty_profiles: {
        Row: {
          difficulty_bias: number | null
          gym_id: string
          id: string
          samples_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          difficulty_bias?: number | null
          gym_id: string
          id?: string
          samples_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          difficulty_bias?: number | null
          gym_id?: string
          id?: string
          samples_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_difficulty_profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_grade_mappings: {
        Row: {
          approx_font_max: string | null
          approx_font_min: string | null
          approx_v_max: string | null
          approx_v_min: string | null
          color_hex: string | null
          created_at: string
          gym_id: string
          id: string
          label: string
          order_index: number
        }
        Insert: {
          approx_font_max?: string | null
          approx_font_min?: string | null
          approx_v_max?: string | null
          approx_v_min?: string | null
          color_hex?: string | null
          created_at?: string
          gym_id: string
          id?: string
          label: string
          order_index: number
        }
        Update: {
          approx_font_max?: string | null
          approx_font_min?: string | null
          approx_v_max?: string | null
          approx_v_min?: string | null
          color_hex?: string | null
          created_at?: string
          gym_id?: string
          id?: string
          label?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "gym_grade_mappings_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          city: string | null
          created_at: string
          grading_type: Database["public"]["Enums"]["grading_type"]
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          grading_type: Database["public"]["Enums"]["grading_type"]
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          grading_type?: Database["public"]["Enums"]["grading_type"]
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planned_sessions: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          notes: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          template_id: string | null
          weekly_plan_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          notes?: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          template_id?: string | null
          weekly_plan_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          notes?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          template_id?: string | null
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_sessions_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          preferred_grade: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          preferred_grade?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_grade?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      protocols: {
        Row: {
          created_at: string
          id: string
          is_system: boolean | null
          name: string
          params_json: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          name: string
          params_json?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          name?: string
          params_json?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_gyms: {
        Row: {
          gym_id: string
          id: string
          session_id: string
        }
        Insert: {
          gym_id: string
          id?: string
          session_id: string
        }
        Update: {
          gym_id?: string
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_gyms_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_gyms_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_items: {
        Row: {
          created_at: string
          exercise_id: string | null
          id: string
          order_index: number
          protocol_id: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          order_index?: number
          protocol_id?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          order_index?: number
          protocol_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_items_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sets: {
        Row: {
          created_at: string
          duration_sec: number | null
          id: string
          reps: number | null
          rpe: number | null
          session_item_id: string
          set_no: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          duration_sec?: number | null
          id?: string
          reps?: number | null
          rpe?: number | null
          session_item_id: string
          set_no: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          duration_sec?: number | null
          id?: string
          reps?: number | null
          rpe?: number | null
          session_item_id?: string
          set_no?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_sets_session_item_id_fkey"
            columns: ["session_item_id"]
            isOneToOne: false
            referencedRelation: "session_items"
            referencedColumns: ["id"]
          },
        ]
      }
      session_zone_summaries: {
        Row: {
          comfort_pct: number | null
          created_at: string
          growth_pct: number | null
          id: string
          limit_pct: number | null
          session_id: string
        }
        Insert: {
          comfort_pct?: number | null
          created_at?: string
          growth_pct?: number | null
          id?: string
          limit_pct?: number | null
          session_id: string
        }
        Update: {
          comfort_pct?: number | null
          created_at?: string
          growth_pct?: number | null
          id?: string
          limit_pct?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_zone_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          date_end: string | null
          date_start: string
          failed_attempts: number | null
          finger_fatigue: number | null
          flash_count: number | null
          id: string
          notes: string | null
          offline_id: string | null
          pain_area: string | null
          pain_flag: boolean | null
          pain_level: number | null
          pain_note: string | null
          rpe: number | null
          session_type: Database["public"]["Enums"]["session_type"]
          status: string | null
          subtype: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_end?: string | null
          date_start?: string
          failed_attempts?: number | null
          finger_fatigue?: number | null
          flash_count?: number | null
          id?: string
          notes?: string | null
          offline_id?: string | null
          pain_area?: string | null
          pain_flag?: boolean | null
          pain_level?: number | null
          pain_note?: string | null
          rpe?: number | null
          session_type: Database["public"]["Enums"]["session_type"]
          status?: string | null
          subtype?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_end?: string | null
          date_start?: string
          failed_attempts?: number | null
          finger_fatigue?: number | null
          flash_count?: number | null
          id?: string
          notes?: string | null
          offline_id?: string | null
          pain_area?: string | null
          pain_flag?: boolean | null
          pain_level?: number | null
          pain_note?: string | null
          rpe?: number | null
          session_type?: Database["public"]["Enums"]["session_type"]
          status?: string | null
          subtype?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_items: {
        Row: {
          created_at: string
          exercise_id: string | null
          id: string
          item_type: string
          order_index: number
          protocol_id: string | null
          template_id: string
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          item_type: string
          order_index?: number
          protocol_id?: string | null
          template_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          item_type?: string
          order_index?: number
          protocol_id?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_items_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          config_json: Json | null
          created_at: string
          id: string
          is_system: boolean | null
          name: string
          subtype: string | null
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          config_json?: Json | null
          created_at?: string
          id?: string
          is_system?: boolean | null
          name: string
          subtype?: string | null
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          config_json?: Json | null
          created_at?: string
          id?: string
          is_system?: boolean | null
          name?: string
          subtype?: string | null
          template_type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_level_cache: {
        Row: {
          boulders_used: number | null
          computed_at: string | null
          created_at: string
          id: string
          level_font_grade: string | null
          level_score: number | null
          level_v_grade: string | null
          max_font_grade: string | null
          max_score: number | null
          max_v_grade: string | null
          total_boulders: number | null
          updated_at: string
          user_id: string
          window_days: number | null
        }
        Insert: {
          boulders_used?: number | null
          computed_at?: string | null
          created_at?: string
          id?: string
          level_font_grade?: string | null
          level_score?: number | null
          level_v_grade?: string | null
          max_font_grade?: string | null
          max_score?: number | null
          max_v_grade?: string | null
          total_boulders?: number | null
          updated_at?: string
          user_id: string
          window_days?: number | null
        }
        Update: {
          boulders_used?: number | null
          computed_at?: string | null
          created_at?: string
          id?: string
          level_font_grade?: string | null
          level_score?: number | null
          level_v_grade?: string | null
          max_font_grade?: string | null
          max_score?: number | null
          max_v_grade?: string | null
          total_boulders?: number | null
          updated_at?: string
          user_id?: string
          window_days?: number | null
        }
        Relationships: []
      }
      weekly_aggregates: {
        Row: {
          created_at: string
          has_pain: boolean | null
          id: string
          max_grade_raw: string | null
          off_wall_sessions: number | null
          on_wall_sessions: number | null
          total_boulders: number | null
          total_sets: number | null
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          has_pain?: boolean | null
          id?: string
          max_grade_raw?: string | null
          off_wall_sessions?: number | null
          on_wall_sessions?: number | null
          total_boulders?: number | null
          total_sets?: number | null
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          has_pain?: boolean | null
          id?: string
          max_grade_raw?: string | null
          off_wall_sessions?: number | null
          on_wall_sessions?: number | null
          total_boulders?: number | null
          total_sets?: number | null
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_completed_session: {
        Args: { p_session: Json; p_items?: Json; p_logs?: Json; p_offline_id?: string }
        Returns: string
      }
    }
    Enums: {
      exercise_category: "fingers" | "strength" | "core" | "mobility"
      grading_type: "font" | "v_scale" | "colors" | "numeric"
      session_status: "draft" | "active" | "completed" | "discarded"
      session_type: "on_wall" | "off_wall"
      template_type: "on_wall" | "off_wall"
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
  public: {
    Enums: {
      exercise_category: ["fingers", "strength", "core", "mobility"],
      grading_type: ["font", "v_scale", "colors", "numeric"],
      session_status: ["draft", "active", "completed", "discarded"],
      session_type: ["on_wall", "off_wall"],
      template_type: ["on_wall", "off_wall"],
    },
  },
} as const
