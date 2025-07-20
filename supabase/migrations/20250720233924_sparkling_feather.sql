/*
  # Create advertisements table for admin management

  1. New Tables
    - `advertisements` - Store advertisement data instead of localStorage
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `image_url` (text, optional)
      - `target_url` (text, optional)
      - `position` (text, header/sidebar/footer)
      - `is_active` (boolean)
      - `end_date` (timestamptz, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on advertisements table
    - Add policies for admin users only
*/

-- Advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  target_url text,
  position text NOT NULL CHECK (position IN ('header', 'sidebar', 'footer')),
  is_active boolean DEFAULT true,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Advertisements policies - only admins can manage
CREATE POLICY "Admins can manage advertisements"
  ON advertisements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Everyone can read active advertisements
CREATE POLICY "Everyone can read active advertisements"
  ON advertisements
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (end_date IS NULL OR end_date > now()));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active, position);
CREATE INDEX IF NOT EXISTS idx_advertisements_end_date ON advertisements(end_date);

-- Add updated_at trigger
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();