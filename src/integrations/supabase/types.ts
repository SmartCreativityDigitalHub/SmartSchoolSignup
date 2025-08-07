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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_configs: {
        Row: {
          config_key: string
          config_value: string | null
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_profiles: {
        Row: {
          bank_account_name: string
          bank_account_number: string
          bank_name: string
          commission_rate: number | null
          country: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          paid_earnings: number | null
          pending_earnings: number | null
          phone_number: string
          state_location: string
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          bank_account_name: string
          bank_account_number: string
          bank_name: string
          commission_rate?: number | null
          country?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          paid_earnings?: number | null
          pending_earnings?: number | null
          phone_number: string
          state_location: string
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          bank_account_name?: string
          bank_account_number?: string
          bank_name?: string
          commission_rate?: number | null
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          paid_earnings?: number | null
          pending_earnings?: number | null
          phone_number?: string
          state_location?: string
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      affiliate_withdrawals: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          requested_at: string
          status: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          code: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          full_name: string
          id: string
          message: string
          phone_number: string
          school_name: string | null
          support_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          message: string
          phone_number: string
          school_name?: string | null
          support_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          message?: string
          phone_number?: string
          school_name?: string | null
          support_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_code_usage: {
        Row: {
          discount_code_id: string
          email: string
          id: string
          used_at: string
        }
        Insert: {
          discount_code_id: string
          email: string
          id?: string
          used_at?: string
        }
        Update: {
          discount_code_id?: string
          email?: string
          id?: string
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code_number: string
          code_title: string
          code_type: string
          created_at: string
          expiration_date: string
          flat_amount: number | null
          id: string
          is_active: boolean
          percentage: number | null
          updated_at: string
          usage_count_per_email: number
        }
        Insert: {
          code_number: string
          code_title: string
          code_type: string
          created_at?: string
          expiration_date: string
          flat_amount?: number | null
          id?: string
          is_active?: boolean
          percentage?: number | null
          updated_at?: string
          usage_count_per_email?: number
        }
        Update: {
          code_number?: string
          code_title?: string
          code_type?: string
          created_at?: string
          expiration_date?: string
          flat_amount?: number | null
          id?: string
          is_active?: boolean
          percentage?: number | null
          updated_at?: string
          usage_count_per_email?: number
        }
        Relationships: []
      }
      offline_subscription_renewals: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
          payment_date: string
          payment_evidence_url: string | null
          payment_method: string | null
          phone_number: string
          school_name: string
          selected_plan: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_evidence_url?: string | null
          payment_method?: string | null
          phone_number: string
          school_name: string
          selected_plan: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_evidence_url?: string | null
          payment_method?: string | null
          phone_number?: string
          school_name?: string
          selected_plan?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_evidence: {
        Row: {
          amount_paid: number
          created_at: string
          email: string
          evidence_file_url: string | null
          id: string
          payment_date: string
          payment_ref: string
          school_name: string
          school_phone: string
          signup_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          email: string
          evidence_file_url?: string | null
          id?: string
          payment_date: string
          payment_ref: string
          school_name: string
          school_phone: string
          signup_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          email?: string
          evidence_file_url?: string | null
          id?: string
          payment_date?: string
          payment_ref?: string
          school_name?: string
          school_phone?: string
          signup_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_evidence_signup_id_fkey"
            columns: ["signup_id"]
            isOneToOne: false
            referencedRelation: "school_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_tracking: {
        Row: {
          affiliate_id: string
          commission_earned: number | null
          commission_status: string | null
          converted: boolean | null
          id: string
          referral_code: string
          signup_id: string | null
          user_agent: string | null
          visited_at: string
          visitor_ip: string | null
        }
        Insert: {
          affiliate_id: string
          commission_earned?: number | null
          commission_status?: string | null
          converted?: boolean | null
          id?: string
          referral_code: string
          signup_id?: string | null
          user_agent?: string | null
          visited_at?: string
          visitor_ip?: string | null
        }
        Update: {
          affiliate_id?: string
          commission_earned?: number | null
          commission_status?: string | null
          converted?: boolean | null
          id?: string
          referral_code?: string
          signup_id?: string | null
          user_agent?: string | null
          visited_at?: string
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_tracking_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      renewals: {
        Row: {
          base_amount: number
          created_at: string
          discount_amount: number | null
          discount_code_id: string | null
          email: string
          id: string
          online_payment_status: string | null
          payment_reference: string | null
          payment_status: string | null
          phone_number: string
          school_name: string
          selected_plan: string
          student_count: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          base_amount: number
          created_at?: string
          discount_amount?: number | null
          discount_code_id?: string | null
          email: string
          id?: string
          online_payment_status?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone_number: string
          school_name: string
          selected_plan: string
          student_count: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          base_amount?: number
          created_at?: string
          discount_amount?: number | null
          discount_code_id?: string | null
          email?: string
          id?: string
          online_payment_status?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone_number?: string
          school_name?: string
          selected_plan?: string
          student_count?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewals_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      school_signups: {
        Row: {
          address: string | null
          admin_name: string
          city: string
          created_at: string
          email: string
          employee_address: string
          employee_blood_group: string | null
          employee_dob: string | null
          employee_email: string
          employee_gender: string | null
          employee_mobile: string
          employee_name: string
          employee_religion: string | null
          id: string
          mobile_no: string
          online_payment_status: string | null
          payment_status: string | null
          payment_type: string
          referral_code: string | null
          school_name: string
          selected_plan: string
          state: string
          student_count: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_name: string
          city: string
          created_at?: string
          email: string
          employee_address: string
          employee_blood_group?: string | null
          employee_dob?: string | null
          employee_email: string
          employee_gender?: string | null
          employee_mobile: string
          employee_name: string
          employee_religion?: string | null
          id?: string
          mobile_no: string
          online_payment_status?: string | null
          payment_status?: string | null
          payment_type: string
          referral_code?: string | null
          school_name: string
          selected_plan: string
          state: string
          student_count: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_name?: string
          city?: string
          created_at?: string
          email?: string
          employee_address?: string
          employee_blood_group?: string | null
          employee_dob?: string | null
          employee_email?: string
          employee_gender?: string | null
          employee_mobile?: string
          employee_name?: string
          employee_religion?: string | null
          id?: string
          mobile_no?: string
          online_payment_status?: string | null
          payment_status?: string | null
          payment_type?: string
          referral_code?: string | null
          school_name?: string
          selected_plan?: string
          state?: string
          student_count?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "admin" | "affiliate" | "school"
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
      user_role: ["admin", "affiliate", "school"],
    },
  },
} as const
