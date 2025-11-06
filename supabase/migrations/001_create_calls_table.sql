-- Create calls table for storing call records
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  emergency BOOLEAN NOT NULL DEFAULT false,
  emergency_detected BOOLEAN,
  emergency_confidence NUMERIC(3, 2),
  emergency_severity TEXT CHECK (emergency_severity IN ('critical', 'high', 'medium', 'low')),
  escalated BOOLEAN,
  lead_info JSONB DEFAULT '{}'::jsonb,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  outcome TEXT NOT NULL CHECK (outcome IN ('scheduled', 'follow_up', 'escalated', 'no_show'))
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON calls(timestamp DESC);

-- Create index on emergency for filtering
CREATE INDEX IF NOT EXISTS idx_calls_emergency ON calls(emergency);

-- Create index on emergency_detected for filtering
CREATE INDEX IF NOT EXISTS idx_calls_emergency_detected ON calls(emergency_detected);

-- Create index on outcome for analytics
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);

-- Enable Row Level Security (RLS)
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations for authenticated users" ON calls
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policy for public access (for demo purposes)
-- In production, you should restrict this based on your requirements
CREATE POLICY "Allow public read access" ON calls
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access" ON calls
  FOR INSERT
  WITH CHECK (true);

