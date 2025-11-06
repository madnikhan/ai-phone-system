import { NextRequest, NextResponse } from 'next/server'

// Twilio demo mode - handles voice responses and generates AI responses
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const speechResult = formData.get('SpeechResult') as string || ''
    
    // In a real implementation, this would:
    // 1. Process the speech input with AI
    // 2. Generate appropriate response
    // 3. Return TwiML with text-to-speech
    
    // For demo, we'll simulate the AI response
    let aiResponse = ''
    
    // Simple keyword detection for demo
    const lowerInput = speechResult.toLowerCase()
    
    if (lowerInput.includes('emergency') || lowerInput.includes('leak') || lowerInput.includes('flood')) {
      aiResponse = "I understand this is an emergency. Is water actively coming in right now? We can dispatch a technician within 2 hours."
    } else if (lowerInput.includes('inspection') || lowerInput.includes('quote') || lowerInput.includes('estimate')) {
      aiResponse = "I'd be happy to schedule that for you. When would be convenient? We have availability today, tomorrow, and later this week."
    } else {
      aiResponse = "Thank you for calling. How can I help you with your roofing needs today?"
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${aiResponse}</Say>
    <Gather action="/api/twilio/voice-response" method="POST" input="speech" speechTimeout="auto">
        <Say voice="alice">Please continue.</Say>
    </Gather>
    <Say voice="alice">Thank you for calling. Have a great day.</Say>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Error handling voice response:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, I didn't catch that. Please try again.</Say>
    <Gather action="/api/twilio/voice-response" method="POST" input="speech" speechTimeout="auto">
        <Say voice="alice">How can I help you?</Say>
    </Gather>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}

// Handle GET requests
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok', 
    mode: 'demo',
    message: 'Voice response endpoint ready for Twilio integration'
  })
}

