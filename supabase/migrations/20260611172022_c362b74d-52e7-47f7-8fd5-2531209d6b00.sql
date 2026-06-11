-- Ajuste de segurança para a função de trigger
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
