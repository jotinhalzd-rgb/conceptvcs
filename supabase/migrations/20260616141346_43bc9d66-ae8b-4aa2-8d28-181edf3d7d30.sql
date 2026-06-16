
-- Bloco 3.1: enforce single default queue per org + unique queue membership
CREATE OR REPLACE FUNCTION public.enforce_single_default_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default = true AND NEW.organization_id IS NOT NULL THEN
    UPDATE public.queues
       SET is_default = false, updated_at = now()
     WHERE organization_id = NEW.organization_id
       AND id <> NEW.id
       AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_single_default_queue ON public.queues;
CREATE TRIGGER trg_enforce_single_default_queue
BEFORE INSERT OR UPDATE OF is_default ON public.queues
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION public.enforce_single_default_queue();

CREATE UNIQUE INDEX IF NOT EXISTS queue_members_queue_user_uniq
  ON public.queue_members (queue_id, user_id);

-- Realtime
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.queues';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_members';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_routing_rules';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
