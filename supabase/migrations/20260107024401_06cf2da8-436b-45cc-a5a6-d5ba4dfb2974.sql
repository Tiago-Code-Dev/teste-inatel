-- 1. Add geolocation columns to machines
ALTER TABLE public.machines 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS last_location_at timestamp with time zone;

-- 2. Create comments table for alert collaboration
CREATE TABLE public.alert_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id uuid NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  mentions uuid[] DEFAULT '{}',
  attachment_url text,
  attachment_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert_comments
CREATE POLICY "Users can view comments for alerts they can see"
ON public.alert_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM alerts a
    JOIN machines m ON m.id = a.machine_id
    WHERE a.id = alert_comments.alert_id
    AND user_has_unit_access(auth.uid(), m.unit_id)
  )
);

CREATE POLICY "Authenticated users can create comments"
ON public.alert_comments
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments"
ON public.alert_comments
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete comments"
ON public.alert_comments
FOR DELETE
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_alert_comments_alert_id ON public.alert_comments(alert_id);
CREATE INDEX idx_alert_comments_author_id ON public.alert_comments(author_id);
CREATE INDEX idx_alert_comments_created_at ON public.alert_comments(created_at DESC);

-- 3. Create analytics summary table for caching
CREATE TABLE public.analytics_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  unit_id text NOT NULL,
  total_alerts integer DEFAULT 0,
  resolved_alerts integer DEFAULT 0,
  avg_resolution_time_minutes numeric,
  alerts_by_severity jsonb DEFAULT '{}',
  alerts_by_type jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their units"
ON public.analytics_daily
FOR SELECT
USING (user_has_unit_access(auth.uid(), unit_id));

CREATE POLICY "System can insert analytics"
ON public.analytics_daily
FOR INSERT
WITH CHECK (true);

CREATE UNIQUE INDEX idx_analytics_daily_date_unit ON public.analytics_daily(date, unit_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_comments;

-- Update machines sample data with locations (Brazil coordinates)
UPDATE public.machines SET 
  latitude = -23.5505 + (random() - 0.5) * 2,
  longitude = -46.6333 + (random() - 0.5) * 2,
  last_location_at = now()
WHERE latitude IS NULL;