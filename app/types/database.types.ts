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
      dish_inventory_map: {
        Row: {
          consumo_por_venta: number
          dish_id: string
          inventario_item_id: string
        }
        Insert: {
          consumo_por_venta?: number
          dish_id: string
          inventario_item_id: string
        }
        Update: {
          consumo_por_venta?: number
          dish_id?: string
          inventario_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dish_inventory_map_inventario_item_id_fkey'
            columns: ['inventario_item_id']
            isOneToOne: false
            referencedRelation: 'inventario_items'
            referencedColumns: ['id']
          },
        ]
      }
      inventario_items: {
        Row: {
          detalle: string | null
          id: string
          nombre: string
          unidades_por_paquete: number
        }
        Insert: {
          detalle?: string | null
          id: string
          nombre: string
          unidades_por_paquete?: number
        }
        Update: {
          detalle?: string | null
          id?: string
          nombre?: string
          unidades_por_paquete?: number
        }
        Relationships: []
      }
      inventario_stock: {
        Row: {
          item_id: string
          punto_venta_id: string
          stock_actual: number
          updated_at: string
        }
        Insert: {
          item_id: string
          punto_venta_id: string
          stock_actual?: number
          updated_at?: string
        }
        Update: {
          item_id?: string
          punto_venta_id?: string
          stock_actual?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventario_stock_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'inventario_items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventario_stock_punto_venta_id_fkey'
            columns: ['punto_venta_id']
            isOneToOne: false
            referencedRelation: 'puntos_venta'
            referencedColumns: ['id']
          },
        ]
      }
      puntos_venta: {
        Row: {
          activo: boolean
          created_at: string
          direccion: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          direccion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          direccion?: string | null
          id?: string
          nombre?: string
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
          punto_venta_id: string
          tipo: string
        }
        Insert: {
          cantidad: number
          creado_por?: string | null
          created_at?: string
          dish_id: string
          id?: string
          nota?: string | null
          punto_venta_id: string
          tipo: string
        }
        Update: {
          cantidad?: number
          creado_por?: string | null
          created_at?: string
          dish_id?: string
          id?: string
          nota?: string | null
          punto_venta_id?: string
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
          {
            foreignKeyName: 'movimientos_inventario_punto_venta_id_fkey'
            columns: ['punto_venta_id']
            isOneToOne: false
            referencedRelation: 'puntos_venta'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean
          avatar_url: string | null
          celular: string | null
          created_at: string
          documento: string | null
          id: string
          nombre: string | null
          punto_venta_id: string | null
          role: string
          tipo_sangre: string | null
        }
        Insert: {
          activo?: boolean
          avatar_url?: string | null
          celular?: string | null
          created_at?: string
          documento?: string | null
          id: string
          nombre?: string | null
          punto_venta_id?: string | null
          role?: string
          tipo_sangre?: string | null
        }
        Update: {
          activo?: boolean
          avatar_url?: string | null
          celular?: string | null
          created_at?: string
          documento?: string | null
          id?: string
          nombre?: string | null
          punto_venta_id?: string | null
          role?: string
          tipo_sangre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_punto_venta_id_fkey'
            columns: ['punto_venta_id']
            isOneToOne: false
            referencedRelation: 'puntos_venta'
            referencedColumns: ['id']
          },
        ]
      }
      ventas: {
        Row: {
          cantidad: number
          created_at: string
          dish_id: string
          dish_nombre: string
          id: string
          precio_unitario_miles: number
          punto_venta_id: string
          total_miles: number
          vendedor_id: string | null
          vendedor_nombre: string | null
        }
        Insert: {
          cantidad: number
          created_at?: string
          dish_id: string
          dish_nombre: string
          id?: string
          precio_unitario_miles: number
          punto_venta_id: string
          total_miles: number
          vendedor_id?: string | null
          vendedor_nombre?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          dish_id?: string
          dish_nombre?: string
          id?: string
          precio_unitario_miles?: number
          punto_venta_id?: string
          total_miles?: number
          vendedor_id?: string | null
          vendedor_nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ventas_vendedor_id_fkey'
            columns: ['vendedor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ventas_punto_venta_id_fkey'
            columns: ['punto_venta_id']
            isOneToOne: false
            referencedRelation: 'puntos_venta'
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
      restock_item: { Args: { p_item_id: string; p_cantidad: number; p_nota?: string | null }; Returns: undefined }
      remove_stock_item: { Args: { p_item_id: string; p_cantidad: number; p_nota?: string | null }; Returns: undefined }
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
