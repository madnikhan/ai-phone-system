'use client'

/**
 * Calm, reassuring emergency response templates
 * Designed to help stressed customers while collecting critical information
 */

export class EmergencyResponses {
  private businessName = 'Premium Roofing Solutions'

  /**
   * Get reassuring greeting for emergency calls
   */
  getReassuringGreeting(): string {
    const responses = [
      `I understand this is urgent. I'm here to help you right away. Let me get you the assistance you need as quickly as possible.`,
      `I hear you're dealing with an emergency. Please stay calm - we're going to help you. I'm here to get you connected with immediate assistance.`,
      `Thank you for calling. I understand this is an urgent situation. Let's get this resolved quickly and safely. I'm here to help.`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get critical safety questions with reassuring tone
   */
  getSafetyQuestion(questionNumber: number, totalQuestions: number): string {
    const responses: Record<number, string[]> = {
      1: [
        `First, I need to make sure everyone is safe. Is anyone in immediate danger right now?`,
        `Most importantly - is everyone safe? Is anyone in immediate danger?`,
        `Before we proceed, let me ask - is everyone safe? Is anyone in immediate danger?`,
      ],
      2: [
        `Good. Now, is water actively coming into your home right now?`,
        `Thank you. Is water currently leaking into your property?`,
        `I understand. Is water actively coming in right now?`,
      ],
      3: [
        `Have you been able to move to a safe area?`,
        `Are you in a safe location right now?`,
        `Are you and your family in a safe area?`,
      ],
    }

    const questionSet = responses[questionNumber] || [
      `Let me get one more detail - can you describe what's happening?`,
    ]

    return this.getRandomResponse(questionSet)
  }

  /**
   * Get reassuring response after collecting safety info
   */
  getReassuringConfirmation(): string {
    const responses = [
      `Thank you for that information. I'm going to dispatch a technician immediately. Help is on the way.`,
      `I understand the situation. We're going to get someone to you right away. You're going to be okay.`,
      `I've got all the information I need. We're sending help immediately. Please stay safe and someone will be there very soon.`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get response for emergency scheduling
   */
  getEmergencySchedulingResponse(): string {
    const responses = [
      `We have an emergency technician available within 2 hours. They'll call you when they're on their way. Can I get your address and phone number?`,
      `I can dispatch an emergency technician within 2 hours. What's the address where we should send them, and what's the best phone number to reach you?`,
      `We're going to send someone out within 2 hours. To get them there, I need your address and a phone number where we can reach you.`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get calming response when customer sounds stressed
   */
  getCalmingResponse(): string {
    const responses = [
      `I understand this is stressful. Take a deep breath - we're going to get this sorted out. Let me help you.`,
      `I know this is difficult. We're going to take care of this. Can you help me understand what's happening?`,
      `I hear you, and I understand this is urgent. Let's work through this together, step by step.`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get response for when emergency is confirmed
   */
  getEmergencyConfirmation(): string {
    const responses = [
      `I've flagged this as an emergency and prioritized your call. We're going to get someone to you right away.`,
      `This has been marked as an emergency. We're prioritizing your call and will have someone there as soon as possible.`,
      `I've escalated this to emergency priority. Help is on the way, and you'll hear from us very soon.`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get response when collecting address
   */
  getAddressCollection(): string {
    const responses = [
      `To send our technician to you, what's the address where the emergency is happening?`,
      `I need the address where we should send the technician. What's the location?`,
      `Where should we send the emergency technician? What's the address?`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get response when collecting phone number
   */
  getPhoneCollection(): string {
    const responses = [
      `What's the best phone number to reach you at? Our technician will call when they're on their way.`,
      `What phone number should we use to contact you?`,
      `I need a phone number where we can reach you. What's the best number?`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get final reassuring closing
   */
  getFinalReassurance(): string {
    const responses = [
      `Perfect. I have everything I need. Our emergency technician will be there within 2 hours, and they'll call you when they're on their way. Please stay safe, and we'll take care of this. Is there anything else I can help you with right now?`,
      `Excellent. I've got all the information. Help is on the way, and you'll receive a call from our technician shortly. Stay safe, and we'll get this resolved for you. Anything else I can help with?`,
      `I have everything I need. We're dispatching someone immediately, and they'll contact you when they're heading to your location. Please stay safe. Is there anything else I can assist you with?`,
    ]

    return this.getRandomResponse(responses)
  }

  /**
   * Get response for non-active emergency
   */
  getNonActiveEmergencyResponse(): string {
    const responses = [
      `I understand. Even though it's not actively happening right now, we should address this quickly. Let me schedule an urgent appointment for you.`,
      `Thank you for that information. Even though it's not ongoing, this is still urgent. Let's get you scheduled as soon as possible.`,
      `I see. While it's not actively happening now, we should still address this urgently. Let me get you scheduled right away.`,
    ]

    return this.getRandomResponse(responses)
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

