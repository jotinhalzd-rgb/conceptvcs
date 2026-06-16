import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReportFilters } from "./use-report-filters";

function applyConv(q: any, f: ReportFilters) {
  if (f.from) q = q.gte("created_at", f.from);
  if (f.to) q = q.lte("created_at", f.to);
  if (f.channelId) q = q.eq("channel_id", f.channelId);
  if (f.queueId) q = q.eq("queue_id", f.queueId);
  if (f.agentId) q = q.eq("agent_id", f.agentId);
  if (f.convStatus) q = q.eq("status", f.convStatus);
  return q;
}

export function useConversationsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "conversations", filters],
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase
        .from("conversations")
        .select(
          "id, created_at, status, channel_id, queue_id, agent_id, sla_due_at, first_response_at, waiting_since, closed_at, routing_reason",
        )
        .order("created_at", { ascending: false });
      q = applyConv(q, filters);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMessagesReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "messages", filters],
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase
        .from("messages")
        .select("id, created_at, direction, conversation_id");
      if (filters.from) q = q.gte("created_at", filters.from);
      if (filters.to) q = q.lte("created_at", filters.to);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}