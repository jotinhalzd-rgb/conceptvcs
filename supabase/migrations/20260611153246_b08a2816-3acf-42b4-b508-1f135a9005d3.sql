-- Habilitar pgvector para busca semântica futura
CREATE EXTENSION IF NOT EXISTS vector;

-- Índices para Conversations (Busca por status, fila e prioridade na Inbox)
CREATE INDEX IF NOT EXISTS idx_conversations_status_queue ON public.conversations (status, queue_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations (last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON public.conversations (priority);

-- Índices para Messages (Busca por conversa ordenada por tempo)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON public.messages (conversation_id, created_at ASC);

-- Índice para Omnichannel Events (Timeline do cliente)
CREATE INDEX IF NOT EXISTS idx_omnichannel_events_customer_id_created_at ON public.omnichannel_events (customer_id, created_at DESC);

-- Índice para Tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags (name);

-- Otimizar Knowledge Base para busca vetorial
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON public.knowledge_base USING hnsw (embedding vector_cosine_ops);
