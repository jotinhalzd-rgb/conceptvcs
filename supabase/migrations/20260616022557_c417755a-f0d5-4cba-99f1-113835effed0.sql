
-- 1) Realtime publication (idempotent)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  payload jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, created_at DESC) WHERE read_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) SLA: sla_minutes default + sla_due_at on conversations
ALTER TABLE public.queues
  ADD COLUMN IF NOT EXISTS sla_minutes integer DEFAULT 60;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS sla_due_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_conversation_sla_due_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m integer;
BEGIN
  IF NEW.queue_id IS NOT NULL THEN
    SELECT COALESCE(sla_minutes, 60) INTO m FROM public.queues WHERE id = NEW.queue_id;
    IF m IS NOT NULL THEN
      NEW.sla_due_at := COALESCE(NEW.created_at, now()) + make_interval(mins => m);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_conversations_sla_due_at ON public.conversations;
CREATE TRIGGER trg_conversations_sla_due_at
  BEFORE INSERT OR UPDATE OF queue_id, created_at ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_conversation_sla_due_at();

-- 4) Notification triggers
CREATE OR REPLACE FUNCTION public.notify_conversation_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  contact_name text;
  queue_name text;
BEGIN
  SELECT name INTO contact_name FROM public.contacts WHERE id = NEW.contact_id;
  SELECT name INTO queue_name FROM public.queues WHERE id = NEW.queue_id;

  IF TG_OP = 'INSERT' THEN
    -- new_conversation for queue members
    IF NEW.queue_id IS NOT NULL THEN
      INSERT INTO public.notifications (organization_id, user_id, type, title, message, payload)
      SELECT NEW.organization_id, qm.user_id, 'new_conversation',
             'Nova conversa em ' || COALESCE(queue_name,'fila'),
             COALESCE(contact_name,'Cliente') || ' iniciou um atendimento.',
             jsonb_build_object('conversation_id', NEW.id, 'queue_id', NEW.queue_id)
      FROM public.queue_members qm
      WHERE qm.queue_id = NEW.queue_id AND qm.is_active = true;
    END IF;
    -- assigned on insert
    IF NEW.agent_id IS NOT NULL THEN
      INSERT INTO public.notifications (organization_id, user_id, type, title, message, payload)
      VALUES (NEW.organization_id, NEW.agent_id, 'conversation_assigned',
              'Conversa atribuída a você',
              COALESCE(contact_name,'Cliente') || ' está aguardando atendimento.',
              jsonb_build_object('conversation_id', NEW.id, 'queue_id', NEW.queue_id));
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.agent_id IS DISTINCT FROM OLD.agent_id AND NEW.agent_id IS NOT NULL THEN
      INSERT INTO public.notifications (organization_id, user_id, type, title, message, payload)
      VALUES (NEW.organization_id, NEW.agent_id, 'conversation_assigned',
              'Conversa atribuída a você',
              COALESCE(contact_name,'Cliente') || ' está aguardando atendimento.',
              jsonb_build_object('conversation_id', NEW.id, 'queue_id', NEW.queue_id));
    END IF;
    IF NEW.queue_id IS DISTINCT FROM OLD.queue_id AND NEW.queue_id IS NOT NULL THEN
      INSERT INTO public.notifications (organization_id, user_id, type, title, message, payload)
      SELECT NEW.organization_id, qm.user_id, 'conversation_transferred',
             'Conversa transferida para ' || COALESCE(queue_name,'fila'),
             COALESCE(contact_name,'Cliente') || ' foi movido para esta fila.',
             jsonb_build_object('conversation_id', NEW.id, 'queue_id', NEW.queue_id, 'from_queue_id', OLD.queue_id)
      FROM public.queue_members qm
      WHERE qm.queue_id = NEW.queue_id AND qm.is_active = true;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_conversation_ins ON public.conversations;
CREATE TRIGGER trg_notify_conversation_ins
  AFTER INSERT ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.notify_conversation_event();

DROP TRIGGER IF EXISTS trg_notify_conversation_upd ON public.conversations;
CREATE TRIGGER trg_notify_conversation_upd
  AFTER UPDATE OF agent_id, queue_id ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.notify_conversation_event();
