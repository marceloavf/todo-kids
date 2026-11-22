
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "completions": {
                  Row: {
                    "child_id": string,"created_at": string,"day": string,"decided_at": string | null,"decided_by": string | null,"family_id": string,"hint": string | null,"id": string,"points": number,"status": Database["public"]['Enums']["completion_status"],"task_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "child_id": string,"created_at"?: string,"day": string,"decided_at"?: string | null,"decided_by"?: string | null,"family_id": string,"hint"?: string | null,"id"?: string,"points": number,"status": Database["public"]['Enums']["completion_status"],"task_id": string
                  }
                  Update: {
                    "child_id"?: string,"created_at"?: string,"day"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"family_id"?: string,"hint"?: string | null,"id"?: string,"points"?: number,"status"?: Database["public"]['Enums']["completion_status"],"task_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "completions_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "completions_decided_by_fkey"
      columns: ["decided_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "completions_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "completions_task_id_fkey"
      columns: ["task_id"]
isOneToOne: false
      referencedRelation: "tasks"
      referencedColumns: ["id"]
    }
                  ]
                },"families": {
                  Row: {
                    "id": string,"name": string,"timezone": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id": string,"name": string,"timezone": string
                  }
                  Update: {
                    "id"?: string,"name"?: string,"timezone"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "archived_at": string | null,"avatar": string,"balance": number,"color": string,"family_id": string,"id": string,"kind": Database["public"]['Enums']["profile_kind"],"name": string,"read_aloud": boolean,"reduced_motion": boolean,"sounds": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"avatar"?: string,"balance"?: number,"color"?: string,"family_id": string,"id"?: string,"kind": Database["public"]['Enums']["profile_kind"],"name": string,"read_aloud"?: boolean,"reduced_motion"?: boolean,"sounds"?: boolean
                  }
                  Update: {
                    "archived_at"?: string | null,"avatar"?: string,"balance"?: number,"color"?: string,"family_id"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["profile_kind"],"name"?: string,"read_aloud"?: boolean,"reduced_motion"?: boolean,"sounds"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    }
                  ]
                },"redemptions": {
                  Row: {
                    "child_id": string,"cost": number,"created_at": string,"decided_at": string | null,"decided_by": string | null,"family_id": string,"id": string,"reward_id": string,"status": Database["public"]['Enums']["redemption_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "child_id": string,"cost": number,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"family_id": string,"id"?: string,"reward_id": string,"status"?: Database["public"]['Enums']["redemption_status"]
                  }
                  Update: {
                    "child_id"?: string,"cost"?: number,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"family_id"?: string,"id"?: string,"reward_id"?: string,"status"?: Database["public"]['Enums']["redemption_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "redemptions_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "redemptions_decided_by_fkey"
      columns: ["decided_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "redemptions_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "redemptions_reward_id_fkey"
      columns: ["reward_id"]
isOneToOne: false
      referencedRelation: "rewards"
      referencedColumns: ["id"]
    }
                  ]
                },"rewards": {
                  Row: {
                    "archived_at": string | null,"cost": number,"family_id": string,"icon": string,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"cost": number,"family_id": string,"icon": string,"id"?: string,"name": string
                  }
                  Update: {
                    "archived_at"?: string | null,"cost"?: number,"family_id"?: string,"icon"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rewards_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    }
                  ]
                },"routines": {
                  Row: {
                    "archived_at": string | null,"child_ids": (string)[],"family_id": string,"id": string,"name": string,"position": number,"weekdays": (number)[]
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"child_ids": (string)[],"family_id": string,"id"?: string,"name": string,"position": number,"weekdays": (number)[]
                  }
                  Update: {
                    "archived_at"?: string | null,"child_ids"?: (string)[],"family_id"?: string,"id"?: string,"name"?: string,"position"?: number,"weekdays"?: (number)[]
                  }
                  Relationships: [
                    {
      foreignKeyName: "routines_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    }
                  ]
                },"statement_entries": {
                  Row: {
                    "amount": number,"child_id": string,"completion_id": string | null,"created_at": string,"description": string,"family_id": string,"guardian_id": string | null,"id": string,"kind": Database["public"]['Enums']["statement_kind"],"redemption_id": string | null,"requested_amount": number
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"child_id": string,"completion_id"?: string | null,"created_at"?: string,"description": string,"family_id": string,"guardian_id"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["statement_kind"],"redemption_id"?: string | null,"requested_amount": number
                  }
                  Update: {
                    "amount"?: number,"child_id"?: string,"completion_id"?: string | null,"created_at"?: string,"description"?: string,"family_id"?: string,"guardian_id"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["statement_kind"],"redemption_id"?: string | null,"requested_amount"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "statement_entries_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "statement_entries_completion_id_fkey"
      columns: ["completion_id"]
isOneToOne: false
      referencedRelation: "completions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "statement_entries_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "statement_entries_guardian_id_fkey"
      columns: ["guardian_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "statement_entries_redemption_id_fkey"
      columns: ["redemption_id"]
isOneToOne: false
      referencedRelation: "redemptions"
      referencedColumns: ["id"]
    }
                  ]
                },"tasks": {
                  Row: {
                    "archived_at": string | null,"child_ids": (string)[] | null,"description": string,"family_id": string,"icon": string,"id": string,"name": string,"one_off_date": string | null,"points": number,"position": number,"requires_approval": boolean,"routine_id": string | null,"steps": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"child_ids"?: (string)[] | null,"description"?: string,"family_id": string,"icon": string,"id"?: string,"name": string,"one_off_date"?: string | null,"points": number,"position": number,"requires_approval": boolean,"routine_id"?: string | null,"steps"?: NonNullable<Json>
                  }
                  Update: {
                    "archived_at"?: string | null,"child_ids"?: (string)[] | null,"description"?: string,"family_id"?: string,"icon"?: string,"id"?: string,"name"?: string,"one_off_date"?: string | null,"points"?: number,"position"?: number,"requires_approval"?: boolean,"routine_id"?: string | null,"steps"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "tasks_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tasks_routine_id_fkey"
      columns: ["routine_id"]
isOneToOne: false
      referencedRelation: "routines"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            device_child_id: { Args: Record<PropertyKey, never>; Returns: string | null }
            issue_device_code: { Args: { p_token: string; p_child_id: string }; Returns: { code: string; expires_at: string }[] }
            redeem_device_code: { Args: { p_code: string }; Returns: string }
            list_child_devices: { Args: { p_token: string; p_child_id: string }; Returns: { id: string; linked_at: string; guardian_name: string }[] }
            revoke_child_device: { Args: { p_token: string; p_device_id: string }; Returns: undefined }

            "adjust_points":
{ Args: { "p_amount": number,"p_child_id": string,"p_reason": string,"p_token": string }; Returns: {
              "amount": number,
"child_id": string,
"completion_id": string | null,
"created_at": string,
"description": string,
"family_id": string,
"guardian_id": string | null,
"id": string,
"kind": Database["public"]['Enums']["statement_kind"],
"redemption_id": string | null,
"requested_amount": number
            }
                          SetofOptions: {
        from: "*"
        to: "statement_entries"
        isOneToOne: true
        isSetofReturn: false
      } },
"archive_profile":
{ Args: { "p_id": string,"p_token": string }; Returns: undefined
                           },
"archive_reward":
{ Args: { "p_id": string,"p_token": string }; Returns: undefined
                           },
"archive_routine":
{ Args: { "p_id": string,"p_token": string }; Returns: undefined
                           },
"archive_task":
{ Args: { "p_id": string,"p_token": string }; Returns: undefined
                           },
"complete_task":
{ Args: { "p_child_id": string,"p_task_id": string }; Returns: {
              "child_id": string,
"created_at": string,
"day": string,
"decided_at": string | null,
"decided_by": string | null,
"family_id": string,
"hint": string | null,
"id": string,
"points": number,
"status": Database["public"]['Enums']["completion_status"],
"task_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "completions"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_family":
{ Args: { "p_guardian_name": string,"p_name": string,"p_pin": string,"p_timezone": string }; Returns: {
              "archived_at": string | null,
"avatar": string,
"balance": number,
"color": string,
"family_id": string,
"id": string,
"kind": Database["public"]['Enums']["profile_kind"],
"name": string,
"read_aloud": boolean,
"reduced_motion": boolean,
"sounds": boolean
            }
                          SetofOptions: {
        from: "*"
        to: "profiles"
        isOneToOne: true
        isSetofReturn: false
      } },
"decide_completions":
{ Args: { "p_approve": boolean,"p_completion_ids": (string)[],"p_hint"?: string,"p_token": string }; Returns: {
              "child_id": string,
"created_at": string,
"day": string,
"decided_at": string | null,
"decided_by": string | null,
"family_id": string,
"hint": string | null,
"id": string,
"points": number,
"status": Database["public"]['Enums']["completion_status"],
"task_id": string
            }[]
                          SetofOptions: {
        from: "*"
        to: "completions"
        isOneToOne: false
        isSetofReturn: true
      } },
"decide_redemption":
{ Args: { "p_confirm": boolean,"p_redemption_id": string,"p_token": string }; Returns: {
              "child_id": string,
"cost": number,
"created_at": string,
"decided_at": string | null,
"decided_by": string | null,
"family_id": string,
"id": string,
"reward_id": string,
"status": Database["public"]['Enums']["redemption_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "redemptions"
        isOneToOne: true
        isSetofReturn: false
      } },
"end_guardian_session":
{ Args: { "p_token": string }; Returns: undefined
                           },
"request_redemption":
{ Args: { "p_child_id": string,"p_reward_id": string }; Returns: {
              "child_id": string,
"cost": number,
"created_at": string,
"decided_at": string | null,
"decided_by": string | null,
"family_id": string,
"id": string,
"reward_id": string,
"status": Database["public"]['Enums']["redemption_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "redemptions"
        isOneToOne: true
        isSetofReturn: false
      } },
"reverse_completion":
{ Args: { "p_completion_id": string,"p_token": string }; Returns: {
              "amount": number,
"child_id": string,
"completion_id": string | null,
"created_at": string,
"description": string,
"family_id": string,
"guardian_id": string | null,
"id": string,
"kind": Database["public"]['Enums']["statement_kind"],
"redemption_id": string | null,
"requested_amount": number
            }
                          SetofOptions: {
        from: "*"
        to: "statement_entries"
        isOneToOne: true
        isSetofReturn: false
      } },
"save_profile":
{ Args: { "p_avatar": string,"p_color": string,"p_id"?: string,"p_kind": Database["public"]['Enums']["profile_kind"],"p_name": string,"p_pin"?: string,"p_read_aloud": boolean,"p_reduced_motion": boolean,"p_sounds": boolean,"p_token": string }; Returns: {
              "archived_at": string | null,
"avatar": string,
"balance": number,
"color": string,
"family_id": string,
"id": string,
"kind": Database["public"]['Enums']["profile_kind"],
"name": string,
"read_aloud": boolean,
"reduced_motion": boolean,
"sounds": boolean
            }
                          SetofOptions: {
        from: "*"
        to: "profiles"
        isOneToOne: true
        isSetofReturn: false
      } },
"save_reward":
{ Args: { "p_cost": number,"p_icon": string,"p_id"?: string,"p_name": string,"p_token": string }; Returns: {
              "archived_at": string | null,
"cost": number,
"family_id": string,
"icon": string,
"id": string,
"name": string
            }
                          SetofOptions: {
        from: "*"
        to: "rewards"
        isOneToOne: true
        isSetofReturn: false
      } },
"save_routine":
{ Args: { "p_child_ids": (string)[],"p_id"?: string,"p_name": string,"p_token": string,"p_weekdays": (number)[] }; Returns: {
              "archived_at": string | null,
"child_ids": (string)[],
"family_id": string,
"id": string,
"name": string,
"position": number,
"weekdays": (number)[]
            }
                          SetofOptions: {
        from: "*"
        to: "routines"
        isOneToOne: true
        isSetofReturn: false
      } },
"save_task":
{ Args: { "p_child_ids"?: (string)[],"p_description": string,"p_icon": string,"p_id"?: string,"p_name": string,"p_one_off_date"?: string,"p_points": number,"p_requires_approval": boolean,"p_routine_id"?: string,"p_steps": Json,"p_token": string }; Returns: {
              "archived_at": string | null,
"child_ids": (string)[] | null,
"description": string,
"family_id": string,
"icon": string,
"id": string,
"name": string,
"one_off_date": string | null,
"points": number,
"position": number,
"requires_approval": boolean,
"routine_id": string | null,
"steps": NonNullable<Json>
            }
                          SetofOptions: {
        from: "*"
        to: "tasks"
        isOneToOne: true
        isSetofReturn: false
      } },
"set_routine_order":
{ Args: { "p_ids": (string)[],"p_token": string }; Returns: undefined
                           },
"set_task_order":
{ Args: { "p_routine_id": string,"p_task_ids": (string)[],"p_token": string }; Returns: undefined
                           },
"start_guardian_session":
{ Args: { "p_pin": string,"p_profile_id": string }; Returns: Json
                           },
"today_tasks":
{ Args: Record<PropertyKey, never>; Returns: {
              "child_id": string,"completion_id": string,"day": string,"description": string,"hint": string,"icon": string,"name": string,"points": number,"position": number,"rejected_by_name": string,"requires_approval": boolean,"routine_id": string,"routine_name": string,"routine_position": number,"status": Database["public"]['Enums']["task_status"],"steps": Json,"task_id": string
            }[]
                           },
"update_family":
{ Args: { "p_name": string,"p_timezone": string,"p_token": string }; Returns: {
              "id": string,
"name": string,
"timezone": string
            }
                          SetofOptions: {
        from: "*"
        to: "families"
        isOneToOne: true
        isSetofReturn: false
      } }
          }
          Enums: {
            "completion_status": "pending"|"approved"|"rejected"|"reversed","profile_kind": "guardian"|"child","redemption_status": "pending"|"confirmed"|"refused","statement_kind": "completion"|"adjustment"|"reversal"|"redemption","task_status": "todo"|"pending"|"done"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "completion_status": ["pending", "approved", "rejected", "reversed"],"profile_kind": ["guardian", "child"],"redemption_status": ["pending", "confirmed", "refused"],"statement_kind": ["completion", "adjustment", "reversal", "redemption"],"task_status": ["todo", "pending", "done"]
          }
        }
} as const
