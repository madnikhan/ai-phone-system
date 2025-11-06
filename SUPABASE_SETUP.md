# Supabase Database Setup

This guide will help you set up Supabase PostgreSQL database for the AI Phone System.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `ai-phone-system`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"
6. Wait for project to be created (2-3 minutes)

## Step 2: Run Database Migration

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the contents of `supabase/migrations/001_create_calls_table.sql`
5. Paste into the SQL editor
6. Click "Run" to execute the migration
7. Verify the table was created by checking the "Table Editor"

## Step 3: Get API Credentials

1. In your Supabase project, go to "Settings" → "API"
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. For Vercel deployment, add these in:
   - Vercel Dashboard → Your Project → Settings → Environment Variables

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Make a test call in the demo
3. Check your Supabase dashboard → Table Editor → `calls` table
4. You should see the call record saved

## Database Schema

The `calls` table structure:

- `id` (UUID) - Primary key
- `created_at` (Timestamp) - Auto-generated
- `timestamp` (Timestamp) - Call timestamp
- `duration` (Integer) - Call duration in seconds
- `emergency` (Boolean) - Emergency flag
- `emergency_detected` (Boolean) - Emergency detection flag
- `emergency_confidence` (Decimal) - Detection confidence (0-1)
- `emergency_severity` (Text) - 'critical', 'high', 'medium', 'low'
- `escalated` (Boolean) - Escalation flag
- `lead_info` (JSONB) - Lead information object
- `conversation_history` (JSONB) - Array of conversation messages
- `outcome` (Text) - 'scheduled', 'follow_up', 'escalated', 'no_show'

## Features

✅ **Automatic Fallback**: If Supabase is not configured, the system falls back to localStorage  
✅ **Real-time Updates**: Use Supabase real-time subscriptions for live updates  
✅ **Row Level Security**: Configured for public access (adjust for production)  
✅ **Indexed Queries**: Optimized for fast queries on timestamp, emergency, and outcome  

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and API key are correct
- Check that the migration was run successfully
- Ensure RLS policies allow insert/select operations

### Data Not Appearing
- Check browser console for errors
- Verify environment variables are set correctly
- Check Supabase logs in the dashboard

### Migration Errors
- Make sure you're using the correct Supabase project
- Check that the table doesn't already exist
- Verify your database password is correct

## Next Steps

1. **Customize RLS Policies**: Update Row Level Security policies for production
2. **Add Authentication**: Integrate Supabase Auth for multi-user support
3. **Enable Real-time**: Use Supabase real-time for live updates
4. **Set up Backups**: Configure automatic backups in Supabase dashboard

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

