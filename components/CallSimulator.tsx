'use client'

import { useState, useEffect, useRef } from 'react'
import { VoiceAI } from '@/lib/voice-ai'
import { SpeechToText, TextToSpeech } from '@/lib/stt-tts'
import { CallManager } from '@/lib/call-manager'
import EmergencyCallHandler from './EmergencyCallHandler'

interface CallSimulatorProps {
  onCallComplete?: (callData: any) => void
}

export default function CallSimulator({ onCallComplete }: CallSimulatorProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcript, setTranscript] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: Date }>>([])
  const [currentScenario, setCurrentScenario] = useState<string>('')
  
  const voiceAI = useRef(new VoiceAI())
  const stt = useRef(new SpeechToText())
  const tts = useRef(new TextToSpeech())
  const callManager = useRef(new CallManager())
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const callStartTime = useRef<Date | null>(null)

  const scenarios = [
    {
      name: 'Emergency Roof Leak',
      description: 'Customer reports active water leak',
      messages: [
        "Yes, it's an emergency! Water is actively coming in through my roof!",
        "It's been leaking for about an hour now. Can you send someone immediately?",
      ],
    },
    {
      name: 'General Inspection',
      description: 'Customer wants a roof inspection',
      messages: [
        "No, it's not an emergency. I'd like to schedule a roof inspection.",
        "I noticed some shingles are missing after the recent storm.",
        "How about tomorrow morning around 10am?",
      ],
    },
    {
      name: 'Price Estimation',
      description: 'Customer wants a quote',
      messages: [
        "No emergency. I'm looking for a quote on roof replacement.",
        "My roof is about 20 years old and showing signs of wear.",
        "I'm available this Friday afternoon if that works.",
      ],
    },
    {
      name: 'Follow-up Call',
      description: 'Existing customer follow-up',
      messages: [
        "Hi, I'm following up on the repair you did last month.",
        "Everything looks good, but I wanted to schedule a maintenance check.",
        "Next week sometime would be great.",
      ],
    },
  ]

  useEffect(() => {
    if (isCallActive && callStartTime.current) {
      durationInterval.current = setInterval(() => {
        if (callStartTime.current) {
          const elapsed = Math.floor((Date.now() - callStartTime.current.getTime()) / 1000)
          setCallDuration(elapsed)
        }
      }, 1000)
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
        durationInterval.current = null
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }, [isCallActive])

  const startCall = (scenario?: typeof scenarios[0]) => {
    setIsCallActive(true)
    setIsRecording(true)
    setCallDuration(0)
    callStartTime.current = new Date()
    transcript.length = 0
    setTranscript([])
    voiceAI.current.reset()

    // Start with greeting
    const greeting = voiceAI.current.getGreeting()
    setTranscript([{ role: 'assistant', text: greeting, timestamp: new Date() }])
    
    // Speak greeting
    tts.current.speak(greeting, () => {
      // Start listening after greeting
      if (!isMuted) {
        stt.current.start(
          (text) => handleUserInput(text),
          (error) => console.error('STT Error:', error)
        )
      }
    })

    if (scenario) {
      setCurrentScenario(scenario.name)
    }
  }

  const handleUserInput = (userText: string) => {
    if (!userText.trim() || isMuted) return

    // Add user message to transcript
    const userMessage = { role: 'user' as const, text: userText, timestamp: new Date() }
    setTranscript((prev) => [...prev, userMessage])

    // Process with AI
    const aiResponse = voiceAI.current.processUserInput(userText)
    
    // Add AI response to transcript
    const aiMessage = { role: 'assistant' as const, text: aiResponse, timestamp: new Date() }
    setTranscript((prev) => [...prev, aiMessage])

    // Speak AI response
    tts.current.speak(aiResponse, () => {
      // Continue listening
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
    setIsRecording(false)
    stt.current.stop()
    tts.current.stop()

    if (durationInterval.current) {
      clearInterval(durationInterval.current)
      durationInterval.current = null
    }

    // Save call record with emergency detection data
    const callState = voiceAI.current.getCallState()
    const emergencyDetection = callState.emergencyDetected 
      ? voiceAI.current.detectEmergency(
          callState.conversationHistory
            .filter(msg => msg.role === 'user')
            .map(msg => msg.text)
            .join(' ')
        )
      : null
    
    const callRecord = {
      id: `call-${Date.now()}`,
      timestamp: callStartTime.current || new Date(),
      duration: callDuration,
      emergency: callState.emergencyDetected,
      emergencyDetected: callState.emergencyDetected,
      emergencyConfidence: emergencyDetection?.confidence || callState.context.confidence,
      emergencySeverity: emergencyDetection?.severity,
      escalated: callState.stage === 'escalation',
      leadInfo: callState.leadInfo,
      conversationHistory: callState.conversationHistory,
      outcome: callState.leadInfo.appointmentDate 
        ? 'scheduled' 
        : callState.stage === 'escalation' 
          ? 'escalated' 
          : 'follow_up',
    }

    callManager.current.saveCall(callRecord)
    onCallComplete?.(callRecord)

    // Reset
    setCallDuration(0)
    setTranscript([])
    setCurrentScenario('')
    callStartTime.current = null
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

  const simulateScenario = (scenario: typeof scenarios[0]) => {
    if (isCallActive) return
    
    const scenarioName = scenario.name
    startCall(scenario)
    
    // Simulate user messages with delays after greeting finishes
    // Use a closure to capture the scenario name
    scenario.messages.forEach((message, index) => {
      setTimeout(() => {
        // Get fresh state to check if call is still active
        const currentState = voiceAI.current.getCallState()
        if (currentState.stage !== 'closing') {
          handleUserInput(message)
        }
      }, (index + 1) * 4000 + 3000) // Delay to allow greeting to finish
    })
  }

  return (
    <div className="space-y-6">
      {/* Emergency Handler */}
      {isCallActive && voiceAI.current.getCallState().emergencyDetected && (
        <EmergencyCallHandler callState={voiceAI.current.getCallState()} />
      )}

      {/* Demo Scenarios */}
      {!isCallActive && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Try Demo Scenarios:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => simulateScenario(scenario)}
                className="p-4 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg border border-primary-200 hover:border-primary-400 hover:shadow-md transition-all text-left"
              >
                <h4 className="font-semibold text-primary-900 mb-1">{scenario.name}</h4>
                <p className="text-sm text-gray-600">{scenario.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Phone Interface */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-gray-200">
        <div className="max-w-md mx-auto">
          {/* Call Status */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto rounded-full mb-4 flex items-center justify-center ${
              isCallActive ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`}>
              <span className="text-white text-2xl">📞</span>
            </div>
            {isCallActive ? (
              <div>
                <p className="text-lg font-semibold text-gray-800">Call In Progress</p>
                <p className="text-2xl font-mono text-primary-600 mt-2">{formatDuration(callDuration)}</p>
                {currentScenario && (
                  <p className="text-sm text-gray-500 mt-1">Scenario: {currentScenario}</p>
                )}
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
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                aria-label="Start call"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${
                    isMuted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                  aria-label="End call"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 text-red-600 text-sm font-medium">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                Recording
              </span>
            </div>
          )}

          {/* Transcript */}
          <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Conversation Transcript</h3>
            {transcript.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No conversation yet. Start a call to begin.</p>
            ) : (
              <div className="space-y-3">
                {transcript.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Browser Support Warning */}
          {!stt.current.isSupported() && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

