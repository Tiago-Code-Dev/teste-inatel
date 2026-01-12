-- TireWatch Pro F1 - Database Schema

-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'technician', 'operator');

-- Create user roles table for RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'operator',
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    unit_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create machines table
CREATE TABLE public.machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'warning', 'critical', 'offline')),
    image_url TEXT,
    last_telemetry_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- Create tires table
CREATE TABLE public.tires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial TEXT NOT NULL UNIQUE,
    machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
    position TEXT,
    lifecycle_status TEXT NOT NULL DEFAULT 'new' CHECK (lifecycle_status IN ('new', 'in_use', 'maintenance', 'retired')),
    recommended_pressure DECIMAL(5,2) NOT NULL DEFAULT 28.0,
    current_pressure DECIMAL(5,2),
    installed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tires ENABLE ROW LEVEL SECURITY;

-- Create telemetry table (high volume - 10s intervals)
CREATE TABLE public.telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
    tire_id UUID REFERENCES public.tires(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    pressure DECIMAL(5,2) NOT NULL,
    speed DECIMAL(6,2) NOT NULL,
    seq INTEGER NOT NULL,
    UNIQUE (machine_id, timestamp, seq)
);

ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;

-- Create index for efficient telemetry queries
CREATE INDEX idx_telemetry_machine_timestamp ON public.telemetry(machine_id, timestamp DESC);

-- Create alerts table
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
    tire_id UUID REFERENCES public.tires(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('pressure_low', 'pressure_high', 'speed_exceeded', 'no_signal', 'anomaly')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved')),
    message TEXT NOT NULL,
    reason TEXT,
    probable_cause TEXT,
    recommended_action TEXT,
    acknowledged_by UUID REFERENCES auth.users(id),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create index for alerts by status
CREATE INDEX idx_alerts_status ON public.alerts(status, severity DESC);

-- Create occurrences table
CREATE TABLE public.occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES public.alerts(id) ON DELETE SET NULL,
    machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
    tire_id UUID REFERENCES public.tires(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('pending_upload', 'uploading', 'open', 'in_progress', 'resolved', 'closed')),
    description TEXT NOT NULL,
    is_offline_created BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;

-- Create media attachments table
CREATE TABLE public.media_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurrence_id UUID REFERENCES public.occurrences(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'video')),
    file_path TEXT NOT NULL,
    file_url TEXT,
    size INTEGER,
    duration INTEGER,
    upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_attachments ENABLE ROW LEVEL SECURITY;

-- Create audit events table
CREATE TABLE public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON public.machines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tires_updated_at BEFORE UPDATE ON public.tires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_occurrences_updated_at BEFORE UPDATE ON public.occurrences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_media_attachments_updated_at BEFORE UPDATE ON public.media_attachments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', 'Usuário'), NEW.email);
    
    -- Assign default operator role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'operator');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users can view all profiles but only update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles: viewable by authenticated, manageable by admins
CREATE POLICY "Roles are viewable by authenticated users" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Machines: viewable by all authenticated users
CREATE POLICY "Machines are viewable by authenticated users" ON public.machines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage machines" ON public.machines FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Tires: viewable by all authenticated users
CREATE POLICY "Tires are viewable by authenticated users" ON public.tires FOR SELECT TO authenticated USING (true);
CREATE POLICY "Technicians can manage tires" ON public.tires FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'technician'));

-- Telemetry: viewable by all authenticated users (read-heavy, write by system)
CREATE POLICY "Telemetry is viewable by authenticated users" ON public.telemetry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Telemetry insert for authenticated" ON public.telemetry FOR INSERT TO authenticated WITH CHECK (true);

-- Alerts: viewable by all, manageable by role
CREATE POLICY "Alerts are viewable by authenticated users" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can acknowledge alerts" ON public.alerts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "System can create alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);

-- Occurrences: viewable by all, creators can edit their own
CREATE POLICY "Occurrences are viewable by authenticated users" ON public.occurrences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create occurrences" ON public.occurrences FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators and managers can update occurrences" ON public.occurrences FOR UPDATE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- Media attachments: follows occurrence permissions
CREATE POLICY "Media viewable by authenticated users" ON public.media_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload media to their occurrences" ON public.media_attachments FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.occurrences WHERE id = occurrence_id AND created_by = auth.uid())
);
CREATE POLICY "Users can update their media" ON public.media_attachments FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.occurrences WHERE id = occurrence_id AND created_by = auth.uid())
);

-- Audit events: viewable by admins and managers
CREATE POLICY "Audit viewable by admins and managers" ON public.audit_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "System can create audit events" ON public.audit_events FOR INSERT TO authenticated WITH CHECK (true);

-- Insert seed data for machines and tires
INSERT INTO public.machines (id, name, model, unit_id, status, last_telemetry_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Trator John Deere 8R 410', '8R 410', 'unit-1', 'critical', now() - interval '15 seconds'),
    ('22222222-2222-2222-2222-222222222222', 'Colheitadeira S790', 'S790', 'unit-1', 'warning', now() - interval '8 seconds'),
    ('33333333-3333-3333-3333-333333333333', 'Pulverizador M4040', 'M4040', 'unit-1', 'operational', now() - interval '5 seconds'),
    ('44444444-4444-4444-4444-444444444444', 'Trator 6M 185', '6M 185', 'unit-2', 'operational', now() - interval '12 seconds'),
    ('55555555-5555-5555-5555-555555555555', 'Carregadeira 544L', '544L', 'unit-2', 'offline', now() - interval '10 minutes'),
    ('66666666-6666-6666-6666-666666666666', 'Retroescavadeira 310L', '310L', 'unit-1', 'operational', now() - interval '7 seconds');

INSERT INTO public.tires (id, serial, machine_id, position, lifecycle_status, recommended_pressure, current_pressure, installed_at) VALUES
    ('aaaa1111-1111-1111-1111-111111111111', 'MICH-2024-001234', '11111111-1111-1111-1111-111111111111', 'Dianteiro Esquerdo', 'in_use', 28.0, 18.5, '2024-06-15'),
    ('aaaa2222-2222-2222-2222-222222222222', 'MICH-2024-001235', '11111111-1111-1111-1111-111111111111', 'Dianteiro Direito', 'in_use', 28.0, 27.8, '2024-06-15'),
    ('aaaa3333-3333-3333-3333-333333333333', 'FIRE-2024-005678', '22222222-2222-2222-2222-222222222222', 'Traseiro Esquerdo', 'in_use', 35.0, 32.0, '2024-03-20');

-- Insert sample alerts
INSERT INTO public.alerts (machine_id, tire_id, type, severity, status, message, reason, probable_cause, recommended_action) VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'pressure_low', 'critical', 'open', 'Pressão crítica detectada', 'Pressão 34% abaixo do recomendado (18.5 PSI vs 28 PSI)', 'Possível furo ou vazamento no pneu', 'Parar a máquina imediatamente e verificar o pneu'),
    ('22222222-2222-2222-2222-222222222222', 'aaaa3333-3333-3333-3333-333333333333', 'pressure_low', 'medium', 'acknowledged', 'Pressão abaixo do ideal', 'Pressão 8.5% abaixo do recomendado (32 PSI vs 35 PSI)', 'Perda gradual de pressão', 'Verificar calibração na próxima parada'),
    ('11111111-1111-1111-1111-111111111111', NULL, 'speed_exceeded', 'high', 'open', 'Velocidade excessiva detectada', 'Velocidade de 52 km/h excede o limite de 40 km/h', 'Operador excedendo velocidade segura', 'Reduzir velocidade para evitar danos'),
    ('55555555-5555-5555-5555-555555555555', NULL, 'no_signal', 'low', 'open', 'Sem sinal há 10+ minutos', 'Última telemetria há 10 minutos', 'Área sem cobertura ou equipamento desligado', 'Verificar status do equipamento');