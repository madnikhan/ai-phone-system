'use client'

/**
 * Utility for managing realistic voice response timing
 * Helps create natural conversation flow with appropriate pauses
 */

export class VoiceTiming {
  /**
   * Calculate natural pause duration based on text length and punctuation
   */
  static calculatePauseDuration(text: string): number {
    // Base pause after sentences
    let pause = 0
    
    // Count sentence endings
    const sentenceEndings = (text.match(/[.!?]/g) || []).length
    pause += sentenceEndings * 300 // 300ms per sentence
    
    // Count commas
    const commas = (text.match(/,/g) || []).length
    pause += commas * 150 // 150ms per comma
    
    // Longer pauses for questions
    if (text.includes('?')) {
      pause += 200 // Extra pause for questions
    }
    
    // Base pause for any response
    return Math.max(500, pause) // Minimum 500ms
  }

  /**
   * Add natural pauses to text for better TTS flow
   */
  static addNaturalPauses(text: string): string {
    // Add slight pauses after commas
    let processed = text.replace(/,/g, ', ')
    
    // Add pauses after sentence endings
    processed = processed.replace(/([.!?])\s+/g, '$1 ')
    
    // Add emphasis pauses for important information
    processed = processed.replace(/(emergency|urgent|critical|immediately)/gi, '$1 ')
    
    return processed
  }

  /**
   * Calculate estimated speaking time for text
   * Average speaking rate: ~150 words per minute
   */
  static estimateSpeakingTime(text: string): number {
    const words = text.split(/\s+/).length
    const wordsPerMinute = 150
    const seconds = (words / wordsPerMinute) * 60
    
    // Add pause time
    const pauseTime = this.calculatePauseDuration(text) / 1000
    
    return Math.ceil(seconds + pauseTime)
  }

  /**
   * Split long responses into chunks for better comprehension
   */
  static splitIntoChunks(text: string, maxLength: number = 200): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const chunks: string[] = []
    let currentChunk = ''
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence
      } else {
        if (currentChunk) chunks.push(currentChunk.trim())
        currentChunk = sentence
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim())
    
    return chunks.length > 0 ? chunks : [text]
  }

  /**
   * Add emphasis markers for important information
   */
  static addEmphasis(text: string, keywords: string[]): string {
    let processed = text
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      processed = processed.replace(regex, (match) => {
        return match // Could add SSML emphasis here if using advanced TTS
      })
    }
    
    return processed
  }

  /**
   * Normalize text for better speech synthesis
   */
  static normalizeForSpeech(text: string): string {
    let normalized = text
    
    // Expand abbreviations
    const abbreviations: Record<string, string> = {
      'ASAP': 'as soon as possible',
      'etc.': 'etcetera',
      'e.g.': 'for example',
      'i.e.': 'that is',
      'Dr.': 'Doctor',
      'Mr.': 'Mister',
      'Mrs.': 'Missus',
      'Ms.': 'Miss',
    }
    
    for (const [abbr, full] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi')
      normalized = normalized.replace(regex, full)
    }
    
    // Convert numbers to words where appropriate
    normalized = normalized.replace(/\b(\d{1,2}):(\d{2})\s?(am|pm)\b/gi, (match, hour, minute, period) => {
      const h = parseInt(hour)
      const m = parseInt(minute)
      const hourWord = h === 12 ? 'twelve' : h === 1 ? 'one' : h === 2 ? 'two' : 
                      h === 3 ? 'three' : h === 4 ? 'four' : h === 5 ? 'five' :
                      h === 6 ? 'six' : h === 7 ? 'seven' : h === 8 ? 'eight' :
                      h === 9 ? 'nine' : h === 10 ? 'ten' : h === 11 ? 'eleven' : `${h}`
      const minuteWord = m === 0 ? '' : m < 10 ? `oh ${this.numberToWord(m)}` : this.numberToWord(m)
      return `${hourWord} ${minuteWord} ${period}`.trim()
    })
    
    return normalized
  }

  /**
   * Convert number to word (simplified)
   */
  private static numberToWord(num: number): string {
    const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                   'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                   'seventeen', 'eighteen', 'nineteen']
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
    
    if (num < 20) return words[num]
    if (num < 100) {
      const tensDigit = Math.floor(num / 10)
      const onesDigit = num % 10
      return onesDigit ? `${tens[tensDigit]} ${words[onesDigit]}` : tens[tensDigit]
    }
    
    return num.toString()
  }
}

