-- ============================================
-- PHASE 2: MULTI-TENANCY POR UNIDADE
-- ============================================

-- 1. Create units table for proper unit management
CREATE TABLE public.units (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on units
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger for units
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Security definer function to get user's unit_ids
CREATE OR REPLACE FUNCTION public.get_user_unit_ids(_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(unit_ids, ARRAY[]::text[])
  FROM public.profiles
  WHERE user_id = _user_id
$$;

-- 3. Function to check if user has access to a specific unit
CREATE OR REPLACE FUNCTION public.user_has_unit_access(_user_id uuid, _unit_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND (
        -- Admin has access to all units
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
        -- Or user is assigned to this unit
        OR _unit_id = ANY(unit_ids)
      )
  )
$$;

-- 4. Create RLS policies for units table
CREATE POLICY "Users can view their assigned units"
ON public.units
FOR SELECT
TO authenticated
USING (
  id = ANY(get_user_unit_ids(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can manage units"
ON public.units
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Update machines RLS to filter by user's units
-- First drop existing ALL policy that's too broad
DROP POLICY IF EXISTS "Admins and managers can manage machines" ON public.machines;

-- Recreate more granular policies
CREATE POLICY "Users can view machines in their units"
ON public.machines
FOR SELECT
TO authenticated
USING (
  user_has_unit_access(auth.uid(), unit_id)
);

-- Drop the old view policy since we now have unit-based filtering
DROP POLICY IF EXISTS "Machines are viewable by authenticated users" ON public.machines;

CREATE POLICY "Admins and managers can insert machines"
ON public.machines
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  AND user_has_unit_access(auth.uid(), unit_id)
);

CREATE POLICY "Admins and managers can update machines"
ON public.machines
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  AND user_has_unit_access(auth.uid(), unit_id)
)
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  AND user_has_unit_access(auth.uid(), unit_id)
);

CREATE POLICY "Only admins can delete machines"
ON public.machines
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Update alerts RLS to respect unit boundaries
-- Alerts are linked to machines, so we filter through the machine's unit
DROP POLICY IF EXISTS "Alerts are viewable by authenticated users" ON public.alerts;

CREATE POLICY "Users can view alerts for machines in their units"
ON public.alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.machines m
    WHERE m.id = alerts.machine_id
    AND user_has_unit_access(auth.uid(), m.unit_id)
  )
);

-- 7. Update occurrences RLS for unit boundaries
DROP POLICY IF EXISTS "Occurrences are viewable by authenticated users" ON public.occurrences;

CREATE POLICY "Users can view occurrences for machines in their units"
ON public.occurrences
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.machines m
    WHERE m.id = occurrences.machine_id
    AND user_has_unit_access(auth.uid(), m.unit_id)
  )
);

-- 8. Update telemetry RLS for unit boundaries
DROP POLICY IF EXISTS "Telemetry is viewable by authenticated users" ON public.telemetry;

CREATE POLICY "Users can view telemetry for machines in their units"
ON public.telemetry
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.machines m
    WHERE m.id = telemetry.machine_id
    AND user_has_unit_access(auth.uid(), m.unit_id)
  )
);

-- 9. Update tires RLS for unit boundaries
DROP POLICY IF EXISTS "Tires are viewable by authenticated users" ON public.tires;

CREATE POLICY "Users can view tires for machines in their units"
ON public.tires
FOR SELECT
TO authenticated
USING (
  machine_id IS NULL  -- Unassigned tires visible to all (inventory)
  OR EXISTS (
    SELECT 1 FROM public.machines m
    WHERE m.id = tires.machine_id
    AND user_has_unit_access(auth.uid(), m.unit_id)
  )
);

-- 10. Update tires management policy
DROP POLICY IF EXISTS "Technicians can manage tires" ON public.tires;

CREATE POLICY "Technicians can manage tires in their units"
ON public.tires
FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'technician'::app_role))
  AND (
    machine_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.machines m
      WHERE m.id = tires.machine_id
      AND user_has_unit_access(auth.uid(), m.unit_id)
    )
  )
)
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'technician'::app_role))
  AND (
    machine_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.machines m
      WHERE m.id = tires.machine_id
      AND user_has_unit_access(auth.uid(), m.unit_id)
    )
  )
);

-- 11. Insert some default units for existing data
INSERT INTO public.units (id, name, description) VALUES
  ('unit-1', 'Fazenda Norte', 'Unidade de produção região norte'),
  ('unit-2', 'Fazenda Sul', 'Unidade de produção região sul')
ON CONFLICT (id) DO NOTHING;

-- 12. Create index for performance on unit lookups
CREATE INDEX IF NOT EXISTS idx_machines_unit_id ON public.machines(unit_id);
CREATE INDEX IF NOT EXISTS idx_profiles_unit_ids ON public.profiles USING GIN(unit_ids);