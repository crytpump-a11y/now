/*
  # DozAsistan Initial Database Schema

  1. New Tables
    - `users` - User accounts and profiles
    - `medicines` - Medicine information and schedules
    - `medicine_taken` - Medicine intake tracking
    - `notifications` - User notifications
    - `family_profiles` - Family member profiles
    - `mood_entries` - Mood tracking entries
    - `user_stats` - Gamification and achievement stats

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  email text,
  avatar_url text,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  times text[] NOT NULL,
  start_date date NOT NULL,
  end_date date,
  notes text,
  color text DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medicine taken tracking
CREATE TABLE IF NOT EXISTS medicine_taken (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  taken_at timestamptz NOT NULL,
  scheduled_time text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('taken', 'missed', 'pending')),
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Family profiles table
CREATE TABLE IF NOT EXISTS family_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  birth_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mood entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  mood text NOT NULL CHECK (mood IN ('very-bad', 'bad', 'neutral', 'good', 'very-good')),
  energy integer NOT NULL CHECK (energy >= 1 AND energy <= 5),
  symptoms text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- User stats table for gamification
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_medicines_taken integer DEFAULT 0,
  adherence_rate numeric DEFAULT 0,
  level integer DEFAULT 1,
  achievements text[] DEFAULT '{}',
  last_updated timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_taken ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Medicines policies
CREATE POLICY "Users can manage own medicines"
  ON medicines
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Medicine taken policies
CREATE POLICY "Users can manage own medicine tracking"
  ON medicine_taken
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Family profiles policies
CREATE POLICY "Users can manage own family profiles"
  ON family_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Mood entries policies
CREATE POLICY "Users can manage own mood entries"
  ON mood_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can manage own stats"
  ON user_stats
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_active ON medicines(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_medicine_taken_user_id ON medicine_taken(user_id);
CREATE INDEX IF NOT EXISTS idx_medicine_taken_date ON medicine_taken(user_id, taken_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_family_profiles_user_id ON family_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(user_id, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON medicines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_profiles_updated_at
  BEFORE UPDATE ON family_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();