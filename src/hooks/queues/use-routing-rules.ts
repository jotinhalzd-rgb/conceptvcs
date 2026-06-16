import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type RoutingRule = {
  id: string;
  organization_id: string;
  name: string;
  keywords: string[];
  queue_id: string;
  channel_id: string | null;
  priority: number;
  is_fallback: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RoutingRuleInput = {
  id?: string;
  name: string;
  keywords: string[];
  queue_id: string;
  channel_id?: string | null;
  priority?: number;
  is_fallback?: boolean;
  is_active?: boolean;
};

export function useRoutingRules() {
  return useQuery({
    queryKey: ["queue_routing_rules"],
    queryFn: async (): Promise<RoutingRule[]> => {
      const { data, error } = await supabase
        .from("queue_routing_rules")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RoutingRule[];
    },
  });
}

export function useUpsertRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RoutingRuleInput) => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .maybeSingle();
      const orgId = prof?.organization_id;
      if (!orgId) throw new Error("Organização não encontrada");
      const payload: any = {
        organization_id: orgId,
        name: input.name,
        keywords: input.keywords,
        queue_id: input.queue_id,
        channel_id: input.channel_id ?? null,
        priority: input.priority ?? 0,
        is_fallback: input.is_fallback ?? false,
        is_active: input.is_active ?? true,
      };
      if (input.id) {
        const { error } = await supabase
          .from("queue_routing_rules")
          .update(payload)
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("queue_routing_rules")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue_routing_rules"] });
      toast.success("Regra salva");
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useToggleRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("queue_routing_rules")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue_routing_rules"] });
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDeleteRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("queue_routing_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue_routing_rules"] });
      toast.success("Regra removida");
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}