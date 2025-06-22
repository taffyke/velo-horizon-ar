export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cycling_sessions: {
        Row: {
          average_heart_rate: number | null
          average_power_watts: number | null
          average_speed_kmh: number | null
          calories_burned: number | null
          created_at: string | null
          distance_km: number | null
          duration_seconds: number | null
          elevation_gain_m: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          max_heart_rate: number | null
          max_power_watts: number | null
          max_speed_kmh: number | null
          notes: string | null
          route_data: Json | null
          session_name: string | null
          start_time: string
          updated_at: string | null
          user_id: string | null
          weather_conditions: Json | null
        }
        Insert: {
          average_heart_rate?: number | null
          average_power_watts?: number | null
          average_speed_kmh?: number | null
          calories_burned?: number | null
          created_at?: string | null
          distance_km?: number | null
          duration_seconds?: number | null
          elevation_gain_m?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          max_heart_rate?: number | null
          max_power_watts?: number | null
          max_speed_kmh?: number | null
          notes?: string | null
          route_data?: Json | null
          session_name?: string | null
          start_time: string
          updated_at?: string | null
          user_id?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          average_heart_rate?: number | null
          average_power_watts?: number | null
          average_speed_kmh?: number | null
          calories_burned?: number | null
          created_at?: string | null
          distance_km?: number | null
          duration_seconds?: number | null
          elevation_gain_m?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          max_heart_rate?: number | null
          max_power_watts?: number | null
          max_speed_kmh?: number | null
          notes?: string | null
          route_data?: Json | null
          session_name?: string | null
          start_time?: string
          updated_at?: string | null
          user_id?: string | null
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cycling_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_cycling_data: {
        Row: {
          created_at: string | null
          experience_years: number | null
          fitness_level: string | null
          ftp_watts: number | null
          height_cm: number | null
          id: string
          max_heart_rate: number | null
          preferred_cycling_type: string | null
          resting_heart_rate: number | null
          updated_at: string | null
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          experience_years?: number | null
          fitness_level?: string | null
          ftp_watts?: number | null
          height_cm?: number | null
          id?: string
          max_heart_rate?: number | null
          preferred_cycling_type?: string | null
          resting_heart_rate?: number | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          experience_years?: number | null
          fitness_level?: string | null
          ftp_watts?: number | null
          height_cm?: number | null
          id?: string
          max_heart_rate?: number | null
          preferred_cycling_type?: string | null
          resting_heart_rate?: number | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cycling_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_type: string | null
          id: string
          is_completed: boolean | null
          target_date: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
