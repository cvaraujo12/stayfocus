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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_routines: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          duration_minutes: number
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          duration_minutes: number
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          duration_minutes?: number
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string | null
          frequency: string | null
          time_of_day: string[] | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage?: string | null
          frequency?: string | null
          time_of_day?: string[] | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string | null
          frequency?: string | null
          time_of_day?: string[] | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      routine_completions: {
        Row: {
          id: string
          routine_id: string
          completed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          routine_id: string
          completed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          routine_id?: string
          completed_at?: string
          notes?: string | null
        }
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          taken_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          medication_id: string
          taken_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          medication_id?: string
          taken_at?: string
          notes?: string | null
        }
      }
    }
  }
}
