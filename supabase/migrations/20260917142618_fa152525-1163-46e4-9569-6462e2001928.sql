CREATE TABLE public.keyword_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  keyword text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.keyword_alerts TO authenticated;
GRANT ALL ON public.keyword_alerts TO service_role;

ALTER TABLE public.keyword_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own keyword alerts"
  ON public.keyword_alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own keyword alerts"
  ON public.keyword_alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keyword alerts"
  ON public.keyword_alerts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_keyword_alerts_user_id ON public.keyword_alerts(user_id);
CREATE UNIQUE INDEX idx_keyword_alerts_user_keyword ON public.keyword_alerts(user_id, lower(keyword));

CREATE OR REPLACE FUNCTION public.enforce_keyword_alert_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF NEW.keyword IS NULL OR length(btrim(NEW.keyword)) < 2 THEN
    RAISE EXCEPTION 'keyword_too_short';
  END IF;
  NEW.keyword := btrim(NEW.keyword);
  SELECT count(*) INTO v_count FROM public.keyword_alerts WHERE user_id = NEW.user_id;
  IF v_count >= 10 THEN
    RAISE EXCEPTION 'keyword_alert_limit_reached';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_keyword_alert_limit
BEFORE INSERT ON public.keyword_alerts
FOR EACH ROW EXECUTE FUNCTION public.enforce_keyword_alert_limit();

CREATE OR REPLACE FUNCTION public.notify_keyword_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM 'active' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT DISTINCT ka.user_id,
         'keyword_alert',
         'Une recherche correspond à ton alerte ''' || ka.keyword || '''',
         NEW.title,
         '/recherche/' || NEW.id
  FROM public.keyword_alerts ka
  WHERE ka.user_id <> NEW.user_id
    AND (
      NEW.title ILIKE '%' || ka.keyword || '%'
      OR (NEW.description IS NOT NULL AND NEW.description ILIKE '%' || ka.keyword || '%')
    );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_keyword_alerts
AFTER INSERT ON public.searches
FOR EACH ROW EXECUTE FUNCTION public.notify_keyword_alerts();