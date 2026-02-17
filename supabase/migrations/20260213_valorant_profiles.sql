-- Create valorant_profiles table for storing player stats
CREATE TABLE IF NOT EXISTS public.valorant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracker_url TEXT NOT NULL,
  riot_name TEXT NOT NULL,
  riot_tag TEXT NOT NULL,
  player_data JSONB,              -- cached stats snapshot
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_delete')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.valorant_profiles ENABLE ROW LEVEL SECURITY;

-- Members can read/write their own row
CREATE POLICY "Users can manage own profile" ON public.valorant_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Admins can read all
CREATE POLICY "Admins read all" ON public.valorant_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kr_admin')
  );

-- Admins can update all (for approving deletes)
CREATE POLICY "Admins update all" ON public.valorant_profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kr_admin')
  );

-- Admins can delete all
CREATE POLICY "Admins delete all" ON public.valorant_profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kr_admin')
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_valorant_profiles_updated_at BEFORE UPDATE ON public.valorant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
