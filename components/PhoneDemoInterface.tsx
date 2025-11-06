'use client'

import { useState, useEffect } from 'react'
import CallSimulator from './CallSimulator'
import PhoneCallSimulator from './PhoneCallSimulator'
import CallAnalytics from './CallAnalytics'

export default function PhoneDemoInterface() {
  const [activeTab, setActiveTab] = useState<'call' | 'analytics'>('call')
  const [callView, setCallView] = useState<'phone' | 'standard'>('phone')
  const [callHistory, setCallHistory] = useState<any[]>([])

  useEffect(() => {
    // Load call history (will try database first, then localStorage)
    const loadCalls = async () => {
      try {
        const callManager = new (await import('@/lib/call-manager')).CallManager()
        const calls = await callManager.getAllCalls()
        setCallHistory(calls)
      } catch (error) {
        console.error('Failed to load call history:', error)
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem('callRecords')
          if (saved) {
            setCallHistory(JSON.parse(saved))
          }
        } catch (e) {
          console.error('Failed to load from localStorage:', e)
        }
      }
    }
    loadCalls()
  }, [])

  const handleCallComplete = (callData: any) => {
    setCallHistory((prev) => [...prev, callData])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI Phone System Demo
            </h1>
            <p className="text-lg text-gray-600">
              Experience AI-powered call handling for roofing companies
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 gap-4 flex-wrap">
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
              <button
                onClick={() => setActiveTab('call')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                  activeTab === 'call'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Make Call
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </div>
            
            {activeTab === 'call' && (
              <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                <button
                  onClick={() => setCallView('phone')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    callView === 'phone'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📱 Phone UI
                </button>
                <button
                  onClick={() => setCallView('standard')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    callView === 'standard'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🖥️ Standard
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className={activeTab === 'call' && callView === 'phone' ? '' : 'bg-white rounded-xl shadow-lg p-6'}>
            {activeTab === 'call' ? (
              callView === 'phone' ? (
                <PhoneCallSimulator onCallComplete={handleCallComplete} />
              ) : (
                <CallSimulator onCallComplete={handleCallComplete} />
              )
            ) : (
              <CallAnalytics callHistory={callHistory} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

