-- EasyATC Database Schema for Supabase
-- SimpleATC Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security (RLS) on all tables
-- This ensures users can only access their own data

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  preferred_callsign TEXT,
  skill_level TEXT DEFAULT 'beginner',
  total_sessions INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Training Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_attempts INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  scenarios_completed INTEGER DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Individual Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id INTEGER NOT NULL,
  scenario_type TEXT NOT NULL,
  atc_call TEXT NOT NULL,
  user_response TEXT NOT NULL,
  expected_keywords TEXT[] NOT NULL,
  score INTEGER NOT NULL,
  missing_elements TEXT[] DEFAULT '{}',
  present_elements TEXT[] DEFAULT '{}',
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Sessions: Users can only see and modify their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Attempts: Users can only see and modify their own attempts
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attempts_session_id ON attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_scenario_type ON attempts(scenario_type);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferred_callsign)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_callsign', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on profiles
DROP TRIGGER IF EXISTS on_profiles_updated ON profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to safely delete all user data (bypasses RLS)
CREATE OR REPLACE FUNCTION delete_user_progress(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempts_deleted INTEGER;
  sessions_deleted INTEGER;
BEGIN
  -- Delete attempts
  DELETE FROM attempts WHERE user_id = user_id_param;
  GET DIAGNOSTICS attempts_deleted = ROW_COUNT;
  
  -- Delete sessions
  DELETE FROM sessions WHERE user_id = user_id_param;
  GET DIAGNOSTICS sessions_deleted = ROW_COUNT;
  
  -- Reset profile stats
  UPDATE profiles 
  SET 
    total_sessions = 0,
    total_attempts = 0,
    average_score = 0,
    best_score = 0,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN json_build_object(
    'success', true,
    'attempts_deleted', attempts_deleted,
    'sessions_deleted', sessions_deleted
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_progress(UUID) TO authenticated; 