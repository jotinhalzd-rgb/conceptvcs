-- Ajuste da função de timeline
ALTER FUNCTION public.log_deal_to_timeline() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM authenticated;

-- Ajuste de outras funções que possam estar vulneráveis (baseado no linter)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
