-- 1. Políticas faltantes (Linter Fix)
CREATE POLICY "Public read for services" ON public.hub_services_marketplace
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tenant isolation for reviews" ON public.hub_reviews_marketplace
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Revogação de execução pública (Linter Fix)
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
