-- Remover restrição antiga se existir e adicionar a nova compatível com a Fase 3
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_status_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_status_check 
CHECK (status IN ('new', 'active', 'waiting_customer', 'transferred', 'resolved', 'archived'));
