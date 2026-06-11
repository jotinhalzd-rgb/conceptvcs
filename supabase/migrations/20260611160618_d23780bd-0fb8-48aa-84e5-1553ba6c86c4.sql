-- Revogar execução pública
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_company() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_company() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_company() FROM authenticated;

-- Garantir que o service_role possa executar (usado para RLS interno)
GRANT EXECUTE ON FUNCTION public.get_user_role() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_company() TO service_role;
