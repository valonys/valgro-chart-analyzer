-- Create storage bucket for chart images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chart-images', 'chart-images', true);

-- Create RLS policies for chart images
CREATE POLICY "Anyone can view chart images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chart-images');

CREATE POLICY "Authenticated users can upload chart images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chart-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own chart images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chart-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chart images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chart-images' AND auth.uid()::text = (storage.foldername(name))[1]);