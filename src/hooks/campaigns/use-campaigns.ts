import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfile } from "@/hooks/auth/use-auth";

export interface CampaignFilters {
  search?: string;
  status?: string;
  channelId?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
  includeArchived?: boolean;
}

export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: ["campaigns", filters],
    queryFn: async () => {
      let q = supabase
        .from("campaigns")
        .select(`*, analytics:campaign_analytics(*)`)
        .order("created_at", { ascending: false });

      if (!filters.includeArchived) {
        q = q.neq("status", "archived");
      }
      if (filters.status) q = q.eq("status", filters.status);
      if (filters.channelId) q = q.eq("channel_id", filters.channelId);
      if (filters.assignedTo) q = q.eq("assigned_to", filters.assignedTo);
      if (filters.search) q = q.ilike("name", `%${filters.search}%`);
      if (filters.fromDate) q = q.gte("created_at", filters.fromDate);
      if (filters.toDate) q = q.lte("created_at", filters.toDate);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCampaign(id?: string) {
  return useQuery({
    queryKey: ["campaign", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCampaignStats() {
  return useQuery({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("status");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        counts[r.status] = (counts[r.status] ?? 0) + 1;
      });
      return counts;
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (campaign: any) => {
      const payload: any = {
        ...campaign,
        organization_id: campaign.organization_id ?? profile?.organization_id,
        company_id: campaign.company_id ?? profile?.company_id ?? "00000000-0000-0000-0000-000000000000",
      };
      const { data, error } = await supabase
        .from("campaigns")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campanha criada com sucesso!");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao criar campanha"),
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", v.id] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar campanha"),
  });
}

export function useDuplicateCampaign() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: src, error: e1 } = await supabase
        .from("campaigns").select("*").eq("id", id).single();
      if (e1) throw e1;
      const { id: _i, created_at: _c, updated_at: _u, archived_at: _a, ...rest } = src as any;
      const { data, error } = await supabase.from("campaigns").insert({
        ...rest,
        name: `${src.name} (cópia)`,
        status: "draft",
        organization_id: rest.organization_id ?? profile?.organization_id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campanha duplicada.");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao duplicar"),
  });
}

export function useArchiveCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "archived", archived_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campanha arquivada.");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao arquivar"),
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campanha excluída.");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao excluir"),
  });
}
