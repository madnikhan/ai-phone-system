'use client'

import { DatabaseService } from './database'

export interface CallRecord {
  id: string
  timestamp: Date
  duration: number
  emergency: boolean
  emergencyDetected?: boolean
  emergencyConfidence?: number
  emergencySeverity?: 'critical' | 'high' | 'medium' | 'low'
  escalated?: boolean
  leadInfo: {
    name?: string
    phone?: string
    issue?: string
    urgency?: 'emergency' | 'urgent' | 'normal'
    appointmentDate?: string
    appointmentTime?: string
  }
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
  }>
  outcome: 'scheduled' | 'follow_up' | 'escalated' | 'no_show'
}

export class CallManager {
  private calls: CallRecord[] = []
  private database: DatabaseService | null = null
  private useDatabase: boolean = false

  constructor() {
    // Check if Supabase is configured
    if (typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        this.database = new DatabaseService()
        this.useDatabase = true
      }
    }
  }

  async saveCall(call: CallRecord) {
    this.calls.push(call)
    
    // Try to save to database first
    if (this.useDatabase && this.database) {
      try {
        await this.database.saveCall(call)
        return
      } catch (error) {
        console.error('Failed to save to database, falling back to localStorage:', error)
      }
    }

    // Fallback to localStorage for demo/development
    if (typeof window !== 'undefined') {
      try {
        const savedCalls = this.getSavedCalls()
        savedCalls.push({
          ...call,
          timestamp: call.timestamp.toISOString(),
          conversationHistory: call.conversationHistory.map((msg) => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
          })),
        })
        localStorage.setItem('callRecords', JSON.stringify(savedCalls))
      } catch (error) {
        console.error('Failed to save call:', error)
      }
    }
  }

  getSavedCalls(): any[] {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('callRecords')
        return saved ? JSON.parse(saved) : []
      } catch (error) {
        console.error('Failed to load calls:', error)
        return []
      }
    }
    return []
  }

  async getAllCalls(): Promise<CallRecord[]> {
    // Try to get from database first
    if (this.useDatabase && this.database) {
      try {
        return await this.database.getAllCalls()
      } catch (error) {
        console.error('Failed to fetch from database, falling back to localStorage:', error)
      }
    }

    // Fallback to localStorage
    const saved = this.getSavedCalls()
    return saved.map((call: any) => ({
      ...call,
      timestamp: new Date(call.timestamp),
      conversationHistory: call.conversationHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }))
  }

  async getEmergencyCalls(): Promise<CallRecord[]> {
    if (this.useDatabase && this.database) {
      try {
        return await this.database.getEmergencyCalls()
      } catch (error) {
        console.error('Failed to fetch emergency calls from database:', error)
      }
    }

    const allCalls = await this.getAllCalls()
    return allCalls.filter((call) => call.emergency || call.emergencyDetected)
  }

  async getCriticalEmergencies(): Promise<CallRecord[]> {
    if (this.useDatabase && this.database) {
      try {
        return await this.database.getCriticalEmergencies()
      } catch (error) {
        console.error('Failed to fetch critical emergencies from database:', error)
      }
    }

    const allCalls = await this.getAllCalls()
    return allCalls.filter(
      (call) => call.emergencySeverity === 'critical' || (call.emergencyConfidence && call.emergencyConfidence > 0.8)
    )
  }

  async getCallStats() {
    if (this.useDatabase && this.database) {
      try {
        return await this.database.getCallStats()
      } catch (error) {
        console.error('Failed to get stats from database:', error)
      }
    }

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
      avgDuration: allCalls.length > 0
        ? allCalls.reduce((sum, c) => sum + c.duration, 0) / allCalls.length
        : 0,
      avgEmergencyConfidence: emergencyCalls.length > 0
        ? emergencyCalls.reduce((sum, c) => sum + (c.emergencyConfidence || 0), 0) / emergencyCalls.length
        : 0,
    }
  }

  async clearAllCalls() {
    this.calls = []
    
    if (this.useDatabase && this.database) {
      try {
        await this.database.clearAllCalls()
        return
      } catch (error) {
        console.error('Failed to clear calls from database:', error)
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('callRecords')
    }
  }
}

