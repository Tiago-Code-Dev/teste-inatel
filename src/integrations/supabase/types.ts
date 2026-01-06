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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_by: string | null
          id: string
          machine_id: string
          message: string
          opened_at: string
          probable_cause: string | null
          reason: string | null
          recommended_action: string | null
          severity: string
          status: string
          tire_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          acknowledged_by?: string | null
          id?: string
          machine_id: string
          message: string
          opened_at?: string
          probable_cause?: string | null
          reason?: string | null
          recommended_action?: string | null
          severity: string
          status?: string
          tire_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          acknowledged_by?: string | null
          id?: string
          machine_id?: string
          message?: string
          opened_at?: string
          probable_cause?: string | null
          reason?: string | null
          recommended_action?: string | null
          severity?: string
          status?: string
          tire_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_tire_id_fkey"
            columns: ["tire_id"]
            isOneToOne: false
            referencedRelation: "tires"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      machines: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          last_telemetry_at: string | null
          model: string
          name: string
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          last_telemetry_at?: string | null
          model: string
          name: string
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          last_telemetry_at?: string | null
          model?: string
          name?: string
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_attachments: {
        Row: {
          created_at: string
          duration: number | null
          file_path: string
          file_url: string | null
          id: string
          occurrence_id: string
          retry_count: number | null
          size: number | null
          type: string
          updated_at: string
          upload_status: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_path: string
          file_url?: string | null
          id?: string
          occurrence_id: string
          retry_count?: number | null
          size?: number | null
          type: string
          updated_at?: string
          upload_status?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_path?: string
          file_url?: string | null
          id?: string
          occurrence_id?: string
          retry_count?: number | null
          size?: number | null
          type?: string
          updated_at?: string
          upload_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_attachments_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrences: {
        Row: {
          alert_id: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          is_offline_created: boolean | null
          machine_id: string
          status: string
          synced_at: string | null
          tire_id: string | null
          updated_at: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_offline_created?: boolean | null
          machine_id: string
          status?: string
          synced_at?: string | null
          tire_id?: string | null
          updated_at?: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_offline_created?: boolean | null
          machine_id?: string
          status?: string
          synced_at?: string | null
          tire_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "occurrences_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_tire_id_fkey"
            columns: ["tire_id"]
            isOneToOne: false
            referencedRelation: "tires"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          unit_ids: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          unit_ids?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          unit_ids?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telemetry: {
        Row: {
          id: string
          machine_id: string
          pressure: number
          seq: number
          speed: number
          timestamp: string
          tire_id: string | null
        }
        Insert: {
          id?: string
          machine_id: string
          pressure: number
          seq: number
          speed: number
          timestamp?: string
          tire_id?: string | null
        }
        Update: {
          id?: string
          machine_id?: string
          pressure?: number
          seq?: number
          speed?: number
          timestamp?: string
          tire_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemetry_tire_id_fkey"
            columns: ["tire_id"]
            isOneToOne: false
            referencedRelation: "tires"
            referencedColumns: ["id"]
          },
        ]
      }
      tires: {
        Row: {
          created_at: string
          current_pressure: number | null
          id: string
          installed_at: string | null
          lifecycle_status: string
          machine_id: string | null
          position: string | null
          recommended_pressure: number
          serial: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_pressure?: number | null
          id?: string
          installed_at?: string | null
          lifecycle_status?: string
          machine_id?: string | null
          position?: string | null
          recommended_pressure?: number
          serial: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_pressure?: number | null
          id?: string
          installed_at?: string | null
          lifecycle_status?: string
          machine_id?: string | null
          position?: string | null
          recommended_pressure?: number
          serial?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tires_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
    }
    Enums: {
      app_role: "admin" | "manager" | "technician" | "operator"
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
      app_role: ["admin", "manager", "technician", "operator"],
    },
  },
} as const
