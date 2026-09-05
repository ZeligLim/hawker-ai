export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: { id: string; name: string; slug: string; address: string; lat: number; lng: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>; Relationships: [];
      };
      food_outlets: {
        Row: { id: string; restaurant_id: string; name: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['food_outlets']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['food_outlets']['Insert']>; Relationships: [];
      };
      dishes: {
        Row: {
          id: string; food_outlet_id: string; name: string; description: string; price: number;
          is_vegetarian: boolean; is_halal: boolean; spice_level: number; protein_grams: number;
          image_url: string | null; is_available: boolean; tags: string[]; customizations: Json; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dishes']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['dishes']['Insert']>; Relationships: [];
      };
      merchant_memberships: {
        Row: { user_id: string; food_outlet_id: string; role: 'owner' | 'manager' | 'staff'; created_at: string };
        Insert: Omit<Database['public']['Tables']['merchant_memberships']['Row'], 'created_at'> & { created_at?: string };
        Update: Partial<Database['public']['Tables']['merchant_memberships']['Insert']>; Relationships: [];
      };
      merchant_handles: {
        Row: { id: string; food_outlet_id: string; handle: string; display_name: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['merchant_handles']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['merchant_handles']['Insert']>; Relationships: [];
      };
      hawker_tables: {
        Row: { id: string; restaurant_id: string; table_number: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['hawker_tables']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['hawker_tables']['Insert']>; Relationships: [];
      };
      table_sessions: {
        Row: { id: string; hawker_table_id: string; customer_id: string | null; status: 'active' | 'closed'; created_at: string; closed_at: string | null };
        Insert: Omit<Database['public']['Tables']['table_sessions']['Row'], 'id' | 'created_at' | 'closed_at'> & { id?: string; created_at?: string; closed_at?: string | null };
        Update: Partial<Database['public']['Tables']['table_sessions']['Insert']>; Relationships: [];
      };
      orders: {
        Row: { id: string; customer_id: string; table_session_id: string | null; status: string; subtotal: number; service_fee: number; total: number; payment_reference: string | null; created_at: string; paid_at: string | null; updated_at: string };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'paid_at' | 'updated_at'> & { id?: string; created_at?: string; paid_at?: string | null; updated_at?: string };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>; Relationships: [];
      };
      merchant_orders: {
        Row: { id: string; order_id: string; food_outlet_id: string; status: string; subtotal: number; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['merchant_orders']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['merchant_orders']['Insert']>; Relationships: [];
      };
      order_items: {
        Row: { id: string; order_id: string; merchant_order_id: string; dish_id: string; dish_name: string; unit_price: number; quantity: number; customizations: Json; notes: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>; Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order_with_items: {
        Args: { p_table_session_id: string | null; p_subtotal: number; p_service_fee: number; p_total: number; p_payment_reference: string | null; p_items: Json };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
