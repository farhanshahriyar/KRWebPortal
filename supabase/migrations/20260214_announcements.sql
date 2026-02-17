-- ============================================
-- Announcements Feature
-- ============================================

-- 1. Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'General' CHECK (type IN ('General', 'Tournament', 'Team', 'Important')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'medium', 'normal')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Announcement views table (tracks unique views per user)
CREATE TABLE IF NOT EXISTS public.announcement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- ============================================
-- RLS: announcements
-- ============================================
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read announcements
CREATE POLICY "Anyone can read announcements" ON public.announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only kr_admin can insert
CREATE POLICY "Admins can create announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kr_admin')
  );

-- Only kr_admin can update
CREATE POLICY "Admins can update announcements" ON public.announcements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kr_admin')
  );

-- Only kr_admin can delete
CREATE POLICY "Admins can delete announcements" ON public.announcements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kr_admin')
  );

-- ============================================
-- RLS: announcement_views
-- ============================================
ALTER TABLE public.announcement_views ENABLE ROW LEVEL SECURITY;

-- Users can insert their own view record
CREATE POLICY "Users can record own view" ON public.announcement_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own view records
CREATE POLICY "Users can read own views" ON public.announcement_views
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all view records (for counting)
CREATE POLICY "Admins can read all views" ON public.announcement_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kr_admin')
  );

-- ============================================
-- Triggers
-- ============================================

-- Reuse the update_updated_at_column function (created in valorant_profiles migration)
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RPC: get announcement view counts (for admin)
-- ============================================
CREATE OR REPLACE FUNCTION get_announcement_view_counts()
RETURNS TABLE(announcement_id UUID, view_count BIGINT) AS $$
BEGIN
  RETURN QUERY
    SELECT av.announcement_id, COUNT(*)::BIGINT as view_count
    FROM announcement_views av
    GROUP BY av.announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
