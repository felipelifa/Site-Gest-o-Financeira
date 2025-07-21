export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      daily_notes: {
        Row: {
          date: string | null
          id: string
          note: string | null
          user_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          emoji: string | null
          expense_type: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          emoji?: string | null
          expense_type?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          emoji?: string | null
          expense_type?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          due_date: number
          emoji: string | null
          id: string
          is_paid: boolean
          last_paid_date: string | null
          name: string
          next_due_date: string
          notes: string | null
          recurrence: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          due_date: number
          emoji?: string | null
          id?: string
          is_paid?: boolean
          last_paid_date?: string | null
          name: string
          next_due_date: string
          notes?: string | null
          recurrence?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          due_date?: number
          emoji?: string | null
          id?: string
          is_paid?: boolean
          last_paid_date?: string | null
          name?: string
          next_due_date?: string
          notes?: string | null
          recurrence?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          current_amount: number | null
          deadline: string
          emoji: string | null
          id: string
          name: string
          target_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number | null
          deadline: string
          emoji?: string | null
          id?: string
          name: string
          target_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number | null
          deadline?: string
          emoji?: string | null
          id?: string
          name?: string
          target_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      income_entries: {
        Row: {
          amount: number
          created_at: string
          emoji: string | null
          frequency: string | null
          id: string
          is_recurring: boolean | null
          name: string
          notes: string | null
          receive_date: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          emoji?: string | null
          frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          name: string
          notes?: string | null
          receive_date: string
          source_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          emoji?: string | null
          frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string
          notes?: string | null
          receive_date?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_budgets: {
        Row: {
          budget_amount: number
          created_at: string
          id: string
          month: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          budget_amount?: number
          created_at?: string
          id?: string
          month: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          budget_amount?: number
          created_at?: string
          id?: string
          month?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          email: string
          id: string
          mercadopago_preference_id: string | null
          product_name: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string | null
          email: string
          id?: string
          mercadopago_preference_id?: string | null
          product_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          email?: string
          id?: string
          mercadopago_preference_id?: string | null
          product_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          dream_steps: number | null
          email: string | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          last_activity_streak: number | null
          main_dream: string | null
          onboarding_completed: boolean | null
          subscription_status: string | null
          trial_end_date: string | null
          trial_start_date: string | null
        }
        Insert: {
          created_at?: string
          dream_steps?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          last_activity_streak?: number | null
          main_dream?: string | null
          onboarding_completed?: boolean | null
          subscription_status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
        }
        Update: {
          created_at?: string
          dream_steps?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          last_activity_streak?: number | null
          main_dream?: string | null
          onboarding_completed?: boolean | null
          subscription_status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
        }
        Relationships: []
      }
      recurring_income: {
        Row: {
          amount: number
          created_at: string
          emoji: string | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          next_receive_date: string
          notes: string | null
          receive_date: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          emoji?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          next_receive_date: string
          notes?: string | null
          receive_date: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          emoji?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          next_receive_date?: string
          notes?: string | null
          receive_date?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          is_sent: boolean
          message: string | null
          reference_id: string | null
          remind_date: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_sent?: boolean
          message?: string | null
          reference_id?: string | null
          remind_date: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_sent?: boolean
          message?: string | null
          reference_id?: string | null
          remind_date?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          auto_recurring: boolean | null
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          mercadopago_payment_id: string | null
          mercadopago_subscription_id: string | null
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          auto_recurring?: boolean | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_subscription_id?: string | null
          plan_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_recurring?: boolean | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_subscription_id?: string | null
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          progress: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_notes: {
        Row: {
          created_at: string
          expense_id: string | null
          id: string
          original_audio_url: string | null
          parsed_amount: number | null
          parsed_category: string | null
          parsed_description: string | null
          transcribed_text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expense_id?: string | null
          id?: string
          original_audio_url?: string | null
          parsed_amount?: number | null
          parsed_category?: string | null
          parsed_description?: string | null
          transcribed_text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expense_id?: string | null
          id?: string
          original_audio_url?: string | null
          parsed_amount?: number | null
          parsed_category?: string | null
          parsed_description?: string | null
          transcribed_text?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_due_date: {
        Args: { input_date: string; due_day: number; recurrence: string }
        Returns: string
      }
      check_user_access: {
        Args: { user_id: string }
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
