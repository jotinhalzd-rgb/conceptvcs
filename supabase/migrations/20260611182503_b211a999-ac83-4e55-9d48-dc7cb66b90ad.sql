-- Tabela para gerenciar inscrições de Push Notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('ios', 'android', 'web')),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, device_token)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Tabela de Preferências de Notificação
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    inbox_messages BOOLEAN DEFAULT true,
    sla_alerts BOOLEAN DEFAULT true,
    crm_deals BOOLEAN DEFAULT true,
    business_ai_insights BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    marketing_campaigns BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_notification_preferences TO authenticated;
GRANT ALL ON public.user_notification_preferences TO service_role;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences" ON public.user_notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Tabela de Sessões de Dispositivos para Segurança (Biometria/Auditoria)
CREATE TABLE IF NOT EXISTS public.device_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT,
    device_model TEXT,
    os_version TEXT,
    biometrics_enabled BOOLEAN DEFAULT false,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_trusted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.device_sessions TO authenticated;
GRANT ALL ON public.device_sessions TO service_role;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own device sessions" ON public.device_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_push_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user ON public.device_sessions(user_id);
