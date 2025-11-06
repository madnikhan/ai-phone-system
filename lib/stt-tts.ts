'use client'

import { VoiceTiming } from './voice-timing'

export class SpeechToText {
  private recognition: SpeechRecognition | null = null
  private isListening: boolean = false
  private onResultCallback: ((text: string) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = 
        (window as any).webkitSpeechRecognition || 
        (window as any).SpeechRecognition
      
      if (SpeechRecognitionConstructor) {
        this.recognition = new SpeechRecognitionConstructor()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
      }
    }
  }

  start(onResult: (text: string) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser')
      return
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError || null

    this.recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript && this.onResultCallback) {
        this.onResultCallback(finalTranscript.trim())
      }
    }

    this.recognition.onerror = (event) => {
      const errorMessage = `Speech recognition error: ${(event as any).error}`
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      // Auto-restart if it was listening
      if (this.isListening) {
        this.recognition?.start()
      }
    }

    this.recognition.start()
    this.isListening = true
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false
      this.recognition.stop()
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }
}

export class TextToSpeech {
  private synth: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
    }
  }

  speak(text: string, onEnd?: () => void, onError?: (error: string) => void) {
    if (!this.synth) {
      onError?.('Speech synthesis not supported in this browser')
      return
    }

    // Cancel any ongoing speech
    this.synth.cancel()

    // Normalize text for better speech synthesis
    const normalizedText = VoiceTiming.normalizeForSpeech(text)

    const utterance = new SpeechSynthesisUtterance(normalizedText)
    // Slightly slower rate for more natural conversation
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-US'

    // Try to find a natural-sounding voice
    const voices = this.synth.getVoices()
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes('Google') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Siri') ||
        voice.name.includes('Alex')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onend = () => {
      this.currentUtterance = null
      // Add natural pause before callback
      setTimeout(() => {
        onEnd?.()
      }, 200) // 200ms pause after speech ends
    }

    utterance.onerror = (event) => {
      const errorMessage = `Speech synthesis error: ${(event as any).error}`
      onError?.(errorMessage)
    }

    // Add pause before starting to speak for more natural flow
    setTimeout(() => {
      this.currentUtterance = utterance
      this.synth.speak(utterance)
    }, 100) // 100ms pause before speaking
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
      this.currentUtterance = null
    }
  }

  isSupported(): boolean {
    return this.synth !== null
  }

  isSpeaking(): boolean {
    return this.synth?.speaking || false
  }
}

