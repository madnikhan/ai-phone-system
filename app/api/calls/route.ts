import { NextRequest, NextResponse } from 'next/server'

// API endpoint for managing calls
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would fetch from a database
    // For demo, return sample data structure
    return NextResponse.json({
      calls: [],
      stats: {
        total: 0,
        emergencies: 0,
        scheduled: 0,
        avgDuration: 0,
      },
      message: 'Demo mode - calls stored in browser localStorage',
    })
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real implementation, this would save to a database
    // For demo, we'll just return success
    
    return NextResponse.json({
      success: true,
      callId: body.id || `call-${Date.now()}`,
      message: 'Call saved successfully (demo mode)',
    })
  } catch (error) {
    console.error('Error saving call:', error)
    return NextResponse.json(
      { error: 'Failed to save call' },
      { status: 500 }
    )
  }
}

