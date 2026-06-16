import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export interface HubStatus {
  channels: { total: number; connected: number; pending: number; disconnected: number; error: number; withoutDefaultQueue: number };
  queues: { total: number; withoutMembers: number; routingRulesActive: number };
  campaigns: { total: number; active: number; scheduled: number; pending: number; error: number };
  agents: { total: number; active: number; pending: number };
  automations: { total: number; active: number; inactive: number };
  deals: { open: number; unassigned: number; stale: number };
  conversations: { open: number; unassigned: number; slaOverdue: number; slaAtRisk: number };
}

const headCount = async (q: any): Promise<number> => {
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
};

export function useHubStatus() {
  const { data: profile } = useProfile();
  const orgId = (profile as any)?.organization_id as string | undefined;

  return useQuery({
    queryKey: ["hub-status", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<HubStatus> => {
      const baseChannels = () => supabase.from("channels").select("*", { count: "exact", head: true }).eq("organization_id", orgId!);
      const baseQueues = () => supabase.from("queues").select("*", { count: "exact", head: true }).eq("organization_id", orgId!);
      const baseConv = () => supabase.from("conversations").select("*", { count: "exact", head: true }).eq("organization_id", orgId!);
      const baseDeals = () => supabase.from("deals").select("*", { count: "exact", head: true }).eq("organization_id", orgId!);
      const baseAgents = () => supabase.from("ai_agents").select("*", { count: "exact", head: true }).eq("organization_id", orgId!);
      const baseAuto = () => supabase.from("automation_workflows_v2").select("*", { count: "exact", head: true }).eq("organization_id", orgId!);
      const baseCamp = () => supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("organization_id", orgId!);
      const now = new Date().toISOString();
      const in30 = new Date(Date.now() + 30 * 60_000).toISOString();
      const stale = new Date(Date.now() - 14 * 24 * 60 * 60_000).toISOString();

      const [
        chTotal, chConnected, chPending, chDisconnected, chError, chNoQueue,
        qTotal, rrActive,
        campTotal, campActive, campScheduled, campPending, campError,
        agTotal, agActive, agPending,
        autTotal, autActive,
        dlOpen, dlUnassigned, dlStale,
        cvOpen, cvUnassigned, cvOverdue, cvAtRisk,
        qMembers, qIds,
      ] = await Promise.all([
        headCount(baseChannels()),
        headCount(baseChannels().eq("status", "connected")),
        headCount(baseChannels().eq("status", "pending_configuration")),
        headCount(baseChannels().in("status", ["disconnected", "offline"])),
        headCount(baseChannels().eq("status", "error")),
        headCount(baseChannels().is("settings->>default_queue_id", null)),
        headCount(baseQueues()),
        headCount(supabase.from("queue_routing_rules").select("*", { count: "exact", head: true }).eq("organization_id", orgId!).eq("is_active", true)),
        headCount(baseCamp()),
        headCount(baseCamp().in("status", ["active", "sending", "running"])),
        headCount(baseCamp().eq("status", "scheduled")),
        headCount(baseCamp().eq("status", "pending_configuration")),
        headCount(baseCamp().eq("status", "error")),
        headCount(baseAgents()),
        headCount(baseAgents().eq("is_active", true)),
        headCount(baseAgents().eq("status", "pending_configuration")),
        headCount(baseAuto()),
        headCount(baseAuto().eq("is_active", true)),
        headCount(baseDeals().eq("status", "open")),
        headCount(baseDeals().eq("status", "open").is("responsible_id", null)),
        headCount(baseDeals().eq("status", "open").lt("updated_at", stale)),
        headCount(baseConv().is("closed_at", null)),
        headCount(baseConv().is("closed_at", null).is("agent_id", null)),
        headCount(baseConv().is("closed_at", null).lt("sla_due_at", now)),
        headCount(baseConv().is("closed_at", null).gte("sla_due_at", now).lte("sla_due_at", in30)),
        supabase.from("queue_members").select("queue_id").eq("is_active", true),
        supabase.from("queues").select("id").eq("organization_id", orgId!),
      ]);

      const memberIds = new Set((qMembers.data ?? []).map((m: any) => m.queue_id));
      const allQ = (qIds.data ?? []).map((q: any) => q.id);
      const withoutMembers = allQ.filter((id) => !memberIds.has(id)).length;

      return {
        channels: { total: chTotal, connected: chConnected, pending: chPending, disconnected: chDisconnected, error: chError, withoutDefaultQueue: chNoQueue },
        queues: { total: qTotal, withoutMembers, routingRulesActive: rrActive },
        campaigns: { total: campTotal, active: campActive, scheduled: campScheduled, pending: campPending, error: campError },
        agents: { total: agTotal, active: agActive, pending: agPending },
        automations: { total: autTotal, active: autActive, inactive: Math.max(0, autTotal - autActive) },
        deals: { open: dlOpen, unassigned: dlUnassigned, stale: dlStale },
        conversations: { open: cvOpen, unassigned: cvUnassigned, slaOverdue: cvOverdue, slaAtRisk: cvAtRisk },
      };
    },
  });
}