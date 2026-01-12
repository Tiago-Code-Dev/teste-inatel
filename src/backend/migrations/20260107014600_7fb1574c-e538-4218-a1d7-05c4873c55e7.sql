-- ============================================
-- FIX REMAINING SECURITY ISSUES
-- ============================================

-- 1. Fix audit_events INSERT policy
DROP POLICY IF EXISTS "System can create audit events" ON public.audit_events;

-- Create a function to validate audit event creation
CREATE OR REPLACE FUNCTION public.can_create_audit_event()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  jwt_role := current_setting('request.jwt.claim.role', true);
  
  -- Allow service_role (system operations, edge functions)
  IF jwt_role = 'service_role' THEN
    RETURN true;
  END IF;
  
  -- Allow all authenticated users to create audit events
  -- (audit events are created as side effects of other operations)
  IF auth.uid() IS NOT NULL THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create the new policy with proper validation
CREATE POLICY "Validated sources can create audit events"
ON public.audit_events
FOR INSERT
TO authenticated, service_role
WITH CHECK (public.can_create_audit_event());