ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS archived_at timestamptz;
CREATE INDEX IF NOT EXISTS notifications_user_active_idx ON public.notifications (user_id, created_at DESC) WHERE archived_at IS NULL;
GRANT SELECT, INSERT, UPDATE ON public.user_notification_preferences TO authenticated;
GRANT ALL ON public.user_notification_preferences TO service_role;