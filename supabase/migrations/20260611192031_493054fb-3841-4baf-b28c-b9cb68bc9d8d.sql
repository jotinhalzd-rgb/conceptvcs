-- 1. Políticas faltantes (Linter Fix)
CREATE POLICY "Public read for exchange rates" ON public.global_exchange_rates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read for retention rules" ON public.global_data_retention_rules
    FOR SELECT TO authenticated USING (true);

-- 2. Revogação de execução pública para segurança forense (Linter Fix)
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

ALTER FUNCTION public.log_deal_to_timeline() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM authenticated;
