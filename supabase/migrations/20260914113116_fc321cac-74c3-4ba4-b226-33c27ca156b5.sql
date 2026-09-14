ALTER TABLE public.searches ADD COLUMN IF NOT EXISTS source_lang text NOT NULL DEFAULT 'fr' CHECK (source_lang IN ('fr', 'en'));
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS source_lang text NOT NULL DEFAULT 'fr' CHECK (source_lang IN ('fr', 'en'));

CREATE TABLE public.search_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  target_lang text NOT NULL CHECK (target_lang IN ('fr', 'en')),
  title text NOT NULL,
  description text,
  source_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (search_id, target_lang)
);
GRANT SELECT ON public.search_translations TO anon, authenticated;
GRANT ALL ON public.search_translations TO service_role;
ALTER TABLE public.search_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Search translations follow public searches" ON public.search_translations FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.searches s WHERE s.id = search_id));

CREATE TABLE public.proposal_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  target_lang text NOT NULL CHECK (target_lang IN ('fr', 'en')),
  title text NOT NULL,
  description text,
  source_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, target_lang)
);
GRANT SELECT ON public.proposal_translations TO authenticated;
GRANT ALL ON public.proposal_translations TO service_role;
ALTER TABLE public.proposal_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proposal translations follow proposal access" ON public.proposal_translations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.proposals p JOIN public.searches s ON s.id = p.search_id WHERE p.id = proposal_id AND (p.findr_id = auth.uid() OR s.user_id = auth.uid())));

CREATE INDEX search_translations_lookup_idx ON public.search_translations(search_id, target_lang);
CREATE INDEX proposal_translations_lookup_idx ON public.proposal_translations(proposal_id, target_lang);

CREATE OR REPLACE FUNCTION public.invalidate_content_translations() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'searches' AND (OLD.title IS DISTINCT FROM NEW.title OR OLD.description IS DISTINCT FROM NEW.description OR OLD.source_lang IS DISTINCT FROM NEW.source_lang) THEN
    DELETE FROM public.search_translations WHERE search_id = NEW.id;
  ELSIF TG_TABLE_NAME = 'proposals' AND (OLD.title IS DISTINCT FROM NEW.title OR OLD.description IS DISTINCT FROM NEW.description OR OLD.source_lang IS DISTINCT FROM NEW.source_lang) THEN
    DELETE FROM public.proposal_translations WHERE proposal_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER invalidate_search_translations AFTER UPDATE OF title, description, source_lang ON public.searches FOR EACH ROW EXECUTE FUNCTION public.invalidate_content_translations();
CREATE TRIGGER invalidate_proposal_translations AFTER UPDATE OF title, description, source_lang ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.invalidate_content_translations();
CREATE TRIGGER update_search_translations_updated_at BEFORE UPDATE ON public.search_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposal_translations_updated_at BEFORE UPDATE ON public.proposal_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();