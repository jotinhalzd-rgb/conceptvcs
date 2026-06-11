-- 1. Atualizar Tabela de Empresas
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'pro',
ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{"max_users": 10, "max_messages": 10000, "ai_enabled": true}';

INSERT INTO public.companies (id, name, status, plan_type)
VALUES ('00000000-0000-0000-0000-000000000000', 'OneContact Demo Corp', 'active', 'enterprise')
ON CONFLICT (id) DO UPDATE SET status = 'active', plan_type = 'enterprise';

-- 2. Atualizar Perfis
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'agent',
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000000',
ADD COLUMN IF NOT EXISTS impersonated_by UUID REFERENCES auth.users(id);

-- 3. Atualizar Tabelas Transacionais
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE public.customer_events ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE public.satisfaction_surveys ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- 4. Funções auxiliares (Corrigidas)
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_company() RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. RLS Policies
DROP POLICY IF EXISTS "RLS: Campaigns access by role" ON public.campaigns;
CREATE POLICY "RLS: Campaigns access by role" ON public.campaigns
FOR ALL TO authenticated
USING (
    (public.get_user_role() = 'ceo_master') OR 
    (public.get_user_company() = company_id)
)
WITH CHECK (
    (public.get_user_role() = 'ceo_master') OR
    (public.get_user_company() = company_id)
);

-- Grant
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
