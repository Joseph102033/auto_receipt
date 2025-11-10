ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

DROP INDEX IF EXISTS idx_profiles_email;
CREATE UNIQUE INDEX idx_profiles_email_unique ON public.profiles(email) WHERE email IS NOT NULL AND email != '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
