import { NextRequest, NextResponse } from 'next/server'

// Twilio demo mode - simulates incoming call handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real implementation, this would handle Twilio webhook
    // For demo mode, we'll return a response that simulates Twilio TwiML
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Thank you for calling Premium Roofing Solutions. Please hold while we connect you to our AI assistant.</Say>
    <Gather action="/api/twilio/voice-response" method="POST" input="speech" speechTimeout="auto">
        <Say voice="alice">Please tell us about your roofing needs.</Say>
    </Gather>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Error handling incoming call:', error)
    return NextResponse.json(
      { error: 'Failed to handle incoming call' },
      { status: 500 }
    )
  }
}

// Handle GET requests for Twilio webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', mode: 'demo' })
}

