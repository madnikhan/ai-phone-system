import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

const database = new DatabaseService()

// API endpoint for managing calls
export async function GET(request: NextRequest) {
  try {
    const stats = await database.getCallStats()
    const calls = await database.getAllCalls()

    return NextResponse.json({
      calls,
      stats,
      message: 'Calls fetched from Supabase database',
    })
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.timestamp || !body.duration || body.emergency === undefined || !body.outcome) {
      return NextResponse.json(
        { error: 'Missing required fields: timestamp, duration, emergency, outcome' },
        { status: 400 }
      )
    }

    // Save to database
    const savedCall = await database.saveCall({
      id: body.id || `call-${Date.now()}`,
      timestamp: new Date(body.timestamp),
      duration: body.duration,
      emergency: body.emergency,
      emergencyDetected: body.emergencyDetected,
      emergencyConfidence: body.emergencyConfidence,
      emergencySeverity: body.emergencySeverity,
      escalated: body.escalated,
      leadInfo: body.leadInfo || {},
      conversationHistory: body.conversationHistory || [],
      outcome: body.outcome,
    })

    if (!savedCall) {
      return NextResponse.json(
        { error: 'Failed to save call to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      call: savedCall,
      message: 'Call saved successfully to Supabase database',
    })
  } catch (error) {
    console.error('Error saving call:', error)
    return NextResponse.json(
      { error: 'Failed to save call', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
