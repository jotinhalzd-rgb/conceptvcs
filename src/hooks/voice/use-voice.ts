import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfile } from "@/hooks/auth/use-auth";

type ExtensionInput = {
  extension_number: string;
  agent_id?: string | null;
  voicemail_enabled?: boolean;
  status?: string;
};

export function useVoiceExtensions() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["voice-extensions", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_extensions")
        .select("*")
        .eq("organization_id", orgId!)
        .order("extension_number", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateExtension() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (input: ExtensionInput) => {
      if (!profile?.organization_id) throw new Error("Organização não encontrada");
      const { data, error } = await supabase
        .from("voice_extensions")
        .insert({
          organization_id: profile.organization_id,
          extension_number: input.extension_number,
          agent_id: input.agent_id ?? null,
          voicemail_enabled: input.voicemail_enabled ?? true,
          status: input.status ?? "offline",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-extensions"] });
      toast.success("Ramal criado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ExtensionInput> }) => {
      const { data, error } = await supabase
        .from("voice_extensions")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-extensions"] });
      toast.success("Ramal atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("voice_extensions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-extensions"] });
      toast.success("Ramal removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useIvrFlows() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["ivr-flows", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ivr_flows")
        .select("*")
        .eq("organization_id", orgId!)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertIvrFlow() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (payload: { id?: string; name: string; nodes: unknown; is_active: boolean }) => {
      if (!profile?.organization_id) throw new Error("Organização não encontrada");
      if (payload.id) {
        const { data, error } = await supabase
          .from("ivr_flows")
          .update({ name: payload.name, nodes: payload.nodes as any, is_active: payload.is_active, updated_at: new Date().toISOString() })
          .eq("id", payload.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("ivr_flows")
        .insert({
          organization_id: profile.organization_id,
          name: payload.name,
          nodes: payload.nodes as any,
          is_active: payload.is_active,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ivr-flows"] });
      toast.success("Fluxo IVR salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteIvrFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ivr_flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ivr-flows"] });
      toast.success("Fluxo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type CallLogFilters = {
  contactId?: string;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
};

export function useCallLogs(filters: CallLogFilters = {}) {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["call-logs", orgId, filters],
    enabled: !!orgId,
    queryFn: async () => {
      let query = supabase
        .from("call_logs")
        .select("*, contacts(name, phone)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(200);

      if (filters.contactId) query = query.eq("contact_id", filters.contactId);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.from) query = query.gte("created_at", filters.from);
      if (filters.to) query = query.lte("created_at", filters.to);
      if (filters.search) {
        query = query.or(`from_number.ilike.%${filters.search}%,to_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateExtensionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extensionId, status }: { extensionId: string, status: string }) => {
      const { data, error } = await supabase
        .from("voice_extensions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", extensionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-extensions"] });
    },
  });
}

/**
 * Provider de voz não está configurado neste momento (Twilio/SIP requer credenciais externas).
 * Retorna pending_configuration honesto.
 */
export function useVoiceProviderStatus() {
  return useQuery({
    queryKey: ["voice-provider-status"],
    staleTime: 60_000,
    queryFn: async () => {
      // No connected voice provider table — return pending_configuration.
      return { configured: false as const, provider: null as string | null, missing: ["voice_provider_credentials"] };
    },
  });
}
