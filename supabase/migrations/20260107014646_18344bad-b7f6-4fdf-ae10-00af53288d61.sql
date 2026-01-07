-- ============================================
-- FINAL SECURITY CLEANUP
-- ============================================

-- 1. Drop any duplicate/conflicting telemetry policies
DROP POLICY IF EXISTS "Service role can insert telemetry" ON public.telemetry;
DROP POLICY IF EXISTS "Validated sources can insert telemetry" ON public.telemetry;

-- Create a clean, simple policy for telemetry - service_role only
CREATE POLICY "Service role can insert telemetry"
ON public.telemetry
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also allow admins/technicians to insert manually with proper validation
CREATE POLICY "Admins and technicians can insert telemetry"
ON public.telemetry
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'technician'::app_role)
);

-- 2. Fix profiles_safe view - add security invoker and ensure it uses RLS from underlying table
DROP VIEW IF EXISTS public.profiles_safe;

-- Note: Views with security_invoker = true will use the RLS of the underlying tables
-- This is the correct approach for security
CREATE VIEW public.profiles_safe 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.avatar_url,
  p.unit_ids,
  p.created_at,
  CASE 
    WHEN p.user_id = auth.uid()
    THEN p.email  -- Full email for own profile
    WHEN has_role(auth.uid(), 'admin'::app_role)
    THEN p.email  -- Full email for admins
    WHEN has_role(auth.uid(), 'manager'::app_role)
    THEN LEFT(COALESCE(p.email, ''), 2) || '***@' || SPLIT_PART(COALESCE(p.email, 'unknown@unknown'), '@', 2)
    ELSE NULL  -- No email for others
  END as email
FROM public.profiles p;

GRANT SELECT ON public.profiles_safe TO authenticated;

-- 3. Drop validate_telemetry_source function if it's causing issues
DROP FUNCTION IF EXISTS public.validate_telemetry_source();