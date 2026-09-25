DROP POLICY "Anyone can view search images" ON storage.objects;
CREATE POLICY "Anyone can view search images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'search-images' AND name != '');