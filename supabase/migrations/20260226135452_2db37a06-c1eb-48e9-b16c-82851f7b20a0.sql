
-- Add image_urls array column to searches table
ALTER TABLE public.searches ADD COLUMN image_urls text[] DEFAULT '{}'::text[];

-- Seed some test data with multiple images for existing searches
UPDATE public.searches 
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'
]
WHERE id = (SELECT id FROM public.searches WHERE status = 'active' ORDER BY created_at DESC LIMIT 1);

UPDATE public.searches 
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'
]
WHERE id = (SELECT id FROM public.searches WHERE status = 'active' ORDER BY created_at DESC LIMIT 1 OFFSET 1);

UPDATE public.searches 
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'
]
WHERE id = (SELECT id FROM public.searches WHERE status = 'active' ORDER BY created_at DESC LIMIT 1 OFFSET 2);
