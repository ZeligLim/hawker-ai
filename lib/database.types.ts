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
      booth_invitations: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          food_outlet_id: string
          id: string
          invited_email: string | null
          token_hash: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          food_outlet_id: string
          id?: string
          invited_email?: string | null
          token_hash: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          food_outlet_id?: string
          id?: string
          invited_email?: string | null
          token_hash?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booth_invitations_food_outlet_id_fkey"
            columns: ["food_outlet_id"]
            isOneToOne: false
            referencedRelation: "food_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_ingredients: {
        Row: {
          created_at: string
          dish_id: string
          id: string
          ingredient_id: string
        }
        Insert: {
          created_at?: string
          dish_id: string
          id?: string
          ingredient_id: string
        }
        Update: {
          created_at?: string
          dish_id?: string
          id?: string
          ingredient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_ingredients_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          created_at: string
          customizations: Json
          description: string
          food_outlet_id: string
          id: string
          image_url: string | null
          is_available: boolean
          is_halal: boolean
          is_vegetarian: boolean
          name: string
          price: number
          protein_grams: number
          spice_level: number
          tags: string[]
        }
        Insert: {
          created_at?: string
          customizations?: Json
          description?: string
          food_outlet_id: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_halal?: boolean
          is_vegetarian?: boolean
          name: string
          price: number
          protein_grams: number
          spice_level?: number
          tags?: string[]
        }
        Update: {
          created_at?: string
          customizations?: Json
          description?: string
          food_outlet_id?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_halal?: boolean
          is_vegetarian?: boolean
          name?: string
          price?: number
          protein_grams?: number
          spice_level?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "dishes_food_outlet_id_fkey"
            columns: ["food_outlet_id"]
            isOneToOne: false
            referencedRelation: "food_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      food_outlets: {
        Row: {
          airwallex_account_id: string | null
          created_at: string
          deleted_at: string | null
          fee_payer: string | null
          id: string
          is_active: boolean
          is_open: boolean
          name: string
          platform_fee_fixed: number | null
          platform_fee_percent: number | null
          restaurant_id: string
          schedule: Json | null
          status: string
        }
        Insert: {
          airwallex_account_id?: string | null
          created_at?: string
          deleted_at?: string | null
          fee_payer?: string | null
          id?: string
          is_active?: boolean
          is_open?: boolean
          name: string
          platform_fee_fixed?: number | null
          platform_fee_percent?: number | null
          restaurant_id: string
          schedule?: Json | null
          status?: string
        }
        Update: {
          airwallex_account_id?: string | null
          created_at?: string
          deleted_at?: string | null
          fee_payer?: string | null
          id?: string
          is_active?: boolean
          is_open?: boolean
          name?: string
          platform_fee_fixed?: number | null
          platform_fee_percent?: number | null
          restaurant_id?: string
          schedule?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_outlets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      hawker_tables: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          table_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          table_number: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          table_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "hawker_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      merchant_handles: {
        Row: {
          created_at: string
          display_name: string
          food_outlet_id: string
          handle: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          food_outlet_id: string
          handle: string
          id?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          food_outlet_id?: string
          handle?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_handles_food_outlet_id_fkey"
            columns: ["food_outlet_id"]
            isOneToOne: true
            referencedRelation: "food_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_memberships: {
        Row: {
          created_at: string
          email: string | null
          food_outlet_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          food_outlet_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          food_outlet_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_memberships_food_outlet_id_fkey"
            columns: ["food_outlet_id"]
            isOneToOne: false
            referencedRelation: "food_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_orders: {
        Row: {
          created_at: string
          food_outlet_id: string
          id: string
          merchant_payout_amount: number | null
          order_id: string
          payment_status: string
          refund_amount: number
          status: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          food_outlet_id: string
          id?: string
          merchant_payout_amount?: number | null
          order_id: string
          payment_status?: string
          refund_amount?: number
          status?: string
          subtotal: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          food_outlet_id?: string
          id?: string
          merchant_payout_amount?: number | null
          order_id?: string
          payment_status?: string
          refund_amount?: number
          status?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_orders_food_outlet_id_fkey"
            columns: ["food_outlet_id"]
            isOneToOne: false
            referencedRelation: "food_outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          customizations: Json
          dish_id: string
          dish_name: string
          id: string
          is_refunded: boolean
          merchant_order_id: string
          notes: string
          order_id: string
          quantity: number
          refund_amount: number
          refund_reason: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          customizations?: Json
          dish_id: string
          dish_name: string
          id?: string
          is_refunded?: boolean
          merchant_order_id: string
          notes?: string
          order_id: string
          quantity: number
          refund_amount?: number
          refund_reason?: string
          unit_price: number
        }
        Update: {
          created_at?: string
          customizations?: Json
          dish_id?: string
          dish_name?: string
          id?: string
          is_refunded?: boolean
          merchant_order_id?: string
          notes?: string
          order_id?: string
          quantity?: number
          refund_amount?: number
          refund_reason?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_merchant_order_id_fkey"
            columns: ["merchant_order_id"]
            isOneToOne: false
            referencedRelation: "merchant_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          merchant_payout_amount: number | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_reference: string | null
          payment_status: string
          platform_fee_amount: number | null
          refund_amount: number
          service_fee: number
          status: string
          subtotal: number
          subtotal_amount: number | null
          table_session_id: string | null
          total: number
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          merchant_payout_amount?: number | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_reference?: string | null
          payment_status?: string
          platform_fee_amount?: number | null
          refund_amount?: number
          service_fee?: number
          status?: string
          subtotal: number
          subtotal_amount?: number | null
          table_session_id?: string | null
          total: number
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          merchant_payout_amount?: number | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_reference?: string | null
          payment_status?: string
          platform_fee_amount?: number | null
          refund_amount?: number
          service_fee?: number
          status?: string
          subtotal?: number
          subtotal_amount?: number | null
          table_session_id?: string | null
          total?: number
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_session_id_fkey"
            columns: ["table_session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_roles: {
        Row: {
          created_at: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rent_invoices: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          food_outlet_id: string
          id: string
          paid_at: string | null
          payment_intent_id: string | null
          restaurant_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          food_outlet_id: string
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          restaurant_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          food_outlet_id?: string
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          restaurant_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_invoices_food_outlet_id_fkey"
            columns: ["food_outlet_id"]
            isOneToOne: false
            referencedRelation: "food_outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_memberships: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          restaurant_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          restaurant_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          restaurant_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_memberships_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          created_at: string
          fee_payer: string
          has_aircon: boolean
          id: string
          is_active: boolean
          lat: number
          lng: number
          name: string
          platform_fee_fixed: number
          platform_fee_percent: number
          rating: number
          schedule: Json | null
          slug: string
          status: string
        }
        Insert: {
          address: string
          created_at?: string
          fee_payer?: string
          has_aircon?: boolean
          id?: string
          is_active?: boolean
          lat: number
          lng: number
          name: string
          platform_fee_fixed?: number
          platform_fee_percent?: number
          rating?: number
          schedule?: Json | null
          slug: string
          status?: string
        }
        Update: {
          address?: string
          created_at?: string
          fee_payer?: string
          has_aircon?: boolean
          id?: string
          is_active?: boolean
          lat?: number
          lng?: number
          name?: string
          platform_fee_fixed?: number
          platform_fee_percent?: number
          rating?: number
          schedule?: Json | null
          slug?: string
          status?: string
        }
        Relationships: []
      }
      table_sessions: {
        Row: {
          closed_at: string | null
          created_at: string
          customer_id: string | null
          hawker_table_id: string
          id: string
          status: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          hawker_table_id: string
          id?: string
          status?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          hawker_table_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_hawker_table_id_fkey"
            columns: ["hawker_table_id"]
            isOneToOne: false
            referencedRelation: "hawker_tables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_booth_invitation: {
        Args: { p_stall_name?: string; p_token_hash: string }
        Returns: Json
      }
      create_order_with_items:
        | {
            Args: {
              p_items: Json
              p_payment_reference: string
              p_service_fee: number
              p_subtotal: number
              p_table_session_id: string
              p_total: number
            }
            Returns: string
          }
        | {
            Args: {
              p_items: Json
              p_merchant_payout_amount?: number
              p_payment_intent_id?: string
              p_payment_reference: string
              p_payment_status?: string
              p_platform_fee_amount?: number
              p_service_fee: number
              p_subtotal: number
              p_subtotal_amount?: number
              p_table_session_id: string
              p_total: number
              p_total_amount?: number
            }
            Returns: string
          }
      delete_booth_slot: { Args: { p_booth_id: string }; Returns: Json }
      get_booth_invitation_details: {
        Args: { p_token_hash: string }
        Returns: Json
      }
      get_restaurant_monetization_settings: {
        Args: { p_restaurant_id: string }
        Returns: Json
      }
      is_platform_admin: { Args: { check_user_id?: string }; Returns: boolean }
      register_hawker_centre: {
        Args: {
          p_address: string
          p_booth_count?: number
          p_lat?: number
          p_lng?: number
          p_name: string
          p_slug: string
          p_status?: string
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
    Enums: {},
  },
} as const
