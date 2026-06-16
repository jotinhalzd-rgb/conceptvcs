import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReportFilters } from "./use-report-filters";

export function useDealsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "deals", filters],
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase
        .from("deals")
        .select("id, title, value, status, stage_id, assigned_to, contact_id, created_at, stages(name)");
      if (filters.from) q = q.gte("created_at", filters.from);
      if (filters.to) q = q.lte("created_at", filters.to);
      if (filters.dealStatus) q = q.eq("status", filters.dealStatus);
      if (filters.agentId) q = q.eq("assigned_to", filters.agentId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}