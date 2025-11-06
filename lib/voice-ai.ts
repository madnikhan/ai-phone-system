'use client'

import { EmergencyDetector, EmergencyDetection } from './emergency-detector'
import { EmergencyResponses } from './emergency-responses'

export interface CallState {
  stage: 'greeting' | 'emergency_check' | 'qualification' | 'service_details' | 'scheduling' | 'collecting_info' | 'closing' | 'escalation'
  emergencyDetected: boolean
  qualificationStep: number
  leadInfo: {
    name?: string
    phone?: string
    email?: string
    address?: string
    issue?: string
    issueType?: 'leak' | 'damage' | 'inspection' | 'replacement' | 'repair' | 'maintenance' | 'other'
    urgency?: 'emergency' | 'urgent' | 'normal'
    propertyType?: 'residential' | 'commercial'
    roofAge?: string
    appointmentDate?: string
    appointmentTime?: string
    preferredContact?: string
  }
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
  }>
  context: {
    lastResponse?: string
    userIntent?: string
    confidence?: number
  }
}

export class VoiceAI {
  private callState: CallState
  private businessName = 'Premium Roofing Solutions'
  private emergencyDetector: EmergencyDetector
  private emergencyResponses: EmergencyResponses
  private safetyQuestionStep: number = 0
  private safetyQuestions: string[] = []
  
  // Comprehensive emergency keyword patterns
  private emergencyKeywords = [
    'emergency', 'urgent', 'critical', 'immediate', 'asap', 'right now', 'now',
    'leak', 'leaking', 'water', 'flood', 'flooding', 'dripping', 'dripping',
    'damage', 'damaged', 'broken', 'collapsed', 'caved in', 'caving',
    'storm', 'wind', 'hail', 'tree', 'fallen', 'crash', 'accident',
    'active', 'coming in', 'pouring', 'soaking', 'wet', 'moisture'
  ]

  // Roofing service types
  private serviceTypes = {
    leak: ['leak', 'leaking', 'water', 'drip', 'dripping', 'moisture', 'wet'],
    damage: ['damage', 'damaged', 'broken', 'crack', 'hole', 'missing', 'torn'],
    inspection: ['inspection', 'inspect', 'check', 'evaluate', 'assess', 'look at'],
    replacement: ['replacement', 'replace', 'new roof', 'roofing', 'roof job'],
    repair: ['repair', 'fix', 'service', 'maintenance', 'maintain'],
    maintenance: ['maintenance', 'maintain', 'upkeep', 'care', 'service']
  }

  // Natural response templates
  private responseTemplates = {
    greeting: [
      `Thank you for calling ${this.businessName}. I'm your AI assistant, and I'm here to help with all your roofing needs. Are you experiencing a roofing emergency right now, or is this a general inquiry?`,
      `Welcome to ${this.businessName}. This is your AI assistant speaking. To best assist you, I need to know - are you dealing with a roofing emergency, or would you like to schedule a routine service?`,
      `Hello, and thank you for calling ${this.businessName}. I'm here to help. First, let me ask - is this an emergency situation, or are you looking to schedule a regular service?`
    ],
    emergency: [
      `I understand this is urgent. To help you as quickly as possible, I need to know - is water actively coming into your home right now?`,
      `I hear you're dealing with an emergency. Let me prioritize this. Is water currently leaking into your property?`,
      `This sounds serious. To dispatch the right technician, can you tell me - is there active water damage happening right now?`
    ],
    qualification: [
      `I'd be happy to help you with that. Can you tell me a bit more about what's going on with your roof?`,
      `Thank you for that information. To better understand your situation, what type of roofing issue are you experiencing?`,
      `I see. To schedule the right service for you, what would you say is the main concern with your roof?`
    ],
    serviceDetails: [
      `I understand you're dealing with a {issue}. Can you tell me when this first started?`,
      `Thank you for that detail. When did you first notice this {issue}?`,
      `I see. To help our technicians prepare, when did the {issue} begin?`
    ],
    scheduling: [
      `Great! I'd be happy to schedule an appointment for you. When would be most convenient? We have availability today, tomorrow, and later this week.`,
      `Perfect timing. Let's get you scheduled. What day works best for you? We can do today, tomorrow, or any day this week.`,
      `Excellent. I can schedule a visit for you. When would you prefer? We have openings today and throughout the week.`
    ]
  }

  constructor() {
    this.emergencyDetector = new EmergencyDetector()
    this.emergencyResponses = new EmergencyResponses()
    this.callState = {
      stage: 'greeting',
      emergencyDetected: false,
      qualificationStep: 0,
      leadInfo: {},
      conversationHistory: [],
      context: {},
    }
  }

  detectEmergency(userInput: string): EmergencyDetection {
    // Use the real-time emergency detector
    return this.emergencyDetector.analyzeSpeech(userInput)
  }

  /**
   * Real-time emergency monitoring - should be called on every user input
   */
  monitorEmergency(userInput: string): EmergencyDetection | null {
    const detection = this.emergencyDetector.analyzeSpeech(userInput)
    
    // If emergency detected and not already flagged
    if (detection.detected && !this.callState.emergencyDetected) {
      this.callState.emergencyDetected = true
      this.callState.leadInfo.urgency = detection.urgency
      this.callState.context.confidence = detection.confidence
      
      // Check if immediate escalation needed
      if (this.emergencyDetector.shouldEscalate(detection)) {
        this.callState.stage = 'escalation'
        // Get safety questions
        this.safetyQuestions = this.emergencyDetector.getSafetyQuestions(detection)
        this.safetyQuestionStep = 0
      } else {
        this.callState.stage = 'emergency_check'
      }
      
      return detection
    }
    
    return null
  }

  detectServiceType(userInput: string): string | null {
    const lowerInput = userInput.toLowerCase()
    
    for (const [type, keywords] of Object.entries(this.serviceTypes)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        return type as string
      }
    }

    return null
  }

  extractName(userInput: string): string | null {
    // Simple name extraction - look for "I'm" or "My name is" patterns
    const patterns = [
      /(?:i'?m|i am|my name is|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:calling|speaking with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ]

    for (const pattern of patterns) {
      const match = userInput.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return null
  }

  extractPhoneNumber(userInput: string): string | null {
    // Extract phone number patterns
    const patterns = [
      /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/,
      /\b(\d{10})\b/,
      /(?:phone|number|call|contact).*?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/i,
    ]

    for (const pattern of patterns) {
      const match = userInput.match(pattern)
      if (match && match[1]) {
        return match[1].replace(/[-.\s]/g, '')
      }
    }

    return null
  }

  extractAddress(userInput: string): string | null {
    // Simple address extraction
    const patterns = [
      /(?:at|address|location|property).*?(\d+\s+[A-Za-z0-9\s,]+(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|boulevard|blvd|court|ct|way|circle|cir))/i,
      /(\d+\s+[A-Za-z0-9\s,]+(?:street|st|road|rd|avenue|ave|drive|dr))/i,
    ]

    for (const pattern of patterns) {
      const match = userInput.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return null
  }

  parseAppointmentDate(userInput: string): { date: string | null; time: string | null } {
    const lowerInput = userInput.toLowerCase()
    let date: string | null = null
    let time: string | null = null

    // Date patterns
    const datePatterns = [
      /(?:today|right now)/i,
      /(?:tomorrow|next day)/i,
      /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/, // MM/DD/YYYY
      /(?:next week|this week|weekend)/i,
      /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday).*?(?:morning|afternoon|evening)?/i,
    ]

    for (const pattern of datePatterns) {
      const match = lowerInput.match(pattern)
      if (match) {
        date = match[0]
        break
      }
    }

    // Time patterns
    const timePatterns = [
      /(\d{1,2}):?(\d{2})?\s?(am|pm|morning|afternoon|evening)/i,
      /(?:morning|afternoon|evening|am|pm)/i,
      /(?:at|around|about)\s?(\d{1,2}):?(\d{2})?\s?(am|pm)?/i,
    ]

    for (const pattern of timePatterns) {
      const match = lowerInput.match(pattern)
      if (match) {
        time = match[0]
        break
      }
    }

    // If no specific time but morning/afternoon/evening mentioned
    if (!time) {
      if (lowerInput.includes('morning')) time = 'morning'
      else if (lowerInput.includes('afternoon')) time = 'afternoon'
      else if (lowerInput.includes('evening')) time = 'evening'
    }

    return { date, time }
  }

  processUserInput(userInput: string): string {
    const lowerInput = userInput.toLowerCase()
    this.addToHistory('user', userInput)

    // Extract information from user input
    const name = this.extractName(userInput)
    const phone = this.extractPhoneNumber(userInput)
    const address = this.extractAddress(userInput)

    if (name && !this.callState.leadInfo.name) {
      this.callState.leadInfo.name = name
    }
    if (phone && !this.callState.leadInfo.phone) {
      this.callState.leadInfo.phone = phone
    }
    if (address && !this.callState.leadInfo.address) {
      this.callState.leadInfo.address = address
    }

    // Real-time emergency monitoring - check on every input
    const emergencyDetection = this.monitorEmergency(userInput)
    if (emergencyDetection) {
      // Emergency detected - will be handled in appropriate stage
    }

    // Detect service type
    const serviceType = this.detectServiceType(userInput)
    if (serviceType && !this.callState.leadInfo.issueType) {
      this.callState.leadInfo.issueType = serviceType as any
    }

    let response = ''

    switch (this.callState.stage) {
      case 'greeting':
        response = this.handleGreeting(userInput)
        break

      case 'emergency_check':
        response = this.handleEmergencyCheck(userInput)
        break

      case 'qualification':
        response = this.handleQualification(userInput)
        break

      case 'service_details':
        response = this.handleServiceDetails(userInput)
        break

      case 'scheduling':
        response = this.handleScheduling(userInput)
        break

      case 'collecting_info':
        response = this.handleCollectingInfo(userInput)
        break

      case 'closing':
        response = this.handleClosing(userInput)
        break

      case 'escalation':
        response = this.handleEscalation(userInput)
        break

      default:
        response = "I'm here to help. How can I assist you with your roofing needs today?"
    }

    this.callState.context.lastResponse = response
    this.addToHistory('assistant', response)
    
    // Add natural pauses and normalize for speech
    return this.normalizeResponse(response)
  }

  private handleGreeting(userInput: string): string {
    const lowerInput = userInput.toLowerCase()

    // If emergency already detected, use reassuring response
    if (this.callState.emergencyDetected) {
      return this.emergencyResponses.getReassuringGreeting()
    }

    if (lowerInput.includes('yes') || lowerInput.includes('emergency') || lowerInput.includes('urgent')) {
      this.callState.emergencyDetected = true
      this.callState.leadInfo.urgency = 'emergency'
      this.callState.stage = 'emergency_check'
      return this.emergencyResponses.getReassuringGreeting()
    }

    if (lowerInput.includes('no') || lowerInput.includes('not') || lowerInput.includes('general') || lowerInput.includes('inquiry')) {
      this.callState.stage = 'qualification'
      this.callState.qualificationStep = 1
      return this.getRandomResponse(this.responseTemplates.qualification)
    }

    // Default: start qualification
    this.callState.stage = 'qualification'
    this.callState.qualificationStep = 1
    return this.getRandomResponse(this.responseTemplates.qualification)
  }

  private handleEmergencyCheck(userInput: string): string {
    const lowerInput = userInput.toLowerCase()

    // Use reassuring responses
    if (lowerInput.includes('yes') || lowerInput.includes('active') || lowerInput.includes('coming') || lowerInput.includes('pouring') || lowerInput.includes('dripping')) {
      this.callState.leadInfo.urgency = 'emergency'
      
      // Start safety questions
      this.safetyQuestions = this.emergencyDetector.getSafetyQuestions(
        this.emergencyDetector.analyzeSpeech(userInput)
      )
      this.safetyQuestionStep = 1
      this.callState.stage = 'escalation'
      
      return this.emergencyResponses.getSafetyQuestion(1, this.safetyQuestions.length)
    }

    if (lowerInput.includes('no') || lowerInput.includes('not') || lowerInput.includes('stopped') || lowerInput.includes('was')) {
      this.callState.leadInfo.urgency = 'urgent'
      this.callState.stage = 'qualification'
      this.callState.qualificationStep = 1
      return this.emergencyResponses.getNonActiveEmergencyResponse()
    }

    // If unclear, ask again with reassuring tone
    return `I need to understand the urgency. Is water actively coming into your home right now, or has the leak stopped? Please stay calm - we're going to help you.`
  }

  private handleEscalation(userInput: string): string {
    // Handle critical safety questions first
    if (this.safetyQuestionStep > 0 && this.safetyQuestionStep <= this.safetyQuestions.length) {
      const lowerInput = userInput.toLowerCase()
      
      // Check if answer indicates immediate danger
      if (lowerInput.includes('yes') && (
        lowerInput.includes('danger') || 
        lowerInput.includes('unsafe') || 
        lowerInput.includes('injury') ||
        lowerInput.includes('hurt')
      )) {
        // Critical situation - escalate immediately
        this.callState.stage = 'collecting_info'
        return `I understand this is a critical situation. We're going to dispatch emergency services immediately. What's the address where you are, and what's your phone number?`
      }

      // Move to next safety question
      this.safetyQuestionStep++
      
      if (this.safetyQuestionStep <= this.safetyQuestions.length) {
        return this.emergencyResponses.getSafetyQuestion(
          this.safetyQuestionStep, 
          this.safetyQuestions.length
        )
      }
    }

    // After safety questions, collect essential info
    if (!this.callState.leadInfo.address) {
      return this.emergencyResponses.getAddressCollection()
    }

    if (!this.callState.leadInfo.phone) {
      return this.emergencyResponses.getPhoneCollection()
    }

    // All safety questions answered and info collected
    this.callState.stage = 'closing'
    return this.emergencyResponses.getFinalReassurance()
  }

  private handleQualification(userInput: string): string {
    const lowerInput = userInput.toLowerCase()
    
    // Store the issue description
    if (!this.callState.leadInfo.issue) {
      this.callState.leadInfo.issue = userInput
    }

    // Detect service type
    const serviceType = this.detectServiceType(userInput)
    if (serviceType) {
      this.callState.leadInfo.issueType = serviceType as any
    }

    this.callState.qualificationStep++

    // Multi-step qualification
    if (this.callState.qualificationStep === 1) {
      this.callState.stage = 'service_details'
      const issueType = this.callState.leadInfo.issueType || 'issue'
      return `I understand you're dealing with a ${issueType}. Can you tell me when you first noticed this problem?`
    }

    if (this.callState.qualificationStep === 2) {
      // Ask about property type if not already collected
      if (!this.callState.leadInfo.propertyType) {
        if (lowerInput.includes('home') || lowerInput.includes('house') || lowerInput.includes('residential')) {
          this.callState.leadInfo.propertyType = 'residential'
        } else if (lowerInput.includes('business') || lowerInput.includes('commercial') || lowerInput.includes('office')) {
          this.callState.leadInfo.propertyType = 'commercial'
        }
      }
      
      this.callState.stage = 'scheduling'
      return this.getRandomResponse(this.responseTemplates.scheduling)
    }

    // Default: move to scheduling
    this.callState.stage = 'scheduling'
    return this.getRandomResponse(this.responseTemplates.scheduling)
  }

  private handleServiceDetails(userInput: string): string {
    // Extract any additional details
    if (!this.callState.leadInfo.issue) {
      this.callState.leadInfo.issue = userInput
    }

    // Check if they mentioned roof age
    const ageMatch = userInput.match(/(\d+)\s*(?:year|yr|old)/i)
    if (ageMatch) {
      this.callState.leadInfo.roofAge = ageMatch[1]
    }

    this.callState.stage = 'scheduling'
    return this.getRandomResponse(this.responseTemplates.scheduling)
  }

  private handleScheduling(userInput: string): string {
    const { date, time } = this.parseAppointmentDate(userInput)

    if (date) {
      this.callState.leadInfo.appointmentDate = date
    }
    if (time) {
      this.callState.leadInfo.appointmentTime = time
    }

    // Check if we have both date and time
    if (this.callState.leadInfo.appointmentDate && this.callState.leadInfo.appointmentTime) {
      this.callState.stage = 'closing'
      return this.getClosingResponse()
    }

    // Ask for missing information
    if (this.callState.leadInfo.appointmentDate && !this.callState.leadInfo.appointmentTime) {
      return `Great! We have you scheduled for ${this.callState.leadInfo.appointmentDate}. What time would work best? We have morning, afternoon, and evening slots available.`
    }

    if (!this.callState.leadInfo.appointmentDate && this.callState.leadInfo.appointmentTime) {
      return `Perfect timing preference. Which day would you like? We have availability today, tomorrow, and later this week.`
    }

    // Still need both
    return `I can schedule an appointment for you. When would be most convenient? We have availability today, tomorrow, and later this week. What day and time work best for you?`
  }

  private handleCollectingInfo(userInput: string): string {
    // For emergency calls, collect essential info quickly with reassuring tone
    const lowerInput = userInput.toLowerCase()

    // Check if phone number was provided
    const phone = this.extractPhoneNumber(userInput)
    if (phone && !this.callState.leadInfo.phone) {
      this.callState.leadInfo.phone = phone
    }

    // Check if address was provided
    const address = this.extractAddress(userInput)
    if (address && !this.callState.leadInfo.address) {
      this.callState.leadInfo.address = address
    }

    // Check if name was provided
    const name = this.extractName(userInput)
    if (name && !this.callState.leadInfo.name) {
      this.callState.leadInfo.name = name
    }

    // Check if we have essential info
    const hasPhone = !!this.callState.leadInfo.phone
    const hasAddress = !!this.callState.leadInfo.address

    if (!hasPhone) {
      return this.emergencyResponses.getPhoneCollection()
    }

    if (!hasAddress) {
      return this.emergencyResponses.getAddressCollection()
    }

    // All info collected, confirm with reassuring tone
    this.callState.stage = 'closing'
    return this.emergencyResponses.getFinalReassurance()
  }

  private handleClosing(userInput: string): string {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes('no') || lowerInput.includes('nothing') || lowerInput.includes('that\'s all') || lowerInput.includes('thank you')) {
      return `You're very welcome. Thank you for choosing ${this.businessName}. Have a great day, and we'll see you soon!`
    }

    if (lowerInput.includes('yes') || lowerInput.includes('one more') || lowerInput.includes('actually')) {
      // Reset to qualification for additional question
      this.callState.stage = 'qualification'
      this.callState.qualificationStep = 0
      return `Of course! What else can I help you with?`
    }

    return `Thank you for calling ${this.businessName}. Is there anything else I can help you with today?`
  }

  private getClosingResponse(): string {
    const date = this.formatDate(this.callState.leadInfo.appointmentDate || '')
    const time = this.formatTime(this.callState.leadInfo.appointmentTime || '')
    
    const responses = [
      `Perfect! I've scheduled your appointment for ${date} at ${time}. A technician will call you within the next hour to confirm and provide an arrival window. Is there anything else I can help you with today?`,
      `Excellent! Your appointment is confirmed for ${date} at ${time}. Our team will call you to confirm the details and provide an estimated arrival time. Anything else I can assist you with?`,
      `Great! I've got you scheduled for ${date} at ${time}. You'll receive a confirmation call shortly, and our technician will arrive within the scheduled window. Is there anything else you'd like to discuss?`
    ]

    return this.getRandomResponse(responses)
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'your preferred date'
    
    const lower = dateString.toLowerCase()
    if (lower.includes('today')) return 'today'
    if (lower.includes('tomorrow')) return 'tomorrow'
    if (lower.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/)) {
      return dateString
    }
    
    return dateString
  }

  private formatTime(timeString: string): string {
    if (!timeString) return 'your preferred time'
    
    const lower = timeString.toLowerCase()
    if (lower.includes('morning')) return 'morning'
    if (lower.includes('afternoon')) return 'afternoon'
    if (lower.includes('evening')) return 'evening'
    
    return timeString
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private normalizeResponse(text: string): string {
    // Add natural pauses for better speech flow
    // This helps with more realistic TTS timing
    let normalized = text
      .replace(/\. /g, '. ')
      .replace(/\? /g, '? ')
      .replace(/\! /g, '! ')
      .replace(/, /g, ', ')
    
    // Expand common abbreviations for better speech
    normalized = normalized.replace(/\bASAP\b/gi, 'as soon as possible')
    normalized = normalized.replace(/\bAI\b/gi, 'A I')
    normalized = normalized.replace(/\b(\d+)\s*hrs?\b/gi, '$1 hours')
    normalized = normalized.replace(/\b(\d+)\s*mins?\b/gi, '$1 minutes')
    
    return normalized
  }

  private addToHistory(role: 'user' | 'assistant', text: string) {
    this.callState.conversationHistory.push({
      role,
      text,
      timestamp: new Date(),
    })
  }

  getCallState(): CallState {
    return { ...this.callState }
  }

  reset() {
    this.callState = {
      stage: 'greeting',
      emergencyDetected: false,
      qualificationStep: 0,
      leadInfo: {},
      conversationHistory: [],
      context: {},
    }
    this.safetyQuestionStep = 0
    this.safetyQuestions = []
    this.emergencyDetector.reset()
  }

  getGreeting(): string {
    return this.getRandomResponse(this.responseTemplates.greeting)
  }
}
