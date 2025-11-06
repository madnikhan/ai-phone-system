'use client'

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      calls: {
        Row: {
          id: string
          created_at: string
          timestamp: string
          duration: number
          emergency: boolean
          emergency_detected: boolean | null
          emergency_confidence: number | null
          emergency_severity: 'critical' | 'high' | 'medium' | 'low' | null
          escalated: boolean | null
          lead_info: {
            name?: string
            phone?: string
            email?: string
            address?: string
            issue?: string
            issue_type?: string
            urgency?: 'emergency' | 'urgent' | 'normal'
            property_type?: string
            roof_age?: string
            appointment_date?: string
            appointment_time?: string
            preferred_contact?: string
          }
          conversation_history: Array<{
            role: 'user' | 'assistant'
            text: string
            timestamp: string
          }>
          outcome: 'scheduled' | 'follow_up' | 'escalated' | 'no_show'
        }
        Insert: {
          id?: string
          created_at?: string
          timestamp: string
          duration: number
          emergency: boolean
          emergency_detected?: boolean | null
          emergency_confidence?: number | null
          emergency_severity?: 'critical' | 'high' | 'medium' | 'low' | null
          escalated?: boolean | null
          lead_info?: any
          conversation_history?: any
          outcome: 'scheduled' | 'follow_up' | 'escalated' | 'no_show'
        }
        Update: {
          id?: string
          created_at?: string
          timestamp?: string
          duration?: number
          emergency?: boolean
          emergency_detected?: boolean | null
          emergency_confidence?: number | null
          emergency_severity?: 'critical' | 'high' | 'medium' | 'low' | null
          escalated?: boolean | null
          lead_info?: any
          conversation_history?: any
          outcome?: 'scheduled' | 'follow_up' | 'escalated' | 'no_show'
        }
      }
    }
  }
}

