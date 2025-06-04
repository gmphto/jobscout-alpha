'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client for components
export const createClient = () => createClientComponentClient<Database>()

// Types for Supabase database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          company: string | null
          position: string | null
          category: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          company?: string | null
          position?: string | null
          category?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          company?: string | null
          position?: string | null
          category?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      generated_content: {
        Row: {
          id: string
          prompt_id: string
          user_id: string
          bullet_points: any // JSON array
          skills: any // JSON array
          keywords: any // JSON array
          achievements: any // JSON array
          summary: string | null
          openai_model: string
          processing_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id: string
          bullet_points?: any
          skills?: any
          keywords?: any
          achievements?: any
          summary?: string | null
          openai_model?: string
          processing_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string
          bullet_points?: any
          skills?: any
          keywords?: any
          achievements?: any
          summary?: string | null
          openai_model?: string
          processing_time_ms?: number | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
} 