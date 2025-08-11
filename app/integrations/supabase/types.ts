
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
      events: {
        Row: {
          id: string
          date: string
          time: string
          customer_name: string
          customer_phone: string
          child_name: string
          package_type: 'Abra' | 'Kadabra' | 'Abrakadabra'
          total_amount: number
          deposit: number
          remaining_amount: number
          is_paid: boolean
          notes: string | null
          created_at: string
          updated_at: string
          anticipo_1_amount: number | null
          anticipo_1_date: string | null
          anticipo_2_amount: number | null
          anticipo_2_date: string | null
          anticipo_3_amount: number | null
          anticipo_3_date: string | null
        }
        Insert: {
          id?: string
          date: string
          time: string
          customer_name: string
          customer_phone: string
          child_name: string
          package_type: 'Abra' | 'Kadabra' | 'Abrakadabra'
          total_amount: number
          deposit?: number
          remaining_amount?: number
          is_paid?: boolean
          notes?: string | null
          anticipo_1_amount?: number | null
          anticipo_1_date?: string | null
          anticipo_2_amount?: number | null
          anticipo_2_date?: string | null
          anticipo_3_amount?: number | null
          anticipo_3_date?: string | null
        }
        Update: {
          id?: string
          date?: string
          time?: string
          customer_name?: string
          customer_phone?: string
          child_name?: string
          package_type?: 'Abra' | 'Kadabra' | 'Abrakadabra'
          total_amount?: number
          deposit?: number
          remaining_amount?: number
          is_paid?: boolean
          notes?: string | null
          anticipo_1_amount?: number | null
          anticipo_1_date?: string | null
          anticipo_2_amount?: number | null
          anticipo_2_date?: string | null
          anticipo_3_amount?: number | null
          anticipo_3_date?: string | null
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicTableNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicTableNameOrOptions]
    : never
