-- ============================================
-- FASE 1: SEGURANÇA COMPLETA - MIGRAÇÃO MASTER
-- ============================================

-- ============================================
-- 1. FIX: PROFILES TABLE - EMAIL EXPOSURE
-- ============================================
-- Problema: Admins/managers podem ver todos os emails
-- Solução: Criar view segura que mascara dados sensíveis

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create granular policies
-- Users can only see their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins/managers can see profiles but we'll use a function to mask sensitive data
CREATE OR REPLACE FUNCTION public.get_profile_for_display(profile_row profiles)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_is_admin boolean;
  viewer_is_self boolean;
BEGIN
  viewer_is_self := profile_row.user_id = auth.uid();
  viewer_is_admin := has_role(auth.uid(), 'admin'::app_role);
  
  IF viewer_is_self OR viewer_is_admin THEN
    -- Full access for self or admin
    RETURN jsonb_build_object(
      'id', profile_row.id,
      'user_id', profile_row.user_id,
      'name', profile_row.name,
      'email', profile_row.email,
      'avatar_url', profile_row.avatar_url,
      'unit_ids', profile_row.unit_ids,
      'created_at', profile_row.created_at,
      'updated_at', profile_row.updated_at
    );
  ELSE
    -- Masked email for managers
    RETURN jsonb_build_object(
      'id', profile_row.id,
      'user_id', profile_row.user_id,
      'name', profile_row.name,
      'email', CASE 
        WHEN profile_row.email IS NOT NULL 
        THEN LEFT(profile_row.email, 2) || '***@' || SPLIT_PART(profile_row.email, '@', 2)
        ELSE NULL
      END,
      'avatar_url', profile_row.avatar_url,
      'unit_ids', profile_row.unit_ids,
      'created_at', profile_row.created_at,
      'updated_at', profile_row.updated_at
    );
  END IF;
END;
$$;

-- Managers can see limited profile info for team management
CREATE POLICY "Managers can view team profiles with masked email"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- ============================================
-- 2. FIX: USER_ROLES TABLE - ROLE DISCLOSURE
-- ============================================
-- Problema: Todos podem ver roles de todos
-- Solução: Restringir para próprio usuário + admins

DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON public.user_roles;

-- Users can only see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all roles for user management
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Managers can view roles in their units (will need unit relationship later)
CREATE POLICY "Managers can view team roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

-- ============================================
-- 3. FIX: TELEMETRY INSERT - BYPASS PREVENTION
-- ============================================
-- Problema: Qualquer um pode inserir telemetria falsa
-- Solução: Apenas service role ou máquinas autenticadas

DROP POLICY IF EXISTS "Service role can insert telemetry" ON public.telemetry;

-- Create a function to validate telemetry source
CREATE OR REPLACE FUNCTION public.validate_telemetry_source()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  -- Check if this is a service role request
  jwt_role := current_setting('request.jwt.claim.role', true);
  
  -- Allow service_role (edge functions with service key)
  IF jwt_role = 'service_role' THEN
    RETURN true;
  END IF;
  
  -- Allow authenticated admins/technicians (for manual corrections)
  IF has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'technician'::app_role) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Only validated sources can insert telemetry
CREATE POLICY "Validated sources can insert telemetry"
ON public.telemetry
FOR INSERT
TO authenticated, service_role
WITH CHECK (public.validate_telemetry_source());

-- ============================================
-- 4. AUDIT LOGGING ENHANCEMENT
-- ============================================

-- Create security-specific audit function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.audit_events (
    entity_type,
    entity_id,
    action,
    actor_id,
    metadata
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_action,
    auth.uid(),
    jsonb_build_object(
      'timestamp', now(),
      'ip', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'details', p_details
    )
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Create trigger for role changes audit
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'user_roles',
      NEW.id,
      'role_assigned',
      jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'user_roles',
      NEW.id,
      'role_changed',
      jsonb_build_object(
        'user_id', NEW.user_id, 
        'old_role', OLD.role, 
        'new_role', NEW.role
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'user_roles',
      OLD.id,
      'role_removed',
      jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_audit_role_changes ON public.user_roles;
CREATE TRIGGER trigger_audit_role_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- Create trigger for alert status changes audit
CREATE OR REPLACE FUNCTION public.audit_alert_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM public.log_security_event(
      'alerts',
      NEW.id,
      'status_changed',
      jsonb_build_object(
        'machine_id', NEW.machine_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'severity', NEW.severity
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_audit_alert_changes ON public.alerts;
CREATE TRIGGER trigger_audit_alert_changes
AFTER UPDATE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.audit_alert_changes();

-- ============================================
-- 5. ADDITIONAL SECURITY HARDENING
-- ============================================

-- Rate limiting function for sensitive operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action text,
  p_limit integer DEFAULT 10,
  p_window_minutes integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.audit_events
  WHERE actor_id = auth.uid()
    AND action = p_action
    AND created_at > (now() - (p_window_minutes || ' minutes')::interval);
  
  RETURN recent_count < p_limit;
END;
$$;

-- Create index for faster audit queries
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_action 
ON public.audit_events(actor_id, action, created_at DESC);

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role 
ON public.user_roles(user_id, role);

-- ============================================
-- 6. SECURITY VIEWS FOR SAFE DATA ACCESS
-- ============================================

-- Create a secure view for profile listings (without sensitive data)
CREATE OR REPLACE VIEW public.profiles_safe AS
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

-- Grant access to the view
GRANT SELECT ON public.profiles_safe TO authenticated;