-- Fix permissive RLS policy for analytics_daily
DROP POLICY IF EXISTS "System can insert analytics" ON public.analytics_daily;

-- Create more restrictive policy - only service role or admins can insert
CREATE POLICY "Admins can insert analytics"
ON public.analytics_daily
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));