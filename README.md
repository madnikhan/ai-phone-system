# AI Phone System Demo

An AI-powered phone answering system demo for roofing companies built with Next.js 14, featuring voice AI, emergency detection, lead qualification, and appointment scheduling.

## Features

- 🎙️ **Browser-Based Call Simulator** - Test the AI phone system directly in your browser
- 🚨 **Emergency Call Detection** - Automatically detects and prioritizes emergency calls
- 📋 **Lead Qualification** - Intelligently qualifies leads during the call
- 📅 **Appointment Scheduling** - Schedules appointments via voice conversation
- 📊 **Call Analytics Dashboard** - View call history, metrics, and transcripts
- 🎯 **Demo Scenarios** - Pre-built scenarios for testing different call types

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Web Speech API** for Speech-to-Text and Text-to-Speech
- **Twilio API** (demo mode) for telephony integration
- **Browser-based** - No backend required for demo mode

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Browser Requirements

For the best experience, use a modern browser with Web Speech API support:
- Chrome/Edge (recommended)
- Safari (macOS)
- Firefox (limited support)

## Usage

### Making a Demo Call

1. Navigate to the Phone Demo page
2. Choose a demo scenario or click "Make Call" to start fresh
3. Use your microphone to speak (or type in the console for testing)
4. The AI will respond with voice and text
5. View the conversation transcript in real-time

### Demo Scenarios

- **Emergency Roof Leak** - Tests emergency detection and prioritization
- **General Inspection** - Tests general inquiry handling
- **Price Estimation** - Tests quote request handling
- **Follow-up Call** - Tests existing customer follow-up

### Call Analytics

- View all call history
- See call statistics (total, emergencies, scheduled appointments)
- Review full call transcripts
- Filter by emergency calls

## Project Structure

```
app/
  phone-demo/          # Main demo page
  api/
    twilio/            # Twilio integration (demo mode)
    calls/             # Call management API
components/
  PhoneDemoInterface.tsx   # Main interface component
  CallSimulator.tsx        # Browser-based call simulator
  VoiceAIResponder.tsx     # AI voice response system
  CallAnalytics.tsx        # Analytics dashboard
  EmergencyCallHandler.tsx  # Emergency detection UI
lib/
  voice-ai.ts          # Voice AI logic
  call-manager.ts       # Call handling
  stt-tts.ts           # Speech-to-text, text-to-speech
```

## Voice AI Response Flow

1. **Greeting**: "Thank you for calling [Business Name], this is AI Assistant. Are you experiencing a roofing emergency?"

2. **Emergency Path**: 
   - Detects emergency keywords
   - "I understand this is urgent. Is water actively coming in right now?"
   - Schedules emergency slot

3. **General Path**: 
   - "What type of roofing service do you need?"
   - Qualifies lead
   - Schedules appointment

4. **Closing**: 
   - "I've scheduled your appointment for [time]. A technician will call to confirm."

## Emergency Detection

The system automatically detects emergency keywords:
- emergency
- leak
- flood
- water
- urgent
- immediate
- asap
- critical

When detected, the call is:
- Flagged as an emergency
- Prioritized in the system
- Routed for immediate scheduling
- Highlighted in the analytics dashboard

## Twilio Integration

The demo includes Twilio API routes in demo mode. To connect to a real Twilio account:

1. Set up environment variables:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

2. Update the API routes to use real Twilio webhooks
3. Configure your Twilio phone number to point to the webhook URLs

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Database Integration

The system supports **Supabase PostgreSQL** for persistent storage:

- **Automatic Fallback**: If Supabase is not configured, the system automatically uses localStorage
- **Production Ready**: Full database integration with optimized queries
- **Easy Setup**: See `SUPABASE_SETUP.md` for detailed setup instructions

### Quick Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_create_calls_table.sql`
3. Add environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Notes

- The demo uses browser localStorage by default (fallback if Supabase not configured)
- Speech recognition requires microphone permissions
- Some browsers may have limited Web Speech API support
- The demo is optimized for Chrome/Edge browsers

## License

MIT

