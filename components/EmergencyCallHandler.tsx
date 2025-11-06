'use client'

import { useState, useEffect } from 'react'
import { CallState } from '@/lib/voice-ai'

interface EmergencyCallHandlerProps {
  callState: CallState
  onEscalate?: () => void
}

export default function EmergencyCallHandler({ callState, onEscalate }: EmergencyCallHandlerProps) {
  const [escalated, setEscalated] = useState(false)
  const [technicianNotified, setTechnicianNotified] = useState(false)

  useEffect(() => {
    // Auto-escalate if critical emergency
    if (callState.emergencyDetected && callState.leadInfo.urgency === 'emergency' && callState.context.confidence && callState.context.confidence > 0.8) {
      if (!escalated) {
        handleEscalate()
      }
    }
  }, [callState.emergencyDetected, callState.leadInfo.urgency, callState.context.confidence])

  const handleEscalate = () => {
    setEscalated(true)
    onEscalate?.()
    // In production, this would trigger an API call to escalate to human operator
  }

  const handleNotifyTechnician = () => {
    setTechnicianNotified(true)
    // In production, this would trigger an API call to notify technician
  }

  if (!callState.emergencyDetected) {
    return null
  }

  const confidence = callState.context.confidence || 0
  const severity = confidence > 0.8 ? 'critical' : confidence > 0.5 ? 'high' : 'medium'

  return (
    <div className={`bg-red-50 border-2 ${
      severity === 'critical' ? 'border-red-600' : 'border-red-400'
    } rounded-lg p-4 mb-6 ${severity === 'critical' ? 'animate-pulse' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 ${
            severity === 'critical' ? 'bg-red-600' : 'bg-red-500'
          } rounded-full flex items-center justify-center animate-pulse`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-red-900">
              🚨 Emergency Call Detected
            </h3>
            {severity === 'critical' && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                CRITICAL
              </span>
            )}
          </div>
          <p className="text-sm text-red-700 mb-2">
            This call has been flagged as an emergency and is being prioritized.
            {confidence > 0 && (
              <span className="ml-2 text-xs">Confidence: {Math.round(confidence * 100)}%</span>
            )}
          </p>
          
          {/* Real-time Emergency Status */}
          {callState.stage === 'escalation' && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-2 mb-2">
              <p className="text-xs font-semibold text-yellow-800">
                ⚠️ Safety questions in progress - Collecting critical information
              </p>
            </div>
          )}

          <div className="bg-white rounded p-3 mt-2">
            <p className="text-xs font-semibold text-gray-700 mb-1">Emergency Details:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Urgency Level: <span className="font-semibold text-red-600">{callState.leadInfo.urgency?.toUpperCase() || 'EMERGENCY'}</span></li>
              {callState.leadInfo.issue && (
                <li>• Issue: {callState.leadInfo.issue}</li>
              )}
              {callState.leadInfo.address && (
                <li>• Address: {callState.leadInfo.address}</li>
              )}
              {callState.leadInfo.phone && (
                <li>• Phone: {callState.leadInfo.phone}</li>
              )}
              {callState.leadInfo.appointmentDate && (
                <li>• Emergency Appointment: {callState.leadInfo.appointmentDate} at {callState.leadInfo.appointmentTime || 'ASAP'}</li>
              )}
            </ul>
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={handleEscalate}
              disabled={escalated}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                escalated
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {escalated ? '✓ Escalated to Human' : 'Escalate to Human'}
            </button>
            <button
              onClick={handleNotifyTechnician}
              disabled={technicianNotified}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                technicianNotified
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              {technicianNotified ? '✓ Technician Notified' : 'Notify Technician'}
            </button>
            {callState.leadInfo.address && callState.leadInfo.phone && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
                Dispatch Now
              </button>
            )}
          </div>

          {/* Real-time Monitoring Status */}
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs font-semibold text-gray-600 mb-1">Real-time Monitoring:</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Active emergency detection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

