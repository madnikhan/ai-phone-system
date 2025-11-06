import { CallRecord } from './call-manager'
import { createServerClient } from './supabase-server'

/**
 * Database service for call records
 * Uses Supabase PostgreSQL for persistent storage
 */
export class DatabaseService {
  private getSupabase() {
    // Check if we're on the server or client
    if (typeof window === 'undefined') {
      // Server-side: use server client
      return createServerClient()
    } else {
      // Client-side: use client import
      const { supabase } = require('./supabase')
      return supabase
    }
  }
  /**
   * Save a call record to the database
   */
  async saveCall(call: CallRecord): Promise<CallRecord | null> {
    try {
      const supabase = this.getSupabase()
      if (!supabase) {
        console.warn('Supabase not configured')
        return null
      }

      const { data, error } = await supabase
        .from('calls')
        .insert({
          id: call.id,
          timestamp: call.timestamp.toISOString(),
          duration: call.duration,
          emergency: call.emergency,
          emergency_detected: call.emergencyDetected,
          emergency_confidence: call.emergencyConfidence,
          emergency_severity: call.emergencySeverity,
          escalated: call.escalated,
          lead_info: call.leadInfo,
          conversation_history: call.conversationHistory.map((msg) => ({
            role: msg.role,
            text: msg.text,
            timestamp: msg.timestamp.toISOString(),
          })),
          outcome: call.outcome,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving call to database:', error)
        return null
      }

      // Convert back to CallRecord format
      return this.mapToCallRecord(data)
    } catch (error) {
      console.error('Failed to save call:', error)
      return null
    }
  }

  /**
   * Get all call records
   */
  async getAllCalls(): Promise<CallRecord[]> {
    try {
      const supabase = this.getSupabase()
      if (!supabase) {
        console.warn('Supabase not configured')
        return []
      }

      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching calls:', error)
        return []
      }

      return data.map((record: any) => this.mapToCallRecord(record))
    } catch (error) {
      console.error('Failed to fetch calls:', error)
      return []
    }
  }

  /**
   * Get emergency calls
   */
  async getEmergencyCalls(): Promise<CallRecord[]> {
    try {
      const supabase = this.getSupabase()
      if (!supabase) {
        console.warn('Supabase not configured')
        return []
      }

      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or('emergency.eq.true,emergency_detected.eq.true')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching emergency calls:', error)
        return []
      }

      return data.map((record: any) => this.mapToCallRecord(record))
    } catch (error) {
      console.error('Failed to fetch emergency calls:', error)
      return []
    }
  }

  /**
   * Get critical emergencies
   */
  async getCriticalEmergencies(): Promise<CallRecord[]> {
    try {
      const supabase = this.getSupabase()
      if (!supabase) {
        console.warn('Supabase not configured')
        return []
      }

      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or('emergency_severity.eq.critical,emergency_confidence.gt.0.8')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching critical emergencies:', error)
        return []
      }

      return data.map((record: any) => this.mapToCallRecord(record))
    } catch (error) {
      console.error('Failed to fetch critical emergencies:', error)
      return []
    }
  }

  /**
   * Get call statistics
   */
  async getCallStats() {
    try {
      const allCalls = await this.getAllCalls()
      const emergencyCalls = allCalls.filter((c) => c.emergency || c.emergencyDetected)
      const criticalEmergencies = allCalls.filter(
        (c) => c.emergencySeverity === 'critical' || (c.emergencyConfidence && c.emergencyConfidence > 0.8)
      )
      const escalatedCalls = allCalls.filter((c) => c.escalated)

      return {
        total: allCalls.length,
        emergencies: emergencyCalls.length,
        criticalEmergencies: criticalEmergencies.length,
        escalated: escalatedCalls.length,
        scheduled: allCalls.filter((c) => c.outcome === 'scheduled').length,
        avgDuration:
          allCalls.length > 0
            ? allCalls.reduce((sum, c) => sum + c.duration, 0) / allCalls.length
            : 0,
        avgEmergencyConfidence:
          emergencyCalls.length > 0
            ? emergencyCalls.reduce((sum, c) => sum + (c.emergencyConfidence || 0), 0) / emergencyCalls.length
            : 0,
      }
    } catch (error) {
      console.error('Failed to get call stats:', error)
      return {
        total: 0,
        emergencies: 0,
        criticalEmergencies: 0,
        escalated: 0,
        scheduled: 0,
        avgDuration: 0,
        avgEmergencyConfidence: 0,
      }
    }
  }

  /**
   * Delete all calls (for testing/cleanup)
   */
  async clearAllCalls(): Promise<boolean> {
    try {
      const supabase = this.getSupabase()
      if (!supabase) {
        console.warn('Supabase not configured')
        return false
      }

      const { error } = await supabase.from('calls').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        console.error('Error clearing calls:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to clear calls:', error)
      return false
    }
  }

  /**
   * Map database record to CallRecord format
   */
  private mapToCallRecord(record: any): CallRecord {
    return {
      id: record.id,
      timestamp: new Date(record.timestamp),
      duration: record.duration,
      emergency: record.emergency,
      emergencyDetected: record.emergency_detected,
      emergencyConfidence: record.emergency_confidence,
      emergencySeverity: record.emergency_severity,
      escalated: record.escalated,
      leadInfo: record.lead_info || {},
      conversationHistory: (record.conversation_history || []).map((msg: any) => ({
        role: msg.role,
        text: msg.text,
        timestamp: new Date(msg.timestamp),
      })),
      outcome: record.outcome,
    }
  }
}

