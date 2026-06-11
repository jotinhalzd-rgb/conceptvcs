-- Ajustar a função para seguir melhores práticas de segurança
CREATE OR REPLACE FUNCTION public.get_org_by_channel_identifier(p_identifier TEXT)
RETURNS UUID AS $$
  SELECT organization_id FROM public.channels WHERE identifier = p_identifier LIMIT 1;
$$ LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public;

-- Revogar permissões públicas para garantir que apenas funções internas chamem
REVOKE EXECUTE ON FUNCTION public.get_org_by_channel_identifier(TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_org_by_channel_identifier(TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_org_by_channel_identifier(TEXT) FROM anon;

GRANT EXECUTE ON FUNCTION public.get_org_by_channel_identifier(TEXT) TO service_role;
