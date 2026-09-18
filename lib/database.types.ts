export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string;
          lat: number;
          lng: number;
          fee_payer: 'CUSTOMER' | 'MERCHANT';
          platform_fee_fixed: number;
          platform_fee_percent: number;
          has_aircon?: boolean;
          rating?: number;
          is_active?: boolean;
          schedule?: Json;
          status?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'fee_payer' | 'platform_fee_fixed' | 'platform_fee_percent'> & {
          id?: string;
          created_at?: string;
          fee_payer?: 'CUSTOMER' | 'MERCHANT';
          platform_fee_fixed?: number;
          platform_fee_percent?: number;
          has_aircon?: boolean;
          rating?: number;
          is_active?: boolean;
          schedule?: Json;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
        Relationships: [];
      };
      food_outlets: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          fee_payer: 'CUSTOMER' | 'MERCHANT' | null;
          platform_fee_fixed: number | null;
          platform_fee_percent: number | null;
          is_open?: boolean;
          is_active?: boolean;
          schedule?: Json;
          status?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['food_outlets']['Row'], 'id' | 'created_at' | 'fee_payer' | 'platform_fee_fixed' | 'platform_fee_percent'> & {
          id?: string;
          created_at?: string;
          fee_payer?: 'CUSTOMER' | 'MERCHANT' | null;
          platform_fee_fixed?: number | null;
          platform_fee_percent?: number | null;
          is_open?: boolean;
          is_active?: boolean;
          schedule?: Json;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['food_outlets']['Insert']>;
        Relationships: [];
      };
      dishes: {
        Row: {
          id: string;
          food_outlet_id: string;
          name: string;
          description: string;
          price: number;
          is_vegetarian: boolean;
          is_halal: boolean;
          spice_level: number;
          protein_grams: number;
          image_url: string | null;
          is_available: boolean;
          tags: string[];
          customizations: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dishes']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['dishes']['Insert']>;
        Relationships: [];
      };
      restaurant_memberships: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          role: 'owner' | 'manager' | 'staff';
          invited_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_memberships']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurant_memberships']['Insert']>;
        Relationships: [];
      };
      merchant_memberships: {
        Row: {
          user_id: string;
          food_outlet_id: string;
          role: 'owner' | 'manager' | 'staff';
          email: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['merchant_memberships']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['merchant_memberships']['Insert']>;
        Relationships: [];
      };
      booth_invitations: {
        Row: {
          id: string;
          food_outlet_id: string;
          created_by: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          used_by: string | null;
          invited_email: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booth_invitations']['Row'], 'id' | 'created_at' | 'used_at' | 'used_by'> & {
          id?: string;
          created_at?: string;
          used_at?: string | null;
          used_by?: string | null;
          invited_email?: string | null;
        };
        Update: Partial<Database['public']['Tables']['booth_invitations']['Insert']>;
        Relationships: [];
      };
      merchant_handles: {
        Row: {
          id: string;
          food_outlet_id: string;
          handle: string;
          display_name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['merchant_handles']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['merchant_handles']['Insert']>;
        Relationships: [];
      };
      hawker_tables: {
        Row: {
          id: string;
          restaurant_id: string;
          table_number: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hawker_tables']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['hawker_tables']['Insert']>;
        Relationships: [];
      };
      table_sessions: {
        Row: {
          id: string;
          hawker_table_id: string;
          customer_id: string | null;
          status: 'active' | 'closed';
          created_at: string;
          closed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['table_sessions']['Row'], 'id' | 'created_at' | 'closed_at'> & {
          id?: string;
          created_at?: string;
          closed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['table_sessions']['Insert']>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          table_session_id: string | null;
          status: string;
          subtotal: number;
          service_fee: number;
          total: number;
          subtotal_amount: number | null;
          platform_fee_amount: number | null;
          total_amount: number | null;
          merchant_payout_amount: number | null;
          payment_status: string;
          refund_amount: number;
          payment_reference: string | null;
          payment_intent_id: string | null;
          created_at: string;
          paid_at: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'paid_at' | 'updated_at' | 'subtotal_amount' | 'platform_fee_amount' | 'total_amount' | 'merchant_payout_amount' | 'payment_status' | 'refund_amount' | 'payment_intent_id'> & {
          id?: string;
          created_at?: string;
          paid_at?: string | null;
          updated_at?: string;
          subtotal_amount?: number | null;
          platform_fee_amount?: number | null;
          total_amount?: number | null;
          merchant_payout_amount?: number | null;
          payment_status?: string;
          refund_amount?: number;
          payment_intent_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: [];
      };
      merchant_orders: {
        Row: {
          id: string;
          order_id: string;
          food_outlet_id: string;
          status: string;
          subtotal: number;
          merchant_payout_amount: number | null;
          payment_status: string;
          refund_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['merchant_orders']['Row'], 'id' | 'created_at' | 'updated_at' | 'merchant_payout_amount' | 'payment_status' | 'refund_amount'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          merchant_payout_amount?: number | null;
          payment_status?: string;
          refund_amount?: number;
        };
        Update: Partial<Database['public']['Tables']['merchant_orders']['Insert']>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          merchant_order_id: string;
          dish_id: string;
          dish_name: string;
          unit_price: number;
          quantity: number;
          customizations: Json;
          notes: string;
          is_refunded: boolean;
          refund_amount: number;
          refund_reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at' | 'is_refunded' | 'refund_amount' | 'refund_reason'> & {
          id?: string;
          created_at?: string;
          is_refunded?: boolean;
          refund_amount?: number;
          refund_reason?: string | null;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
        Relationships: [];
      };
      platform_roles: {
        Row: {
          user_id: string;
          role: 'superadmin' | 'saas_owner' | 'support';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role: 'superadmin' | 'saas_owner' | 'support';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['platform_roles']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order_with_items: {
        Args: {
          p_table_session_id: string | null;
          p_subtotal: number;
          p_service_fee: number;
          p_total: number;
          p_payment_reference: string | null;
          p_items: Json;
          p_subtotal_amount?: number;
          p_platform_fee_amount?: number;
          p_total_amount?: number;
          p_merchant_payout_amount?: number;
          p_payment_status?: string;
          p_payment_intent_id?: string | null;
        };
        Returns: string;
      };
      claim_booth_invitation: {
        Args: {
          p_token_hash: string;
          p_stall_name?: string | null;
        };
        Returns: Json;
      };
      get_booth_invitation_details: {
        Args: {
          p_token_hash: string;
        };
        Returns: Json;
      };
      register_hawker_centre: {
        Args: {
          p_name: string;
          p_slug?: string | null;
          p_address: string;
          p_lat?: number;
          p_lng?: number;
          p_booth_count?: number;
          p_status?: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
