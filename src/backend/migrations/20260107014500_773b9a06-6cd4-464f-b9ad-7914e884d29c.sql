-- ============================================
-- FIX SECURITY LINTER WARNINGS
-- ============================================

-- 1. FIX: Security Definer View - Convert to regular view with RLS
-- The profiles_safe view was created with implicit SECURITY DEFINER
-- We need to recreate it properly

DROP VIEW IF EXISTS public.profiles_safe;

-- Create the view without SECURITY DEFINER (use SECURITY INVOKER which is default)
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
    WHEN p.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
    THEN p.email
    WHEN has_role(auth.uid(), 'manager'::app_role)
    THEN LEFT(p.email, 2) || '***@' || SPLIT_PART(p.email, '@', 2)
    ELSE NULL
  END as email
FROM public.profiles p;

-- Grant access
GRANT SELECT ON public.profiles_safe TO authenticated;

-- 2. FIX: RLS Policy Always True warnings
-- These are coming from alerts and occurrences tables - let's review and fix

-- Fix alerts INSERT policy - should only allow service role or system
DROP POLICY IF EXISTS "System can create alerts" ON public.alerts;

CREATE OR REPLACE FUNCTION public.can_create_alert()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  jwt_role := current_setting('request.jwt.claim.role', true);
  
  -- Allow service_role (edge functions, system)
  IF jwt_role = 'service_role' THEN
    RETURN true;
  END IF;
  
  -- Allow admins and technicians to create alerts manually
  IF has_role(auth.uid(), 'admin'::app_role) OR 
     has_role(auth.uid(), 'technician'::app_role) OR
     has_role(auth.uid(), 'manager'::app_role) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE POLICY "Authorized sources can create alerts"
ON public.alerts
FOR INSERT
TO authenticated, service_role
WITH CHECK (public.can_create_alert());

-- Fix occurrences INSERT - already has proper check (created_by = auth.uid())
-- No changes needed for occurrences

-- 3. Clean up any unused functions
-- (keeping them for now as they may be useful)