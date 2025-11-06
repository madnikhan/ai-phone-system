'use client'

import { useState, useRef } from 'react'
import { VoiceAI } from '@/lib/voice-ai'
import { SpeechToText, TextToSpeech } from '@/lib/stt-tts'
import EmergencyCallHandler from '../EmergencyCallHandler'

const scenarios = [
  {
    id: 'emergency',
    name: 'Emergency Roof Leak',
    description: 'Customer reports active water leak',
    avatar: '🚨',
    phoneNumber: '(555) 123-4567',
    messages: [
      "Yes, it's an emergency! Water is actively coming in through my roof!",
      "It's been leaking for about an hour now. Can you send someone immediately?",
    ],
  },
  {
    id: 'inspection',
    name: 'General Inspection',
    description: 'Customer wants a roof inspection',
    avatar: '🏠',
    phoneNumber: '(555) 234-5678',
    messages: [
      "No, it's not an emergency. I'd like to schedule a roof inspection.",
      "I noticed some shingles are missing after the recent storm.",
      "How about tomorrow morning around 10am?",
    ],
  },
  {
    id: 'pricing',
    name: 'Price Estimation',
    description: 'Customer wants a quote',
    avatar: '💰',
    phoneNumber: '(555) 345-6789',
    messages: [
      "No emergency. I'm looking for a quote on roof replacement.",
      "My roof is about 20 years old and showing signs of wear.",
      "I'm available this Friday afternoon if that works.",
    ],
  },
]

export default function CompactPhoneDemo() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcript, setTranscript] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: Date }>>([])
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null)
  
  const voiceAI = useRef(new VoiceAI())
  const stt = useRef(new SpeechToText())
  const tts = useRef(new TextToSpeech())
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const callStartTime = useRef<Date | null>(null)

  const startCall = (scenario?: typeof scenarios[0]) => {
    setIsCallActive(true)
    setCallDuration(0)
    setTranscript([])
    callStartTime.current = new Date()
    voiceAI.current.reset()

    if (scenario) {
      setSelectedScenario(scenario)
    }

    // Start with greeting
    const greeting = voiceAI.current.getGreeting()
    setTranscript([{ role: 'assistant', text: greeting, timestamp: new Date() }])
    
    tts.current.speak(greeting, () => {
      if (!isMuted) {
        stt.current.start(
          (text) => handleUserInput(text),
          (error) => console.error('STT Error:', error)
        )
      }
    })

    // Start duration timer
    durationInterval.current = setInterval(() => {
      if (callStartTime.current) {
        const elapsed = Math.floor((Date.now() - callStartTime.current.getTime()) / 1000)
        setCallDuration(elapsed)
      }
    }, 1000)

    // Simulate scenario messages if provided
    if (scenario) {
      scenario.messages.forEach((message, index) => {
        setTimeout(() => {
          // Check if call is still active using call state
          const currentState = voiceAI.current.getCallState()
          if (currentState.stage !== 'closing') {
            handleUserInput(message)
          }
        }, (index + 1) * 5000 + 3000)
      })
    }
  }

  const handleUserInput = (userText: string) => {
    if (!userText.trim() || isMuted) return

    const userMessage = { role: 'user' as const, text: userText, timestamp: new Date() }
    setTranscript((prev) => [...prev, userMessage])

    const aiResponse = voiceAI.current.processUserInput(userText)
    const aiMessage = { role: 'assistant' as const, text: aiResponse, timestamp: new Date() }
    setTranscript((prev) => [...prev, aiMessage])

    tts.current.speak(aiResponse, () => {
      if (isCallActive && !isMuted) {
        stt.current.start(
          (text) => handleUserInput(text),
          (error) => console.error('STT Error:', error)
        )
      }
    })
  }

  const endCall = () => {
    setIsCallActive(false)
    stt.current.stop()
    tts.current.stop()

    if (durationInterval.current) {
      clearInterval(durationInterval.current)
      durationInterval.current = null
    }

    setTimeout(() => {
      setCallDuration(0)
      setTranscript([])
      setSelectedScenario(null)
      callStartTime.current = null
    }, 2000)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      stt.current.stop()
    } else if (isCallActive) {
      stt.current.start(
        (text) => handleUserInput(text),
        (error) => console.error('STT Error:', error)
      )
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Demo Scenarios */}
      {!isCallActive && (
        <div className="p-6 bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-primary-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Common Scenarios:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => startCall(scenario)}
                className="p-4 bg-white rounded-lg border-2 border-primary-200 hover:border-primary-400 hover:shadow-md transition-all text-left"
              >
                <div className="text-3xl mb-2">{scenario.avatar}</div>
                <h4 className="font-semibold text-primary-900 mb-1">{scenario.name}</h4>
                <p className="text-sm text-gray-600">{scenario.description}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => startCall()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Free Call Demo
            </button>
          </div>
        </div>
      )}

      {/* Phone Interface */}
      <div className="p-6">
        {isCallActive && voiceAI.current.getCallState().emergencyDetected && (
          <div className="mb-4">
            <EmergencyCallHandler callState={voiceAI.current.getCallState()} />
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
          <div className="max-w-md mx-auto">
            {/* Call Status */}
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full mb-4 flex items-center justify-center ${
                isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}>
                {selectedScenario ? (
                  <span className="text-4xl">{selectedScenario.avatar}</span>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
              </div>
              {isCallActive ? (
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedScenario?.name || 'Call In Progress'}
                  </p>
                  <p className="text-2xl font-mono text-primary-600 mt-2">{formatDuration(callDuration)}</p>
                </div>
              ) : (
                <p className="text-lg font-semibold text-gray-600">Ready to Call</p>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex justify-center gap-4 mb-6">
              {!isCallActive ? (
                <button
                  onClick={() => startCall()}
                  className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isMuted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {isMuted ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={endCall}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Conversation</h3>
              {transcript.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Start a call to see the conversation...</p>
              ) : (
                <div className="space-y-3">
                  {transcript.slice(-5).map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

