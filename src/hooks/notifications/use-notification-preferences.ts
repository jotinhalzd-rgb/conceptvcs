import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/use-auth";
import type { PrefKey } from "@/lib/notifications/type-map";

export type NotificationPrefs = Record<PrefKey, boolean> & {
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  inbox_messages: true,
  sla_alerts: true,
  crm_deals: true,
  marketing_campaigns: false,
  business_ai_insights: true,
  system_alerts: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notification-preferences", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<NotificationPrefs> => {
      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_PREFS;
      return {
        inbox_messages: data.inbox_messages ?? true,
        sla_alerts: data.sla_alerts ?? true,
        crm_deals: data.crm_deals ?? true,
        marketing_campaigns: data.marketing_campaigns ?? false,
        business_ai_insights: data.business_ai_insights ?? true,
        system_alerts: data.system_alerts ?? true,
        quiet_hours_start: (data.quiet_hours_start as string | null) ?? null,
        quiet_hours_end: (data.quiet_hours_end as string | null) ?? null,
      };
    },
  });
}

export function useUpdateNotificationPreferences() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<NotificationPrefs>) => {
      if (!user?.id) throw new Error("Sessão expirada");
      const current = qc.getQueryData<NotificationPrefs>(["notification-preferences", user.id]) ?? DEFAULT_PREFS;
      const next = { ...current, ...patch };
      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert(
          { user_id: user.id, ...next, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      if (user?.id) qc.setQueryData(["notification-preferences", user.id], next);
    },
  });
}