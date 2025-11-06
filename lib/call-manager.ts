'use client'

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

  saveCall(call: CallRecord) {
    this.calls.push(call)
    // In a real app, this would save to a database
    // For demo, we'll store in localStorage
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

  getAllCalls(): CallRecord[] {
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

  getEmergencyCalls(): CallRecord[] {
    return this.getAllCalls().filter((call) => call.emergency || call.emergencyDetected)
  }

  getCriticalEmergencies(): CallRecord[] {
    return this.getAllCalls().filter(
      (call) => call.emergencySeverity === 'critical' || (call.emergencyConfidence && call.emergencyConfidence > 0.8)
    )
  }

  getCallStats() {
    const allCalls = this.getAllCalls()
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

  clearAllCalls() {
    this.calls = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('callRecords')
    }
  }
}

