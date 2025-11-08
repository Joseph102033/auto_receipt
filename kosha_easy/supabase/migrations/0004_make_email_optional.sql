-- Make email optional for participants
-- Only name is required now

-- Remove UNIQUE constraint from email
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Make email nullable
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Add partial unique index: email must be unique only when it's not null
CREATE UNIQUE INDEX profiles_email_key ON public.profiles(email) WHERE email IS NOT NULL;
