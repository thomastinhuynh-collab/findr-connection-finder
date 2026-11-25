CREATE OR REPLACE FUNCTION public.guard_message_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.search_id IS DISTINCT FROM OLD.search_id
    OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
    OR NEW.receiver_id IS DISTINCT FROM OLD.receiver_id
    OR NEW.content IS DISTINCT FROM OLD.content
    OR NEW.images IS DISTINCT FROM OLD.images
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'message_immutable';
  END IF;
  IF NEW.is_read IS DISTINCT FROM OLD.is_read
     AND NOT (COALESCE(OLD.is_read, false) = false AND NEW.is_read = true) THEN
    RAISE EXCEPTION 'message_read_irreversible';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_message_update ON public.messages;
CREATE TRIGGER guard_message_update
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.guard_message_update();