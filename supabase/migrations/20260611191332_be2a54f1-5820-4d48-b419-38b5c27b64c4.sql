-- Revogar acesso público/autenticado das funções de trigger confirmadas (Linter Fix)
ALTER FUNCTION public.log_ticket_to_timeline() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM authenticated;

ALTER FUNCTION public.log_billing_to_timeline() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM authenticated;

ALTER FUNCTION public.refresh_customer_health_score() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM authenticated;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
