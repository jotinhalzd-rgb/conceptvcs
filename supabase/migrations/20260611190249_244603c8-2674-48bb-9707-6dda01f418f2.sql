-- Revogar acesso público/autenticado das funções de trigger (linter fix)
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
