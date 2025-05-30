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
      advisor_meetings: {
        Row: {
          advisor_id: number | null
          date: string
          id: number
          topic: string
          user_id: number | null
        }
        Insert: {
          advisor_id?: number | null
          date: string
          id?: number
          topic: string
          user_id?: number | null
        }
        Update: {
          advisor_id?: number | null
          date?: string
          id?: number
          topic?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_meetings_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_meetings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_stats: {
        Row: {
          advisor_id: number
          last_meeting_date: string | null
          total_meetings: number | null
        }
        Insert: {
          advisor_id: number
          last_meeting_date?: string | null
          total_meetings?: number | null
        }
        Update: {
          advisor_id?: number
          last_meeting_date?: string | null
          total_meetings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_stats_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: true
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          email: string
          expertise: string
          id: number
          image_url: string | null
          name: string
        }
        Insert: {
          email: string
          expertise: string
          id?: number
          image_url?: string | null
          name: string
        }
        Update: {
          email?: string
          expertise?: string
          id?: number
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      asset_distribution: {
        Row: {
          asset_type: string
          id: number
          percentage: number
          total_value: number
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          asset_type: string
          id?: number
          percentage: number
          total_value: number
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          asset_type?: string
          id?: number
          percentage?: number
          total_value?: number
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      goal_achievements: {
        Row: {
          achieved_amount: number
          achievement_date: string | null
          goal_id: number | null
          id: number
          target_amount: number
          user_id: number | null
        }
        Insert: {
          achieved_amount: number
          achievement_date?: string | null
          goal_id?: number | null
          id?: number
          target_amount: number
          user_id?: number | null
        }
        Update: {
          achieved_amount?: number
          achievement_date?: string | null
          goal_id?: number | null
          id?: number
          target_amount?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_achievements_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: true
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          current_amount: number
          deadline: string | null
          id: number
          name: string
          target_amount: number
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          current_amount: number
          deadline?: string | null
          id?: number
          name: string
          target_amount: number
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number
          deadline?: string | null
          id?: number
          name?: string
          target_amount?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          asset_name: string
          asset_type: string
          created_at: string | null
          current_value: number
          id: number
          purchase_price: number
          quantity: number
          user_id: number | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          created_at?: string | null
          current_value: number
          id?: number
          purchase_price: number
          quantity: number
          user_id?: number | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          created_at?: string | null
          current_value?: number
          id?: number
          purchase_price?: number
          quantity?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_audit_log: {
        Row: {
          action: string
          changed_at: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          transaction_id: number | null
          user_id: number | null
        }
        Insert: {
          action: string
          changed_at?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          transaction_id?: number | null
          user_id?: number | null
        }
        Update: {
          action?: string
          changed_at?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          transaction_id?: number | null
          user_id?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          asset_name: string | null
          date: string
          id: number
          notes: string | null
          price: number | null
          quantity: number | null
          type: string
          user_id: number | null
        }
        Insert: {
          asset_name?: string | null
          date: string
          id?: number
          notes?: string | null
          price?: number | null
          quantity?: number | null
          type: string
          user_id?: number | null
        }
        Update: {
          asset_name?: string | null
          date?: string
          id?: number
          notes?: string | null
          price?: number | null
          quantity?: number | null
          type?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_time: string | null
          activity_type: string
          id: number
          ip_address: string | null
          user_agent: string | null
          user_id: number | null
        }
        Insert: {
          activity_time?: string | null
          activity_type: string
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id?: number | null
        }
        Update: {
          activity_time?: string | null
          activity_type?: string
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          last_transaction_date: string | null
          last_transaction_type: string | null
          total_transactions: number | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          last_transaction_date?: string | null
          last_transaction_type?: string | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id: number
        }
        Update: {
          last_transaction_date?: string | null
          last_transaction_type?: string | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: number
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: number
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: number
          password_hash?: string
        }
        Relationships: []
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
