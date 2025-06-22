
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  phone TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cycling-specific user data table
CREATE TABLE public.user_cycling_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  preferred_cycling_type TEXT CHECK (preferred_cycling_type IN ('road', 'mountain', 'hybrid', 'electric', 'bmx')),
  experience_years INTEGER,
  max_heart_rate INTEGER,
  resting_heart_rate INTEGER,
  ftp_watts INTEGER, -- Functional Threshold Power
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create cycling sessions table
CREATE TABLE public.cycling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  distance_km DECIMAL(8,2),
  average_speed_kmh DECIMAL(5,2),
  max_speed_kmh DECIMAL(5,2),
  elevation_gain_m INTEGER,
  calories_burned INTEGER,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  average_power_watts INTEGER,
  max_power_watts INTEGER,
  route_data JSONB, -- Store GPS coordinates and route information
  weather_conditions JSONB, -- Store weather data
  notes TEXT,
  is_active BOOLEAN DEFAULT FALSE, -- For live tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user goals table
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT CHECK (goal_type IN ('distance', 'time', 'sessions', 'weight_loss', 'speed', 'elevation')),
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cycling_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_cycling_data
CREATE POLICY "Users can view their own cycling data" 
  ON public.user_cycling_data FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycling data" 
  ON public.user_cycling_data FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycling data" 
  ON public.user_cycling_data FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cycling_sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.cycling_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.cycling_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.cycling_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.cycling_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals" 
  ON public.user_goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
  ON public.user_goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
  ON public.user_goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
  ON public.user_goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_cycling_data_updated_at 
  BEFORE UPDATE ON public.user_cycling_data 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cycling_sessions_updated_at 
  BEFORE UPDATE ON public.cycling_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at 
  BEFORE UPDATE ON public.user_goals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
