import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProvider } from "@/lib/channels/providers";
import {
  checkMissingFields,
  computeStatus,
  type ChannelStatus,
} from "@/lib/channels/status";

export function useChannels() {
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateChannelStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ channelId, status }: { channelId: string, status: string }) => {
      const { data, error } = await supabase
        .from("channels")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", channelId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Status do canal atualizado.");
    },
  });
}

async function resolveOrgId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", session.user.id)
    .single();
  if (error || !profile?.organization_id) throw new Error("Organização não encontrada");
  return profile.organization_id;
}

export interface UpsertChannelInput {
  id?: string;
  provider: string;
  name: string;
  identifier?: string | null;
  default_queue_id?: string | null;
  config: Record<string, any>;
  credentials: Record<string, any>;
}

export function useUpsertChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertChannelInput) => {
      const provider = getProvider(input.provider);
      if (!provider) throw new Error("Provedor inválido");

      const status: ChannelStatus = computeStatus(
        provider,
        input.config,
        input.credentials,
      );

      const settings = {
        channel_type: provider.channelType,
        default_queue_id: input.default_queue_id ?? null,
        config: input.config ?? {},
      };

      if (input.id) {
        const hasNewSecrets =
          input.credentials &&
          Object.values(input.credentials).some((v) => `${v ?? ""}`.trim() !== "");
        const updatePayload = hasNewSecrets
          ? {
              name: input.name,
              identifier: input.identifier ?? null,
              settings,
              status,
              credentials: input.credentials,
              updated_at: new Date().toISOString(),
            }
          : {
              name: input.name,
              identifier: input.identifier ?? null,
              settings,
              status,
              updated_at: new Date().toISOString(),
            };
        const { data, error } = await supabase
          .from("channels")
          .update(updatePayload)
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const organization_id = await resolveOrgId();
      const { data, error } = await supabase
        .from("channels")
        .insert({
          organization_id,
          provider: input.provider,
          name: input.name,
          identifier: input.identifier ?? null,
          credentials: input.credentials ?? {},
          settings,
          status,
          is_active: status !== "disconnected",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal salvo.");
    },
    onError: (e: any) => toast.error(`Erro ao salvar: ${e.message}`),
  });
}

export function useDisconnectChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: string) => {
      const { data, error } = await supabase
        .from("channels")
        .update({
          status: "disconnected",
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", channelId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal desconectado. Histórico preservado.");
    },
    onError: (e: any) => toast.error(`Erro ao desconectar: ${e.message}`),
  });
}

export function useTestChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: string) => {
      const { data: channel, error: fetchErr } = await supabase
        .from("channels")
        .select("*")
        .eq("id", channelId)
        .single();
      if (fetchErr || !channel) throw new Error("Canal não encontrado");

      const provider = getProvider(channel.provider);
      if (!provider) throw new Error("Provedor desconhecido");

      const config = (channel.settings as any)?.config ?? {};
      const credentials = (channel.credentials as any) ?? {};
      const { ok, missing } = checkMissingFields(provider, config, credentials);

      if (!ok) {
        await supabase
          .from("channels")
          .update({
            status: "pending_configuration",
            error_log: `Faltam: ${missing.join(", ")}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", channelId);
        throw new Error(`Configuração incompleta. Faltam: ${missing.join(", ")}`);
      }

      // Local schema validation only — não simulamos handshake externo.
      const parsed = provider.schema.safeParse({ ...config, ...credentials });
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => i.message).join("; ");
        await supabase
          .from("channels")
          .update({
            status: "error",
            error_log: msg,
            updated_at: new Date().toISOString(),
          })
          .eq("id", channelId);
        throw new Error(msg);
      }

      const requiresExternal = !!provider.externalDependency;
      const newStatus: ChannelStatus = requiresExternal ? "configured" : "connected";
      const { data, error } = await supabase
        .from("channels")
        .update({
          status: newStatus,
          last_sync_at: new Date().toISOString(),
          error_log: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", channelId)
        .select()
        .single();
      if (error) throw error;
      return { channel: data, requiresExternal };
    },
    onSuccess: ({ requiresExternal }) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      if (requiresExternal) {
        toast.success("Configuração validada. Aguardando provedor externo.");
      } else {
        toast.success("Canal validado com sucesso.");
      }
    },
    onError: (e: any) => toast.error(e.message ?? "Falha ao testar canal"),
  });
}
