import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";
import { toast } from "sonner";

export type AutomationNodes = {
  description?: string;
  queue_id?: string | null;
  channel_id?: string | null;
  responsible_id?: string | null;
  conditions?: Array<{ field: string; op: string; value: string }>;
  actions?: Array<{
    type: "create_notification" | "assign_queue" | "create_crm_task" | "log_event";
    params?: Record<string, unknown>;
  }>;
};

export type Automation = {
  id: string;
  organization_id: string;
  name: string;
  trigger_event: string;
  nodes: AutomationNodes;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AutomationFilters = {
  status?: "all" | "active" | "inactive";
  trigger?: string;
};

export function useAutomations(filters: AutomationFilters = {}) {
  const { data: profile } = useProfile();
  // @ts-ignore organization_id branch
  const orgId: string | undefined = profile?.organization_id;

  return useQuery({
    queryKey: ["automations", orgId, filters],
    enabled: !!orgId,
    queryFn: async (): Promise<Automation[]> => {
      let q = supabase
        .from("automation_workflows")
        .select("*")
        .order("updated_at", { ascending: false });

      if (filters.status === "active") q = q.eq("is_active", true);
      if (filters.status === "inactive") q = q.eq("is_active", false);
      if (filters.trigger && filters.trigger !== "all")
        q = q.eq("trigger_event", filters.trigger);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        nodes: (r.nodes as AutomationNodes) ?? {},
      })) as Automation[];
    },
  });
}

export type AutomationUpsert = {
  id?: string;
  name: string;
  trigger_event: string;
  is_active: boolean;
  nodes: AutomationNodes;
};

export function useAutomationMutations() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  // @ts-ignore
  const orgId: string | undefined = profile?.organization_id;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["automations"] });
    qc.invalidateQueries({ queryKey: ["automation-logs"] });
  };

  const upsert = useMutation({
    mutationFn: async (input: AutomationUpsert) => {
      if (!orgId) throw new Error("Organização não identificada.");
      const payload = {
        organization_id: orgId,
        name: input.name,
        trigger_event: input.trigger_event,
        is_active: input.is_active,
        nodes: input.nodes as unknown as never,
      };
      if (input.id) {
        const { data, error } = await supabase
          .from("automation_workflows")
          .update(payload)
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("automation_workflows")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      invalidate();
      toast.success(vars.id ? "Automação atualizada." : "Automação criada.");
    },
    onError: (e: Error) => toast.error("Erro ao salvar: " + e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("automation_workflows")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error("Erro ao alterar status: " + e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("automation_workflows")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Automação removida.");
    },
    onError: (e: Error) => toast.error("Erro ao remover: " + e.message),
  });

  const duplicate = useMutation({
    mutationFn: async (a: Automation) => {
      if (!orgId) throw new Error("Organização não identificada.");
      const { error } = await supabase.from("automation_workflows").insert({
        organization_id: orgId,
        name: a.name + " (cópia)",
        trigger_event: a.trigger_event,
        is_active: false,
        nodes: a.nodes as unknown as never,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Automação duplicada.");
    },
    onError: (e: Error) => toast.error("Erro ao duplicar: " + e.message),
  });

  return { upsert, toggle, remove, duplicate };
}