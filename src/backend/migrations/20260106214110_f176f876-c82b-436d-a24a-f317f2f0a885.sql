-- Tighten alert UPDATE permissions (prevent any authenticated user from modifying alerts)

DROP POLICY IF EXISTS "Users can acknowledge alerts" ON public.alerts;

CREATE POLICY "Authorized users can update alerts"
ON public.alerts
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'technician'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'technician'::app_role)
);
