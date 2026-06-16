import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WebhookLogFilters {
  channelId?: string | null;
  status?: string | null;
  fromIso?: string | null;
  toIso?: string | null;
  provider?: string | null;
  limit?: number;
}

export function useWebhookLogs(filters: WebhookLogFilters = {}) {
  return useQuery({
    queryKey: ["webhook-logs", filters],
    queryFn: async () => {
      let q = supabase
        .from("channel_webhooks_log")
        .select("id, channel_id, provider, payload, status, error_message, processed_at, channels:channel_id(name, provider)")
        .order("processed_at", { ascending: false })
        .limit(filters.limit ?? 200);
      if (filters.channelId) q = q.eq("channel_id", filters.channelId);
      if (filters.status) q = q.eq("status", filters.status);
      if (filters.provider) q = q.ilike("provider", `%${filters.provider}%`);
      if (filters.fromIso) q = q.gte("processed_at", filters.fromIso);
      if (filters.toIso) q = q.lte("processed_at", filters.toIso);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useWebhookLogChannels() {
  return useQuery({
    queryKey: ["webhook-log-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("id, name, provider, is_active, status, last_sync_at, credentials")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        ...c,
        has_webhook_secret: !!(c.credentials && (c.credentials as any).webhook_secret),
      }));
    },
  });
}