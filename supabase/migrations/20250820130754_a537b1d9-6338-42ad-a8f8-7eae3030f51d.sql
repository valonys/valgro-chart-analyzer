-- Update RLS policies to allow anonymous uploads for chart images
DROP POLICY IF EXISTS "Authenticated users can upload chart images" ON storage.objects;

CREATE POLICY "Anyone can upload chart images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chart-images');