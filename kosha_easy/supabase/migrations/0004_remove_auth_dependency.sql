-- Remove auth.users foreign key dependency
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Set up auto-generated UUIDs for profiles
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Drop the old "Admins can insert profiles" policy
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Allow authenticated users (admins) to insert profiles without auth check
-- This is needed because we're no longer using auth.uid()
CREATE POLICY "Allow authenticated insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
