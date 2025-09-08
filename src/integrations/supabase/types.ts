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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_prompt_debug_log: {
        Row: {
          api_response: Json
          attempt: number
          bundle_data: Json
          created_at: string
          id: string
          model: string
          page_number: number
          session_id: string
          success: boolean
          system_prompt: string
          token_limit: number
          user_id: string | null
          user_prompt: string
        }
        Insert: {
          api_response?: Json
          attempt?: number
          bundle_data?: Json
          created_at?: string
          id?: string
          model?: string
          page_number?: number
          session_id: string
          success?: boolean
          system_prompt: string
          token_limit?: number
          user_id?: string | null
          user_prompt: string
        }
        Update: {
          api_response?: Json
          attempt?: number
          bundle_data?: Json
          created_at?: string
          id?: string
          model?: string
          page_number?: number
          session_id?: string
          success?: boolean
          system_prompt?: string
          token_limit?: number
          user_id?: string | null
          user_prompt?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      character_consistency_cache: {
        Row: {
          character_data: Json
          character_key: string
          created_at: string | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          character_data: Json
          character_key: string
          created_at?: string | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          character_data?: Json
          character_key?: string
          created_at?: string | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      child_profiles: {
        Row: {
          avatar: Json | null
          birth_month: number | null
          birth_year: number | null
          created_at: string
          display_name: string
          favorite_animal: string | null
          favorite_color: string | null
          favorite_food: string | null
          grade_level: string | null
          hobbies: string | null
          id: string
          parent_user_id: string
          updated_at: string
        }
        Insert: {
          avatar?: Json | null
          birth_month?: number | null
          birth_year?: number | null
          created_at?: string
          display_name: string
          favorite_animal?: string | null
          favorite_color?: string | null
          favorite_food?: string | null
          grade_level?: string | null
          hobbies?: string | null
          id?: string
          parent_user_id: string
          updated_at?: string
        }
        Update: {
          avatar?: Json | null
          birth_month?: number | null
          birth_year?: number | null
          created_at?: string
          display_name?: string
          favorite_animal?: string | null
          favorite_color?: string | null
          favorite_food?: string | null
          grade_level?: string | null
          hobbies?: string | null
          id?: string
          parent_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string
          duration_days: number
          id: string
          max_uses: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description: string
          duration_days?: number
          id?: string
          max_uses?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string
          duration_days?: number
          id?: string
          max_uses?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          page_url: string | null
          rating: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          page_url?: string | null
          rating?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          page_url?: string | null
          rating?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          child_profile_id: string | null
          created_at: string
          details: Json
          duration_seconds: number | null
          game_type: string
          id: string
          language: string
          max_score: number
          score: number
          story_id: string | null
          story_title: string | null
          user_id: string
        }
        Insert: {
          child_profile_id?: string | null
          created_at?: string
          details?: Json
          duration_seconds?: number | null
          game_type: string
          id?: string
          language?: string
          max_score?: number
          score?: number
          story_id?: string | null
          story_title?: string | null
          user_id: string
        }
        Update: {
          child_profile_id?: string | null
          created_at?: string
          details?: Json
          duration_seconds?: number | null
          game_type?: string
          id?: string
          language?: string
          max_score?: number
          score?: number
          story_id?: string | null
          story_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_info_incidents: {
        Row: {
          child_profile_id: string | null
          context_field: string
          created_at: string
          detected_content: string
          email_notification_sent: boolean
          email_notification_status: string | null
          id: string
          ip_address: unknown | null
          parent_notified_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
          violation_type: string
        }
        Insert: {
          child_profile_id?: string | null
          context_field: string
          created_at?: string
          detected_content: string
          email_notification_sent?: boolean
          email_notification_status?: string | null
          id?: string
          ip_address?: unknown | null
          parent_notified_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
          violation_type: string
        }
        Update: {
          child_profile_id?: string | null
          context_field?: string
          created_at?: string
          detected_content?: string
          email_notification_sent?: boolean
          email_notification_status?: string | null
          id?: string
          ip_address?: unknown | null
          parent_notified_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          violation_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: Json | null
          created_at: string
          date_of_birth: string | null
          difficulty_level: string | null
          display_name: string | null
          favorite_animal: string | null
          favorite_color: string | null
          favorite_food: string | null
          grade_level: string | null
          hobbies: string | null
          id: string
          interests: string[] | null
          native_language: string | null
          reading_level: string | null
          special_request: string | null
          story_language_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: Json | null
          created_at?: string
          date_of_birth?: string | null
          difficulty_level?: string | null
          display_name?: string | null
          favorite_animal?: string | null
          favorite_color?: string | null
          favorite_food?: string | null
          grade_level?: string | null
          hobbies?: string | null
          id?: string
          interests?: string[] | null
          native_language?: string | null
          reading_level?: string | null
          special_request?: string | null
          story_language_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: Json | null
          created_at?: string
          date_of_birth?: string | null
          difficulty_level?: string | null
          display_name?: string | null
          favorite_animal?: string | null
          favorite_color?: string | null
          favorite_food?: string | null
          grade_level?: string | null
          hobbies?: string | null
          id?: string
          interests?: string[] | null
          native_language?: string | null
          reading_level?: string | null
          special_request?: string | null
          story_language_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          child_profile_id: string | null
          created_at: string
          details: Json
          id: string
          language: string
          mode: string
          score: number
          story_id: string | null
          story_signature: string | null
          story_title: string | null
          total_questions: number
          user_id: string
        }
        Insert: {
          child_profile_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          language?: string
          mode?: string
          score?: number
          story_id?: string | null
          story_signature?: string | null
          story_title?: string | null
          total_questions?: number
          user_id: string
        }
        Update: {
          child_profile_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          language?: string
          mode?: string
          score?: number
          story_id?: string | null
          story_signature?: string | null
          story_title?: string | null
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          child_profile_id: string | null
          completed_at: string | null
          comprehension_score: number | null
          created_at: string
          difficulty_rating: number | null
          id: string
          started_at: string
          story_id: string
          time_spent: number | null
          user_id: string
          words_read: number | null
        }
        Insert: {
          child_profile_id?: string | null
          completed_at?: string | null
          comprehension_score?: number | null
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          started_at?: string
          story_id: string
          time_spent?: number | null
          user_id: string
          words_read?: number | null
        }
        Update: {
          child_profile_id?: string | null
          completed_at?: string | null
          comprehension_score?: number | null
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          started_at?: string
          story_id?: string
          time_spent?: number | null
          user_id?: string
          words_read?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reading_sessions_child"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_sessions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_stories: {
        Row: {
          content: Json
          created_at: string
          difficulty: string
          estimated_reading_time: number | null
          id: string
          image_cache_metadata: Json
          is_favorite: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          user_preferences: Json | null
          word_count: number | null
        }
        Insert: {
          content: Json
          created_at?: string
          difficulty: string
          estimated_reading_time?: number | null
          id?: string
          image_cache_metadata?: Json
          is_favorite?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          user_preferences?: Json | null
          word_count?: number | null
        }
        Update: {
          content?: Json
          created_at?: string
          difficulty?: string
          estimated_reading_time?: number | null
          id?: string
          image_cache_metadata?: Json
          is_favorite?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          user_preferences?: Json | null
          word_count?: number | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          age_group: string
          author_style: string | null
          comprehension_questions: Json | null
          content: string
          created_at: string
          id: string
          image_urls: string[] | null
          page_count: number | null
          reading_level: string
          theme: string | null
          title: string
          vocabulary_words: string[] | null
          word_count: number | null
        }
        Insert: {
          age_group: string
          author_style?: string | null
          comprehension_questions?: Json | null
          content: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          page_count?: number | null
          reading_level: string
          theme?: string | null
          title: string
          vocabulary_words?: string[] | null
          word_count?: number | null
        }
        Update: {
          age_group?: string
          author_style?: string | null
          comprehension_questions?: Json | null
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          page_count?: number | null
          reading_level?: string
          theme?: string | null
          title?: string
          vocabulary_words?: string[] | null
          word_count?: number | null
        }
        Relationships: []
      }
      story_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          story_ids: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          story_ids?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          story_ids?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          discount_activated: boolean | null
          discount_activated_at: string | null
          discount_code_pending: string | null
          email: string
          id: string
          override_end: string | null
          override_premium: boolean
          override_reason: string | null
          override_set_by: string | null
          override_tier: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_activated?: boolean | null
          discount_activated_at?: string | null
          discount_code_pending?: string | null
          email: string
          id?: string
          override_end?: string | null
          override_premium?: boolean
          override_reason?: string | null
          override_set_by?: string | null
          override_tier?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_activated?: boolean | null
          discount_activated_at?: string | null
          discount_code_pending?: string | null
          email?: string
          id?: string
          override_end?: string | null
          override_premium?: boolean
          override_reason?: string | null
          override_set_by?: string | null
          override_tier?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_content_signatures: {
        Row: {
          content_signature: string
          content_type: string
          created_at: string
          id: string
          story_session_number: number
          updated_at: string
          user_identifier: string
        }
        Insert: {
          content_signature: string
          content_type?: string
          created_at?: string
          id?: string
          story_session_number?: number
          updated_at?: string
          user_identifier: string
        }
        Update: {
          content_signature?: string
          content_type?: string
          created_at?: string
          id?: string
          story_session_number?: number
          updated_at?: string
          user_identifier?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          active_child_id: string | null
          age: number | null
          avatar_skin_tone: string | null
          avatar_type: string | null
          created_at: string
          display_name: string | null
          favorite_animal: string | null
          favorite_color: string | null
          favorite_food: string | null
          grade_level: string | null
          hobbies: string | null
          id: string
          is_premium: boolean | null
          learning_goal: string | null
          native_language: string | null
          reading_preferences: Json | null
          story_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_child_id?: string | null
          age?: number | null
          avatar_skin_tone?: string | null
          avatar_type?: string | null
          created_at?: string
          display_name?: string | null
          favorite_animal?: string | null
          favorite_color?: string | null
          favorite_food?: string | null
          grade_level?: string | null
          hobbies?: string | null
          id?: string
          is_premium?: boolean | null
          learning_goal?: string | null
          native_language?: string | null
          reading_preferences?: Json | null
          story_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_child_id?: string | null
          age?: number | null
          avatar_skin_tone?: string | null
          avatar_type?: string | null
          created_at?: string
          display_name?: string | null
          favorite_animal?: string | null
          favorite_color?: string | null
          favorite_food?: string | null
          grade_level?: string | null
          hobbies?: string | null
          id?: string
          is_premium?: boolean | null
          learning_goal?: string | null
          native_language?: string | null
          reading_preferences?: Json | null
          story_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_active_child"
            columns: ["active_child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          session_token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vocabulary_progress: {
        Row: {
          definition: string | null
          first_encountered_at: string
          id: string
          last_reviewed_at: string | null
          mastery_level: number | null
          times_encountered: number | null
          user_id: string
          word: string
        }
        Insert: {
          definition?: string | null
          first_encountered_at?: string
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          times_encountered?: number | null
          user_id: string
          word: string
        }
        Update: {
          definition?: string | null
          first_encountered_at?: string
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          times_encountered?: number | null
          user_id?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      subscription_status_view: {
        Row: {
          created_at: string | null
          override_end: string | null
          override_premium: boolean | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          override_end?: string | null
          override_premium?: boolean | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          override_end?: string | null
          override_premium?: boolean | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_debug_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_security_audit_log: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; user_id_param?: string }
        Returns: undefined
      }
      purge_old_incidents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
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
  public: {
    Enums: {},
  },
} as const
