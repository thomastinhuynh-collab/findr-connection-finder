CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_searches_title_trgm ON public.searches USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_searches_description_trgm ON public.searches USING GIN (description gin_trgm_ops);