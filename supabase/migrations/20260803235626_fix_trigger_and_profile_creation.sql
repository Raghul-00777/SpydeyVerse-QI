/*
# Fix handle_new_user trigger

1. Problem
- Trigger missing SECURITY DEFINER SET search_path = public
- No EXCEPTION handler — any failure blocks the entire signup
- Schema not explicit (public.profiles vs profiles)

2. Fix
- Re-create function with SET search_path = public
- Add EXCEPTION WHEN OTHERS THEN RETURN new — ensures auth.users insert
  always succeeds even if profile insert fails
- Use explicit public.profiles schema reference
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block auth signup; profile will be created on first login
    RETURN new;
END;
$$;

-- Ensure the trigger is attached correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
