-- Revogar acesso público/autenticado das funções de trigger confirmadas
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
