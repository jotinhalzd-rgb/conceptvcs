
ALTER TABLE public.queues
  ADD COLUMN IF NOT EXISTS assignment_mode text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_demo    boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'queues_assignment_mode_chk'
  ) THEN
    ALTER TABLE public.queues
      ADD CONSTRAINT queues_assignment_mode_chk
      CHECK (assignment_mode IN ('manual','auto'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS queues_one_default_per_org
  ON public.queues(organization_id) WHERE is_default;

CREATE TABLE IF NOT EXISTS public.queue_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  queue_id uuid NOT NULL REFERENCES public.queues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  capacity int NOT NULL DEFAULT 10,
  priority int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(queue_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.queue_members TO authenticated;
GRANT ALL ON public.queue_members TO service_role;

ALTER TABLE public.queue_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS queue_members_org ON public.queue_members;
CREATE POLICY queue_members_org ON public.queue_members
  FOR ALL TO authenticated
  USING (organization_id = public.current_user_org())
  WITH CHECK (organization_id = public.current_user_org());

DROP TRIGGER IF EXISTS queue_members_updated_at ON public.queue_members;
CREATE TRIGGER queue_members_updated_at BEFORE UPDATE ON public.queue_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS routing_reason text;
