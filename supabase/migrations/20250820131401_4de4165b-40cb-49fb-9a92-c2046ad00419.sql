-- Ensure RLS is enabled and create comprehensive policies for chart-images bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view chart images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload chart images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chart images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chart images" ON storage.objects;

-- Create new comprehensive policies
CREATE POLICY "Public access for chart images" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'chart-images') 
WITH CHECK (bucket_id = 'chart-images');

-- Alternative: Create separate policies for each operation
CREATE POLICY "Anyone can select chart images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chart-images');

CREATE POLICY "Anyone can insert chart images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chart-images');

CREATE POLICY "Anyone can update chart images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chart-images') 
WITH CHECK (bucket_id = 'chart-images');

CREATE POLICY "Anyone can delete chart images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chart-images');