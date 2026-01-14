-- Create storage bucket for search images
INSERT INTO storage.buckets (id, name, public)
VALUES ('search-images', 'search-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload search images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'search-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to view search images
CREATE POLICY "Anyone can view search images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'search-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own search images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'search-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);