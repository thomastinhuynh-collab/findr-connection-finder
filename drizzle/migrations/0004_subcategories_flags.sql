ALTER TABLE public.searches ADD COLUMN IF NOT EXISTS subcategory text;
CREATE INDEX IF NOT EXISTS idx_searches_category_subcategory ON public.searches (category, subcategory);
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS subcategories_post_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS subcategories_browse_enabled boolean NOT NULL DEFAULT false;
INSERT INTO public.app_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;