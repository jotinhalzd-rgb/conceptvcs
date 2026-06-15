
ALTER TABLE public.channels       ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.channels       ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.conversations  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.messages       ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.internal_notes ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.contacts       ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.deals          ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Idempotency for simulator + real webhooks
CREATE UNIQUE INDEX IF NOT EXISTS messages_provider_message_id_unique
  ON public.messages (conversation_id, provider_message_id)
  WHERE provider_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_demo
  ON public.conversations (organization_id) WHERE is_demo = true;
