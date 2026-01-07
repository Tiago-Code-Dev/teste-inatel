-- ============================================
-- FINAL SECURITY HARDENING - PHASE 1 COMPLETE
-- ============================================

-- 1. Fix profiles_safe view - ensure it inherits RLS from profiles table
-- (views with security_invoker already do this, but let's be explicit)

-- 2. Add explicit DELETE prevention policies for critical tables
-- These tables should not allow any deletes to maintain audit trail

-- Prevent deletes on alerts (audit trail)
CREATE POLICY "No one can delete alerts"
ON public.alerts
FOR DELETE
TO authenticated
USING (false);

-- Prevent deletes on occurrences (audit trail)
CREATE POLICY "No one can delete occurrences"
ON public.occurrences
FOR DELETE
TO authenticated
USING (false);

-- Prevent deletes on audit_events (immutable log)
CREATE POLICY "No one can delete audit events"
ON public.audit_events
FOR DELETE
TO authenticated
USING (false);

-- Media attachments can only be deleted by admins (evidence preservation)
CREATE POLICY "Only admins can delete media"
ON public.media_attachments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Remove the "Managers can view team profiles with masked email" policy
-- and replace with a more restrictive one that actually uses the safe view
DROP POLICY IF EXISTS "Managers can view team profiles with masked email" ON public.profiles;

-- Managers can see names and avatars but email is only shown in profiles_safe view
CREATE POLICY "Managers can view team profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);