ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

CREATE UNIQUE INDEX profiles_email_key ON public.profiles(email) WHERE email IS NOT NULL;
