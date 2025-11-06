'use client'

import { useState, useEffect } from 'react'
import { CallManager } from '@/lib/call-manager'

interface CallAnalyticsProps {
  callHistory?: any[]
}

export default function CallAnalytics({ callHistory: externalHistory }: CallAnalyticsProps) {
  const [callHistory, setCallHistory] = useState<any[]>([])
  const [selectedCall, setSelectedCall] = useState<any | null>(null)
  const callManager = new CallManager()

  useEffect(() => {
    const loadCalls = () => {
      if (externalHistory && externalHistory.length > 0) {
        setCallHistory(externalHistory)
      } else {
        const calls = callManager.getAllCalls()
        setCallHistory(calls)
      }
    }

    loadCalls()
    
    // Refresh every 5 seconds
    const interval = setInterval(loadCalls, 5000)
    return () => clearInterval(interval)
  }, [externalHistory])

  const stats = callManager.getCallStats()
  const emergencyCalls = callHistory.filter(call => call.emergency || call.emergencyDetected)
  const criticalEmergencies = callHistory.filter(
    call => call.emergencySeverity === 'critical' || (call.emergencyConfidence && call.emergencyConfidence > 0.8)
  )
  const escalatedCalls = callHistory.filter(call => call.escalated)
  const scheduledCalls = callHistory.filter(call => call.outcome === 'scheduled')

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold mb-1">{stats.total}</div>
          <div className="text-sm opacity-90">Total Calls</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold mb-1">{stats.emergencies}</div>
          <div className="text-sm opacity-90">Emergency Calls</div>
        </div>
        <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold mb-1">{stats.criticalEmergencies}</div>
          <div className="text-sm opacity-90">Critical Emergencies</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold mb-1">{stats.escalated}</div>
          <div className="text-sm opacity-90">Escalated</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold mb-1">{stats.scheduled}</div>
          <div className="text-sm opacity-90">Scheduled</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold mb-1">{Math.round(stats.avgDuration)}s</div>
          <div className="text-sm opacity-90">Avg Duration</div>
        </div>
      </div>

      {/* Call List */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Call History</h2>
        {callHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No calls recorded yet.</p>
            <p className="text-sm mt-2">Make a demo call to see analytics here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {callHistory
              .sort((a, b) => {
                const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp
                const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp
                return dateB.getTime() - dateA.getTime()
              })
              .map((call) => (
                <div
                  key={call.id}
                  className={`bg-white rounded-lg p-4 border-2 cursor-pointer transition-all hover:shadow-md ${
                    call.emergency || call.emergencyDetected
                      ? call.emergencySeverity === 'critical'
                        ? 'border-red-600 bg-red-100'
                        : 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  } ${selectedCall?.id === call.id ? 'ring-2 ring-primary-500' : ''}`}
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-700">
                      {formatDate(call.timestamp)}
                    </span>
                    {(call.emergency || call.emergencyDetected) && (
                      <span className={`px-2 py-1 text-white text-xs font-bold rounded ${
                        call.emergencySeverity === 'critical' 
                          ? 'bg-red-600 animate-pulse' 
                          : call.emergencySeverity === 'high'
                          ? 'bg-red-500'
                          : 'bg-red-400'
                      }`}>
                        🚨 {call.emergencySeverity === 'critical' ? 'CRITICAL EMERGENCY' : 'EMERGENCY'}
                      </span>
                    )}
                    {call.escalated && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                        ESCALATED
                      </span>
                    )}
                    {call.outcome === 'scheduled' && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                        SCHEDULED
                      </span>
                    )}
                    {call.emergencyConfidence && (
                      <span className="text-xs text-gray-500">
                        Confidence: {Math.round(call.emergencyConfidence * 100)}%
                      </span>
                    )}
                  </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Duration: {formatDuration(call.duration)}</p>
                        {call.leadInfo.issue && (
                          <p>Issue: {call.leadInfo.issue}</p>
                        )}
                        {call.leadInfo.appointmentDate && (
                          <p className="text-green-700 font-semibold">
                            📅 Appointment: {call.leadInfo.appointmentDate} at {call.leadInfo.appointmentTime || 'TBD'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Call Details</h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Date & Time</p>
                  <p className="text-gray-800">{formatDate(selectedCall.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Duration</p>
                  <p className="text-gray-800">{formatDuration(selectedCall.duration)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Emergency</p>
                  <p className="text-gray-800">{selectedCall.emergency ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Outcome</p>
                  <p className="text-gray-800">{selectedCall.outcome || 'N/A'}</p>
                </div>
              </div>

              {selectedCall.leadInfo && Object.keys(selectedCall.leadInfo).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Lead Information</p>
                  <div className="bg-gray-50 rounded p-4 space-y-2">
                    {selectedCall.leadInfo.name && (
                      <p><span className="font-semibold">Name:</span> {selectedCall.leadInfo.name}</p>
                    )}
                    {selectedCall.leadInfo.phone && (
                      <p><span className="font-semibold">Phone:</span> {selectedCall.leadInfo.phone}</p>
                    )}
                    {selectedCall.leadInfo.issue && (
                      <p><span className="font-semibold">Issue:</span> {selectedCall.leadInfo.issue}</p>
                    )}
                    {selectedCall.leadInfo.urgency && (
                      <p><span className="font-semibold">Urgency:</span> {selectedCall.leadInfo.urgency}</p>
                    )}
                    {selectedCall.leadInfo.appointmentDate && (
                      <p><span className="font-semibold">Appointment:</span> {selectedCall.leadInfo.appointmentDate} at {selectedCall.leadInfo.appointmentTime || 'TBD'}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedCall.conversationHistory && selectedCall.conversationHistory.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Full Transcript</p>
                  <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      {selectedCall.conversationHistory.map((message: any, index: number) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDate(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

