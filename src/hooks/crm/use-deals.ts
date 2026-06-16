import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function getOrgId(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Usuário não autenticado");
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userData.user.id)
    .single();
  if (!profile?.organization_id) throw new Error("Organização não encontrada");
  return profile.organization_id;
}

async function logDealEvent(opts: { contact_id?: string | null; title: string; description?: string; metadata?: any }) {
  if (!opts.contact_id) return;
  try {
    const organization_id = await getOrgId();
    await supabase.from("customer_events_unified").insert({
      organization_id,
      contact_id: opts.contact_id,
      event_type: "deal",
      title: opts.title,
      description: opts.description ?? null,
      metadata: opts.metadata ?? {},
    });
  } catch { /* non-fatal */ }
}

/* ---------------- PIPELINES ---------------- */
export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; type?: string }) => {
      const organization_id = await getOrgId();
      const { data, error } = await supabase
        .from("pipelines")
        .insert({ name: input.name, type: input.type ?? "sales", organization_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipelines"] }); toast.success("Pipeline criado"); },
    onError: (e: any) => toast.error(`Erro ao criar pipeline: ${e.message}`),
  });
}

export function useUpdatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("pipelines").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipelines"] }); toast.success("Pipeline atualizado"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDeletePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pipelines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipelines"] }); toast.success("Pipeline excluído"); },
    onError: (e: any) => toast.error(`Erro ao excluir pipeline: ${e.message}`),
  });
}

/* ---------------- STAGES ---------------- */
export function useStages(pipelineId?: string) {
  return useQuery({
    queryKey: ["stages", pipelineId],
    queryFn: async () => {
      let query = supabase.from("stages").select("*").order("order_index", { ascending: true });
      if (pipelineId) query = query.eq("pipeline_id", pipelineId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!pipelineId,
  });
}

export function useCreateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { pipeline_id: string; name: string; order_index?: number }) => {
      const { data, error } = await supabase
        .from("stages")
        .insert({ pipeline_id: input.pipeline_id, name: input.name, order_index: input.order_index ?? 0 })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["stages", vars.pipeline_id] }); toast.success("Etapa criada"); },
    onError: (e: any) => toast.error(`Erro ao criar etapa: ${e.message}`),
  });
}

export function useUpdateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("stages").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stages"] }); toast.success("Etapa atualizada"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDeleteStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stages"] }); toast.success("Etapa excluída"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

/* ---------------- DEALS ---------------- */
export type DealFilters = {
  search?: string;
  status?: "open" | "won" | "lost";
  responsible_id?: string;
  fromDate?: string;
  toDate?: string;
};

export function useDeals(pipelineId?: string, filters: DealFilters = {}) {
  return useQuery({
    queryKey: ["deals", pipelineId, filters],
    queryFn: async () => {
      let query = supabase
        .from("deals")
        .select(`*, contacts(id, name, email, phone, lead_score), stages(name, order_index), responsible:responsible_id ( id, full_name )`)
        .order("created_at", { ascending: false });
      if (pipelineId) query = query.eq("pipeline_id", pipelineId);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.responsible_id) query = query.eq("responsible_id", filters.responsible_id);
      if (filters.fromDate) query = query.gte("created_at", filters.fromDate);
      if (filters.toDate) query = query.lte("created_at", filters.toDate);
      if (filters.search) query = query.ilike("title", `%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: any) => {
      const organization_id = await getOrgId();
      const payload = { ...deal, organization_id };
      const { data, error } = await supabase.from("deals").insert(payload).select().single();
      if (error) throw error;
      await logDealEvent({
        contact_id: data.contact_id,
        title: `Negócio criado: ${data.title}`,
        description: `Valor R$ ${data.value ?? 0}`,
        metadata: { deal_id: data.id, status: data.status },
      });
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); toast.success("Negócio criado"); },
    onError: (e: any) => toast.error(`Erro ao criar negócio: ${e.message}`),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from("deals")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      await logDealEvent({
        contact_id: data.contact_id,
        title: `Negócio atualizado: ${data.title}`,
        metadata: { deal_id: data.id, updates },
      });
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); toast.success("Negócio atualizado"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); toast.success("Negócio excluído"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDuplicateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: any) => {
      const { id, created_at, updated_at, contacts, stages, ...rest } = deal;
      const { data, error } = await supabase
        .from("deals")
        .insert({ ...rest, title: `${rest.title} (cópia)` })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); toast.success("Negócio duplicado"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useUpdateDealStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, stageId, fromStageId }: { dealId: string; stageId: string; fromStageId?: string }) => {
      const { data, error } = await supabase
        .from("deals")
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .eq("id", dealId).select().single();
      if (error) throw error;
      await logDealEvent({
        contact_id: data.contact_id,
        title: `Negócio movido de etapa`,
        metadata: { deal_id: dealId, from_stage: fromStageId, to_stage: stageId },
      });
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); },
    onError: (e: any) => toast.error(`Erro ao mover: ${e.message}`),
  });
}

/* ---------------- TASKS ---------------- */
export function useCRMTasks(dealId?: string) {
  return useQuery({
    queryKey: ["crm-tasks", dealId],
    queryFn: async () => {
      let query = supabase.from("crm_tasks").select("*").order("due_date", { ascending: true });
      if (dealId) query = query.eq("deal_id", dealId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: any) => {
      const organization_id = await getOrgId();
      const { data, error } = await supabase
        .from("crm_tasks")
        .insert({ ...task, organization_id, status: task.status ?? "pending" })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crm-tasks"] }); toast.success("Tarefa criada"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("crm_tasks").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crm-tasks"] }); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crm-tasks"] }); toast.success("Tarefa excluída"); },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}

/* ---------------- GOALS / FORECAST ---------------- */
export function useCRMGoals() {
  return useQuery({
    queryKey: ["crm-goals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_goals").select("*").order("end_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCRMForecast(pipelineId?: string) {
  return useQuery({
    queryKey: ["crm-forecast", pipelineId],
    queryFn: async () => {
      let query = supabase.from("crm_forecast").select("*").order("period", { ascending: false });
      if (pipelineId) query = query.eq("pipeline_id", pipelineId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

/** Real-time computed forecast from deals (sem mock). */
export function useComputedForecast(pipelineId?: string) {
  return useQuery({
    queryKey: ["computed-forecast", pipelineId],
    queryFn: async () => {
      let q = supabase.from("deals").select("value, probability, status, stage_id");
      if (pipelineId) q = q.eq("pipeline_id", pipelineId);
      const { data, error } = await q;
      if (error) throw error;
      const deals = data ?? [];
      let predicted = 0, weighted = 0, won = 0, lost = 0, open = 0;
      for (const d of deals) {
        const v = Number(d.value || 0);
        predicted += v;
        weighted += v * (Number(d.probability || 0) / 100);
        if (d.status === "won") won += v;
        else if (d.status === "lost") lost += v;
        else open += v;
      }
      return { predicted, weighted, won, lost, open, count: deals.length };
    },
  });
}
