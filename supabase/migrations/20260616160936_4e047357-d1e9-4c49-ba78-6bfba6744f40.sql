ALTER TABLE public.ai_agents
  ADD COLUMN IF NOT EXISTS queue_id uuid NULL REFERENCES public.queues(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS channel_id uuid NULL REFERENCES public.channels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_ai_agents_queue_id ON public.ai_agents(queue_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_channel_id ON public.ai_agents(channel_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON public.ai_agents(status);