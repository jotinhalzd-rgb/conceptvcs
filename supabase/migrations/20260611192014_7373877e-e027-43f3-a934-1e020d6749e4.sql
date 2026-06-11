-- 1. Internacionalização (i18n): Repositório de Traduções
CREATE TABLE IF NOT EXISTS public.global_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lang_code TEXT NOT NULL, -- pt-BR, en-US, es-ES, etc.
    translation_key TEXT NOT NULL,
    translation_value TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- ui, labels, notifications, email
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(lang_code, translation_key)
);

-- 2. Localização (l10n): Configurações Regionais
CREATE TABLE IF NOT EXISTS public.global_regions_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code TEXT UNIQUE NOT NULL, -- BR, US, ES, FR, etc.
    default_lang TEXT NOT NULL,
    default_currency TEXT NOT NULL,
    timezone_default TEXT NOT NULL,
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    number_format_config JSONB DEFAULT '{"decimal_sep": ",", "thousand_sep": "."}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Multi-Moeda: Gestão de Câmbio
CREATE TABLE IF NOT EXISTS public.global_currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency_code TEXT UNIQUE NOT NULL, -- BRL, USD, EUR, etc.
    currency_symbol TEXT NOT NULL,
    currency_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.global_exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency TEXT NOT NULL REFERENCES public.global_currencies(currency_code),
    to_currency TEXT NOT NULL REFERENCES public.global_currencies(currency_code),
    rate NUMERIC(18,6) NOT NULL,
    provider_source TEXT, -- Fixer, CentralBank, etc.
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Compliance & Privacidade: Consentimentos e Retenção
CREATE TABLE IF NOT EXISTS public.global_privacy_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    policy_version TEXT NOT NULL,
    consent_type TEXT NOT NULL, -- marketing, tracking, data_sharing
    is_given BOOLEAN DEFAULT false,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.global_data_retention_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code TEXT NOT NULL, -- LATAM, EU, NA
    entity_type TEXT NOT NULL, -- log, message, analytics
    retention_days INTEGER NOT NULL,
    legal_base TEXT, -- LGPD, GDPR, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Logs de Auditoria Global (Observabilidade)
CREATE TABLE IF NOT EXISTS public.global_audit_tracing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    profile_id UUID NOT NULL REFERENCES public.profiles(id),
    action_type TEXT NOT NULL,
    region_executed TEXT,
    latency_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.global_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_regions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_data_retention_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_audit_tracing ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.global_translations TO authenticated;
GRANT ALL ON public.global_translations TO service_role;

GRANT SELECT ON public.global_regions_config TO authenticated;
GRANT ALL ON public.global_regions_config TO service_role;

GRANT SELECT ON public.global_currencies TO authenticated;
GRANT ALL ON public.global_currencies TO service_role;

GRANT SELECT ON public.global_exchange_rates TO authenticated;
GRANT ALL ON public.global_exchange_rates TO service_role;

GRANT SELECT, INSERT ON public.global_privacy_consents TO authenticated;
GRANT ALL ON public.global_privacy_consents TO service_role;

GRANT SELECT ON public.global_data_retention_rules TO authenticated;
GRANT ALL ON public.global_data_retention_rules TO service_role;

GRANT SELECT, INSERT ON public.global_audit_tracing TO authenticated;
GRANT ALL ON public.global_audit_tracing TO service_role;

-- Políticas de RLS
CREATE POLICY "Public read for translations" ON public.global_translations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read for regions" ON public.global_regions_config
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read for currencies" ON public.global_currencies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tenant isolation for privacy consents" ON public.global_privacy_consents
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for audit tracing" ON public.global_audit_tracing
    FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices Performance Global
CREATE INDEX IF NOT EXISTS idx_glob_trans_key ON public.global_translations(translation_key);
CREATE INDEX IF NOT EXISTS idx_glob_audit_org ON public.global_audit_tracing(organization_id);
CREATE INDEX IF NOT EXISTS idx_glob_rates_currencies ON public.global_exchange_rates(from_currency, to_currency);
