-- Enable realtime for alerts table
ALTER TABLE public.alerts REPLICA IDENTITY FULL;

-- Enable realtime for occurrences table
ALTER TABLE public.occurrences REPLICA IDENTITY FULL;

-- Enable realtime for machines table
ALTER TABLE public.machines REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.occurrences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;