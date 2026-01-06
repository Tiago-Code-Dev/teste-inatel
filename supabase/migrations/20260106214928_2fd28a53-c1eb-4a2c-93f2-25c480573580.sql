-- Fix warn-level security findings:
-- 1) Make media bucket private and require authentication to read media
-- 2) Enforce server-side max length for occurrences.description

-- 1) Storage bucket privacy
UPDATE storage.buckets
SET public = false
WHERE id = 'media-attachments';

-- Replace public read policy with authenticated-only read policy
DROP POLICY IF EXISTS "Media files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read media" ON storage.objects;

CREATE POLICY "Authenticated users can view media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media-attachments');

-- 2) Server-side validation for occurrences.description
ALTER TABLE public.occurrences
  DROP CONSTRAINT IF EXISTS occurrences_description_max_len;

ALTER TABLE public.occurrences
  ADD CONSTRAINT occurrences_description_max_len
  CHECK (char_length(description) <= 500);
