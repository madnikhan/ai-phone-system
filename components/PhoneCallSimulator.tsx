'use client'

import { useState, useEffect, useRef } from 'react'
import { VoiceAI } from '@/lib/voice-ai'
import { SpeechToText, TextToSpeech } from '@/lib/stt-tts'
import { CallManager } from '@/lib/call-manager'

interface PhoneCallSimulatorProps {
  onCallComplete?: (callData: any) => void
}

type CallStatus = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended'

interface DemoScenario {
  id: string
  name: string
  description: string
  phoneNumber: string
  avatar: string
  messages: string[]
  type: 'emergency' | 'inquiry' | 'pricing'
}

export default function PhoneCallSimulator({ onCallComplete }: PhoneCallSimulatorProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcript, setTranscript] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: Date }>>([])
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showKeypad, setShowKeypad] = useState(false)
  
  const voiceAI = useRef(new VoiceAI())
  const stt = useRef(new SpeechToText())
  const tts = useRef(new TextToSpeech())
  const callManager = useRef(new CallManager())
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const callStartTime = useRef<Date | null>(null)
  const ringingTimeout = useRef<NodeJS.Timeout | null>(null)

  const scenarios: DemoScenario[] = [
    {
      id: 'emergency-leak',
      name: 'Emergency Roof Leak',
      description: 'Active water leak - urgent',
      phoneNumber: '(555) 123-4567',
      avatar: '🚨',
      messages: [
        "Yes, it's an emergency! Water is actively coming in through my roof!",
        "It's been leaking for about an hour now. Can you send someone immediately?",
        "I'm at 123 Main Street. How soon can someone get here?",
      ],
      type: 'emergency',
    },
    {
      id: 'general-inquiry',
      name: 'General Inspection',
      description: 'Roof inspection request',
      phoneNumber: '(555) 234-5678',
      avatar: '🏠',
      messages: [
        "No, it's not an emergency. I'd like to schedule a roof inspection.",
        "I noticed some shingles are missing after the recent storm.",
        "How about tomorrow morning around 10am?",
      ],
      type: 'inquiry',
    },
    {
      id: 'pricing',
      name: 'Price Estimation',
      description: 'Roof replacement quote',
      phoneNumber: '(555) 345-6789',
      avatar: '💰',
      messages: [
        "No emergency. I'm looking for a quote on roof replacement.",
        "My roof is about 20 years old and showing signs of wear.",
        "I'm available this Friday afternoon if that works.",
      ],
      type: 'pricing',
    },
  ]

  useEffect(() => {
    if (callStatus === 'active' && callStartTime.current) {
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
      if (ringingTimeout.current) {
        clearTimeout(ringingTimeout.current)
      }
    }
  }, [callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatPhoneNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  const handleKeypadInput = (digit: string) => {
    if (callStatus !== 'idle') return
    setPhoneNumber((prev) => {
      const newNum = prev + digit
      return newNum.length <= 10 ? newNum : prev
    })
  }

  const handleDelete = () => {
    if (callStatus !== 'idle') return
    setPhoneNumber((prev) => prev.slice(0, -1))
  }

  const startCall = (scenario?: DemoScenario) => {
    const number = scenario?.phoneNumber || phoneNumber
    if (!number && !scenario) return

    if (scenario) {
      setSelectedScenario(scenario)
      setPhoneNumber(scenario.phoneNumber.replace(/\D/g, ''))
    }

    setCallStatus('ringing')
    setCallDuration(0)
    setTranscript([])
    voiceAI.current.reset()

    // Simulate ringing for 2 seconds
    ringingTimeout.current = setTimeout(() => {
      setCallStatus('connecting')
      
      // After connecting, start the call
      setTimeout(() => {
        setCallStatus('active')
        callStartTime.current = new Date()
        
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

        // If scenario, simulate user messages
        if (scenario) {
          scenario.messages.forEach((message, index) => {
            setTimeout(() => {
              const currentState = voiceAI.current.getCallState()
              if (currentState.stage !== 'closing') {
                handleUserInput(message)
              }
            }, (index + 1) * 5000 + 3000)
          })
        }
      }, 1000)
    }, 2000)
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
      if (callStatus === 'active' && !isMuted) {
        stt.current.start(
          (text) => handleUserInput(text),
          (error) => console.error('STT Error:', error)
        )
      }
    })
  }

  const endCall = () => {
    setCallStatus('ended')
    stt.current.stop()
    tts.current.stop()

    if (durationInterval.current) {
      clearInterval(durationInterval.current)
      durationInterval.current = null
    }
    if (ringingTimeout.current) {
      clearTimeout(ringingTimeout.current)
      ringingTimeout.current = null
    }

    // Save call record with emergency detection data
    if (callStartTime.current) {
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
        timestamp: callStartTime.current,
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
    }

    // Reset after 2 seconds
    setTimeout(() => {
      resetCall()
    }, 2000)
  }

  const resetCall = () => {
    setCallStatus('idle')
    setCallDuration(0)
    setTranscript([])
    setSelectedScenario(null)
    setPhoneNumber('')
    setShowKeypad(false)
    callStartTime.current = null
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      stt.current.stop()
    } else if (callStatus === 'active') {
      stt.current.start(
        (text) => handleUserInput(text),
        (error) => console.error('STT Error:', error)
      )
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

  return (
    <div className="max-w-md mx-auto bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
      {/* Phone Status Bar */}
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center text-white text-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <span>100%</span>
      </div>

      {/* Main Call Interface */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-[600px] flex flex-col">
        {/* Call Status Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-white">
          {callStatus === 'idle' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm mb-4">Ready to call</p>
              {phoneNumber ? (
                <p className="text-2xl font-semibold mb-2 text-white">{formatPhoneNumber(phoneNumber)}</p>
              ) : (
                <p className="text-gray-500 text-sm">Select a demo scenario or enter a number</p>
              )}
            </div>
          )}

          {(callStatus === 'ringing' || callStatus === 'connecting') && (
            <div className="text-center animate-pulse">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg ring-4 ring-blue-400/50">
                {selectedScenario ? (
                  <span className="text-6xl">{selectedScenario.avatar}</span>
                ) : (
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
              </div>
              <p className="text-xl font-semibold mb-2">
                {selectedScenario?.name || formatPhoneNumber(phoneNumber)}
              </p>
              <p className="text-gray-400 text-sm mb-1">
                {callStatus === 'ringing' ? 'Ringing...' : 'Connecting...'}
              </p>
              {selectedScenario && (
                <p className="text-gray-500 text-xs">{selectedScenario.phoneNumber}</p>
              )}
            </div>
          )}

          {callStatus === 'active' && (
            <div className="text-center w-full">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg ring-4 ring-green-400/50">
                {selectedScenario ? (
                  <span className="text-6xl">{selectedScenario.avatar}</span>
                ) : (
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
              </div>
              <p className="text-xl font-semibold mb-2 text-white">
                {selectedScenario?.name || formatPhoneNumber(phoneNumber)}
              </p>
              <p className="text-2xl font-mono text-green-400 mb-1">{formatDuration(callDuration)}</p>
              <p className="text-gray-400 text-xs mb-4">Call in progress</p>
              
              {/* Emergency Indicator */}
              {voiceAI.current.getCallState().emergencyDetected && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 mb-4">
                  <p className="text-red-300 text-xs font-semibold flex items-center justify-center gap-2">
                    <span>🚨</span> Emergency Call Detected
                  </p>
                </div>
              )}
            </div>
          )}

          {callStatus === 'ended' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Call ended</p>
              <p className="text-gray-500 text-xs mt-2">Duration: {formatDuration(callDuration)}</p>
            </div>
          )}

          {/* Transcript */}
          {callStatus === 'active' && transcript.length > 0 && (
            <div className="mt-6 w-full max-h-48 overflow-y-auto bg-gray-800/50 rounded-lg p-4 space-y-2">
              {transcript.slice(-3).map((message, index) => (
                <div
                  key={index}
                  className={`text-xs ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg px-3 py-1.5 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Scenarios (when idle) */}
        {callStatus === 'idle' && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-gray-400 text-xs font-semibold mb-2 px-2">DEMO SCENARIOS</p>
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => startCall(scenario)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-3 flex items-center gap-3 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                  {scenario.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{scenario.name}</p>
                  <p className="text-gray-400 text-xs">{scenario.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Keypad */}
        {showKeypad && callStatus === 'idle' && (
          <div className="px-4 pb-4">
            <div className="bg-gray-800 rounded-2xl p-4">
              <div className="grid grid-cols-3 gap-3">
                {keypadButtons.flat().map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeypadInput(digit)}
                    className="aspect-square bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-xl font-semibold active:scale-95 transition-transform touch-manipulation"
                  >
                    {digit}
                    {digit === '1' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5"></span>}
                    {digit === '2' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">ABC</span>}
                    {digit === '3' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">DEF</span>}
                    {digit === '4' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">GHI</span>}
                    {digit === '5' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">JKL</span>}
                    {digit === '6' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">MNO</span>}
                    {digit === '7' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">PQRS</span>}
                    {digit === '8' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">TUV</span>}
                    {digit === '9' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">WXYZ</span>}
                    {digit === '0' && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">+</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowKeypad(false)}
                className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                Hide Keypad
              </button>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="px-6 py-6 bg-gray-800/50">
          {callStatus === 'idle' && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowKeypad(!showKeypad)}
                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors active:scale-95"
                title={showKeypad ? 'Hide Keypad' : 'Show Keypad'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showKeypad ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  )}
                </svg>
              </button>
              <button
                onClick={() => startCall()}
                disabled={!phoneNumber && !selectedScenario}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-lg transition-colors active:scale-95"
                title="Start Call"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              {phoneNumber && (
                <button
                  onClick={handleDelete}
                  className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors active:scale-95"
                  title="Delete"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {callStatus === 'active' && (
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors active:scale-95 ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
              <button
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors active:scale-95 ${
                  isSpeakerOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors active:scale-95"
                title="End Call"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

