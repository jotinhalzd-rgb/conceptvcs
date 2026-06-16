import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export type AutomationLog = {
  id: string;
  workflow_id: string;
  organization_id: string | null;
  status: string | null;
  trigger_event: string | null;
  input: unknown;
  output: unknown;
  error_message: string | null;
  created_at: string | null;
  created_by: string | null;
};

export type LogFilters = { workflow_id?: string; status?: string };

export function useAutomationLogs(filters: LogFilters = {}, limit = 50) {
  const { data: profile } = useProfile();
  // @ts-ignore
  const orgId: string | undefined = profile?.organization_id;

  return useQuery({
    queryKey: ["automation-logs", orgId, filters, limit],
    enabled: !!orgId,
    queryFn: async (): Promise<AutomationLog[]> => {
      let q = supabase
        .from("automation_logs")
        .select(
          "id, workflow_id, organization_id, status, trigger_event, input, output, error_message, created_at, created_by",
        )
        .order("created_at", { ascending: false })
        .limit(limit);
      if (filters.workflow_id) q = q.eq("workflow_id", filters.workflow_id);
      if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AutomationLog[];
    },
  });
}