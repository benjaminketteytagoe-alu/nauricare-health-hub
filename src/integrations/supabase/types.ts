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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_datetime: string
          clinician_id: string
          created_at: string | null
          id: string
          mode: string
          notes: string | null
          patient_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_datetime: string
          clinician_id: string
          created_at?: string | null
          id?: string
          mode: string
          notes?: string | null
          patient_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_datetime?: string
          clinician_id?: string
          created_at?: string | null
          id?: string
          mode?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinician_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          language: string | null
          published: boolean | null
          slug: string
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          language?: string | null
          published?: boolean | null
          slug: string
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          language?: string | null
          published?: boolean | null
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      care_plan_items: {
        Row: {
          care_plan_id: string
          completed_today: boolean | null
          created_at: string | null
          description: string | null
          frequency: string | null
          id: string
          item_type: string
          title: string
        }
        Insert: {
          care_plan_id: string
          completed_today?: boolean | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          item_type: string
          title: string
        }
        Update: {
          care_plan_id?: string
          completed_today?: boolean | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          item_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_plan_items_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          patient_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          patient_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          patient_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinician_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          fee_range_max: number | null
          fee_range_min: number | null
          full_name: string
          id: string
          languages: string[] | null
          location: string | null
          specialty: string
          telehealth_available: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          fee_range_max?: number | null
          fee_range_min?: number | null
          full_name: string
          id?: string
          languages?: string[] | null
          location?: string | null
          specialty: string
          telehealth_available?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          fee_range_max?: number | null
          fee_range_min?: number | null
          full_name?: string
          id?: string
          languages?: string[] | null
          location?: string | null
          specialty?: string
          telehealth_available?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      drugs: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_appointments: boolean | null
          email_care_plan_reminders: boolean | null
          email_health_tips: boolean | null
          email_newsletter: boolean | null
          id: string
          in_app_appointments: boolean | null
          in_app_care_plan_reminders: boolean | null
          in_app_symptom_alerts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_appointments?: boolean | null
          email_care_plan_reminders?: boolean | null
          email_health_tips?: boolean | null
          email_newsletter?: boolean | null
          id?: string
          in_app_appointments?: boolean | null
          in_app_care_plan_reminders?: boolean | null
          in_app_symptom_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_appointments?: boolean | null
          email_care_plan_reminders?: boolean | null
          email_health_tips?: boolean | null
          email_newsletter?: boolean | null
          id?: string
          in_app_appointments?: boolean | null
          in_app_care_plan_reminders?: boolean | null
          in_app_symptom_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          diagnosed_fibroids: boolean | null
          diagnosed_pcos: boolean | null
          full_name: string
          id: string
          language: string | null
          menstrual_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          diagnosed_fibroids?: boolean | null
          diagnosed_pcos?: boolean | null
          full_name: string
          id?: string
          language?: string | null
          menstrual_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          diagnosed_fibroids?: boolean | null
          diagnosed_pcos?: boolean | null
          full_name?: string
          id?: string
          language?: string | null
          menstrual_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          created_at: string | null
          hours: string
          id: string
          latitude: number
          location: string
          longitude: number
          name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hours: string
          id?: string
          latitude: number
          location: string
          longitude: number
          name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hours?: string
          id?: string
          latitude?: number
          location?: string
          longitude?: number
          name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pharmacy_inventory: {
        Row: {
          drug_id: string
          id: string
          in_stock: boolean | null
          pharmacy_id: string
          price_rwf: number | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          drug_id: string
          id?: string
          in_stock?: boolean | null
          pharmacy_id: string
          price_rwf?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          drug_id?: string
          id?: string
          in_stock?: boolean | null
          pharmacy_id?: string
          price_rwf?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_inventory_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_inventory_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_checks: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          risk_level: string
          symptoms: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          risk_level: string
          symptoms: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          risk_level?: string
          symptoms?: Json
        }
        Relationships: [
          {
            foreignKeyName: "symptom_checks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_clinician_profile: {
        Args: { _clinician_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_patient_profile: {
        Args: { _patient_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "clinician" | "patient"
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
      app_role: ["admin", "clinician", "patient"],
    },
  },
} as const
