'use client'

/**
 * Real-time emergency detection system
 * Analyzes speech in real-time for urgent keywords and patterns
 */

export interface EmergencyDetection {
  detected: boolean
  confidence: number
  urgency: 'emergency' | 'urgent' | 'normal'
  keywords: string[]
  timestamp: Date
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export class EmergencyDetector {
  // Critical emergency keywords (highest priority)
  private criticalKeywords = [
    'emergency', 'urgent', 'critical', 'immediate', 'asap', 'right now',
    'leak', 'leaking', 'water', 'flood', 'flooding', 'dripping',
    'collapsed', 'caved in', 'structural damage', 'unsafe',
    'electrical', 'shocking', 'fire', 'smoke'
  ]

  // High priority keywords
  private highPriorityKeywords = [
    'damage', 'damaged', 'broken', 'crack', 'hole', 'missing',
    'storm', 'wind', 'hail', 'tree', 'fallen', 'crash',
    'active', 'coming in', 'pouring', 'soaking', 'wet', 'moisture'
  ]

  // Safety-related keywords
  private safetyKeywords = [
    'unsafe', 'dangerous', 'hazard', 'risk', 'electrical', 'wires',
    'exposed', 'falling', 'collapsing', 'structural', 'foundation'
  ]

  // Patterns for urgent phrases
  private urgentPatterns = [
    /need.*(?:help|assistance|someone|technician|now|immediately|urgent)/i,
    /(?:asap|right now|immediately|urgent|emergency|critical)/i,
    /(?:water|leak|flood).*(?:coming|pouring|dripping|active|flowing)/i,
    /(?:damage|broken|collapsed).*(?:now|immediately|urgent)/i,
    /(?:unsafe|dangerous|hazard|risk|electrical)/i,
    /(?:can't|cannot|can not).*(?:wait|delay|postpone)/i,
  ]

  // Real-time monitoring state
  private recentDetections: EmergencyDetection[] = []
  private detectionHistory: string[] = []
  private readonly HISTORY_LIMIT = 10
  private readonly DETECTION_WINDOW_MS = 5000 // 5 second window

  /**
   * Analyze speech in real-time for emergency detection
   */
  analyzeSpeech(text: string): EmergencyDetection {
    const lowerText = text.toLowerCase()
    const timestamp = new Date()

    // Find matching keywords
    const criticalMatches = this.criticalKeywords.filter(kw => lowerText.includes(kw))
    const highMatches = this.highPriorityKeywords.filter(kw => lowerText.includes(kw))
    const safetyMatches = this.safetyKeywords.filter(kw => lowerText.includes(kw))

    // Count pattern matches
    const patternMatches = this.urgentPatterns.filter(regex => regex.test(text)).length

    // Calculate confidence
    let confidence = 0
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'low'

    // Critical keywords increase confidence significantly
    if (criticalMatches.length > 0) {
      confidence += criticalMatches.length * 0.3
      severity = 'critical'
    }

    // High priority keywords
    if (highMatches.length > 0) {
      confidence += highMatches.length * 0.2
      if (severity === 'low') severity = 'high'
    }

    // Safety keywords are critical
    if (safetyMatches.length > 0) {
      confidence += safetyMatches.length * 0.4
      severity = 'critical'
    }

    // Pattern matches
    confidence += patternMatches * 0.25

    // Check recent detection history for context
    const recentContext = this.getRecentContext()
    if (recentContext.length > 0) {
      confidence += recentContext.length * 0.1
    }

    // Normalize confidence
    confidence = Math.min(1.0, confidence)

    // Determine urgency
    let urgency: 'emergency' | 'urgent' | 'normal' = 'normal'
    if (confidence > 0.7 || severity === 'critical') {
      urgency = 'emergency'
    } else if (confidence > 0.4 || severity === 'high') {
      urgency = 'urgent'
    }

    const detected = confidence > 0.3 || patternMatches > 0

    const detection: EmergencyDetection = {
      detected,
      confidence,
      urgency,
      keywords: [...criticalMatches, ...highMatches, ...safetyMatches],
      timestamp,
      severity,
    }

    // Store detection history
    this.recordDetection(text, detection)

    return detection
  }

  /**
   * Get recent context for better detection
   */
  private getRecentContext(): string[] {
    const now = Date.now()
    const recent = this.recentDetections.filter(
      d => now - d.timestamp.getTime() < this.DETECTION_WINDOW_MS
    )
    return recent.flatMap(d => d.keywords)
  }

  /**
   * Record detection for history tracking
   */
  private recordDetection(text: string, detection: EmergencyDetection) {
    // Add to recent detections
    this.recentDetections.push(detection)
    
    // Keep only recent detections
    const now = Date.now()
    this.recentDetections = this.recentDetections.filter(
      d => now - d.timestamp.getTime() < this.DETECTION_WINDOW_MS
    )

    // Add to history
    this.detectionHistory.push(text)
    if (this.detectionHistory.length > this.HISTORY_LIMIT) {
      this.detectionHistory.shift()
    }
  }

  /**
   * Check if emergency should be escalated immediately
   */
  shouldEscalate(detection: EmergencyDetection): boolean {
    return (
      detection.detected &&
      (detection.severity === 'critical' ||
       detection.confidence > 0.7 ||
       detection.keywords.some(kw => this.safetyKeywords.includes(kw)))
    )
  }

  /**
   * Get critical safety questions based on detected emergency
   */
  getSafetyQuestions(detection: EmergencyDetection): string[] {
    const questions: string[] = []

    if (detection.keywords.some(kw => ['water', 'leak', 'flood'].includes(kw))) {
      questions.push('Is water actively coming into your home right now?')
      questions.push('Is anyone in immediate danger?')
      questions.push('Have you turned off the electricity in the affected area?')
    }

    if (detection.keywords.some(kw => ['electrical', 'wires', 'shocking'].includes(kw))) {
      questions.push('Is the electrical hazard still active?')
      questions.push('Have you shut off power to the affected area?')
      questions.push('Is anyone in immediate danger?')
    }

    if (detection.keywords.some(kw => ['structural', 'collapsed', 'falling'].includes(kw))) {
      questions.push('Is the structure safe to enter?')
      questions.push('Has anyone been injured?')
      questions.push('Are you currently inside the building?')
    }

    // Default safety question
    if (questions.length === 0) {
      questions.push('Is anyone in immediate danger?')
      questions.push('Is the situation safe for you right now?')
    }

    return questions
  }

  /**
   * Reset detection history
   */
  reset() {
    this.recentDetections = []
    this.detectionHistory = []
  }

  /**
   * Get detection summary
   */
  getSummary(): {
    totalDetections: number
    criticalCount: number
    averageConfidence: number
    recentKeywords: string[]
  } {
    const total = this.recentDetections.length
    const critical = this.recentDetections.filter(d => d.severity === 'critical').length
    const avgConfidence = total > 0
      ? this.recentDetections.reduce((sum, d) => sum + d.confidence, 0) / total
      : 0
    const keywords = Array.from(
      new Set(this.recentDetections.flatMap(d => d.keywords))
    )

    return {
      totalDetections: total,
      criticalCount: critical,
      averageConfidence: avgConfidence,
      recentKeywords: keywords,
    }
  }
}

