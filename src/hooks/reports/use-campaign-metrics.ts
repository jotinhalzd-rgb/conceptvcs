import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReportFilters } from "./use-report-filters";

export function useCampaignsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "campaigns", filters],
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase
        .from("campaigns")
        .select("id, name, status, channel_id, estimated_recipients, created_at, scheduled_at");
      if (filters.from) q = q.gte("created_at", filters.from);
      if (filters.to) q = q.lte("created_at", filters.to);
      if (filters.channelId) q = q.eq("channel_id", filters.channelId);
      if (filters.campaignStatus) q = q.eq("status", filters.campaignStatus);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCampaignRecipientsCount(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "campaign-recipients-count", filters],
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase
        .from("campaign_recipients")
        .select("id", { count: "exact", head: true });
      if (filters.from) q = q.gte("created_at", filters.from);
      if (filters.to) q = q.lte("created_at", filters.to);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useCampaignEvents(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "campaign-events", filters],
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase
        .from("campaign_events")
        .select("id, campaign_id, event_type, created_at, payload")
        .order("created_at", { ascending: false })
        .limit(50);
      if (filters.from) q = q.gte("created_at", filters.from);
      if (filters.to) q = q.lte("created_at", filters.to);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}