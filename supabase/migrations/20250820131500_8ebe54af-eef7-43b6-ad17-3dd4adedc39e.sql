-- Use Supabase's built-in storage policy functions
-- First, ensure the bucket allows public uploads
UPDATE storage.buckets SET public = true WHERE id = 'chart-images';

-- Create storage policies using Supabase's policy functions
SELECT storage.foldername('test/file.png');