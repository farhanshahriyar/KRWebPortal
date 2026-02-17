-- Function to get user emails from auth.users
-- This is needed because profiles table doesn't store email
-- Only accessible to authenticated users (admin/manager will use this)
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT au.id, au.email::text
  FROM auth.users au;
$$;
