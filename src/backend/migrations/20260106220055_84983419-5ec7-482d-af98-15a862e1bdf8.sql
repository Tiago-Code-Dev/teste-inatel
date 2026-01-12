-- Fix ERROR-level security findings:
-- 1) Restrict profile reads to self (plus admin/manager)
-- 2) Prevent authenticated users from inserting arbitrary telemetry
-- 3) Prevent users from updating/deleting other users' uploaded media

/* 1) PROFILES: restrict SELECT */
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and managers can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

/* 2) TELEMETRY: disallow authenticated inserts */
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Telemetry insert for authenticated" ON public.telemetry;
DROP POLICY IF EXISTS "Service role can insert telemetry" ON public.telemetry;

CREATE POLICY "Service role can insert telemetry"
ON public.telemetry
FOR INSERT
TO service_role
WITH CHECK (true);

/* 3) STORAGE: restrict UPDATE/DELETE to owner (occurrence creator)
   Expected object name format: {occurrence_id}/{...}
*/
DROP POLICY IF EXISTS "Users can update their media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

CREATE POLICY "Users can update their own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM public.occurrences
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete their own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM public.occurrences
    WHERE created_by = auth.uid()
  )
);
