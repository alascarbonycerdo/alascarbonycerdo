export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      brand_manual_sections: {
        Row: {
          contenido: string
          id: string
          orden: number
          titulo: string
          updated_at: string
        }
        Insert: {
          contenido?: string
          id?: string
          orden?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          contenido?: string
          id?: string
          orden?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      guia_emplatado: {
        Row: {
          foto_url: string | null
          id: string
          nombre: string
          orden: number
          pasos: string
          updated_at: string
        }
        Insert: {
          foto_url?: string | null
          id: string
          nombre: string
          orden?: number
          pasos?: string
          updated_at?: string
        }
        Update: {
          foto_url?: string | null
          id?: string
          nombre?: string
          orden?: number
          pasos?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventario_items: {
        Row: {
          consumo_por_venta: number
          detalle: string | null
          id: string
          nombre: string
          stock_actual: number
          updated_at: string
        }
        Insert: {
          consumo_por_venta?: number
          detalle?: string | null
          id: string
          nombre: string
          stock_actual?: number
          updated_at?: string
        }
        Update: {
          consumo_por_venta?: number
          detalle?: string | null
          id?: string
          nombre?: string
          stock_actual?: number
          updated_at?: string
        }
        Relationships: []
      }
      movimientos_inventario: {
        Row: {
          cantidad: number
          creado_por: string | null
          created_at: string
          dish_id: string
          id: string
          nota: string | null
          tipo: string
        }
        Insert: {
          cantidad: number
          creado_por?: string | null
          created_at?: string
          dish_id: string
          id?: string
          nota?: string | null
          tipo: string
        }
        Update: {
          cantidad?: number
          creado_por?: string | null
          created_at?: string
          dish_id?: string
          id?: string
          nota?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'movimientos_inventario_creado_por_fkey'
            columns: ['creado_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movimientos_inventario_dish_id_fkey'
            columns: ['dish_id']
            isOneToOne: false
            referencedRelation: 'inventario_items'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nombre: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nombre?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nombre?: string | null
          role?: string
        }
        Relationships: []
      }
      ventas: {
        Row: {
          cantidad: number
          created_at: string
          dish_id: string
          dish_nombre: string
          id: string
          precio_unitario_miles: number
          total_miles: number
          vendedor_id: string | null
        }
        Insert: {
          cantidad: number
          created_at?: string
          dish_id: string
          dish_nombre: string
          id?: string
          precio_unitario_miles: number
          total_miles: number
          vendedor_id?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          dish_id?: string
          dish_nombre?: string
          id?: string
          precio_unitario_miles?: number
          total_miles?: number
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ventas_vendedor_id_fkey'
            columns: ['vendedor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_is: { Args: { required: string[] }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
