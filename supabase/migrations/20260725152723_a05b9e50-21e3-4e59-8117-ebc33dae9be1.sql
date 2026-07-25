
-- Global app settings (single row)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  gamification_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read app_settings" ON public.app_settings;
CREATE POLICY "Anyone can read app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

INSERT INTO public.app_settings (id, gamification_enabled)
VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

-- XP: on new search
CREATE OR REPLACE FUNCTION public.award_xp_on_search()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
    SET xp_points = COALESCE(xp_points, 0) + 10
    WHERE user_id = NEW.user_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_award_xp_on_search ON public.searches;
CREATE TRIGGER trg_award_xp_on_search
AFTER INSERT ON public.searches
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_search();

-- XP: on new proposal
CREATE OR REPLACE FUNCTION public.award_xp_on_proposal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
    SET xp_points = COALESCE(xp_points, 0) + 15
    WHERE user_id = NEW.findr_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_award_xp_on_proposal ON public.proposals;
CREATE TRIGGER trg_award_xp_on_proposal
AFTER INSERT ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_proposal();

-- XP: on proposal completed
CREATE OR REPLACE FUNCTION public.award_xp_on_proposal_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_buyr_id uuid;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.profiles
      SET xp_points = COALESCE(xp_points, 0) + 50
      WHERE user_id = NEW.findr_id;
    SELECT user_id INTO v_buyr_id FROM public.searches WHERE id = NEW.search_id;
    IF v_buyr_id IS NOT NULL THEN
      UPDATE public.profiles
        SET xp_points = COALESCE(xp_points, 0) + 25
        WHERE user_id = v_buyr_id;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_award_xp_on_proposal_completed ON public.proposals;
CREATE TRIGGER trg_award_xp_on_proposal_completed
AFTER UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_proposal_completed();

-- XP: on positive evaluation
CREATE OR REPLACE FUNCTION public.award_xp_on_evaluation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.rating >= 4 THEN
    UPDATE public.profiles
      SET xp_points = COALESCE(xp_points, 0) + 20
      WHERE user_id = NEW.to_user_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_award_xp_on_evaluation ON public.evaluations;
CREATE TRIGGER trg_award_xp_on_evaluation
AFTER INSERT ON public.evaluations
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_evaluation();
