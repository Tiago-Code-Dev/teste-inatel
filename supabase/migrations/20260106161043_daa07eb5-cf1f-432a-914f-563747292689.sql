-- Create storage bucket for media attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-attachments', 'media-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media attachments
CREATE POLICY "Media files are publicly accessible" ON storage.objects 
FOR SELECT USING (bucket_id = 'media-attachments');

CREATE POLICY "Authenticated users can upload media" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'media-attachments');

CREATE POLICY "Users can update their media" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'media-attachments');

CREATE POLICY "Users can delete their media" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'media-attachments');