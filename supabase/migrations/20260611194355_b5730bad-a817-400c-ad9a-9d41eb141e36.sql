-- 1. handle_new_user (Deve ser chamada apenas pelo sistema de trigger de auth)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- 2. Triggers de Log (Timeline) - Devem ser executados apenas pelo banco de dados
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM public;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM anon;

REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM public;
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM anon;

REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM public;
REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM anon;

-- 3. refresh_customer_health_score
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM public;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM anon;
