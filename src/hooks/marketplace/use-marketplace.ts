import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfile } from "@/hooks/auth/use-auth";
import {
  inferProviderFromAsset,
  isChannelAsset,
} from "@/lib/channels/legacy-map";

export function useHubAssets() {
  return useQuery({
    queryKey: ["hub-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_assets_marketplace")
        .select("*")
        .order("asset_title", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useHubInstalls() {
  return useQuery({
    queryKey: ["hub-installs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_installs_marketplace")
        .select(`
          *,
          asset:hub_assets_marketplace(*),
          channel:channels(id, name, provider, status, is_active)
        `)
        .order("installed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useHubPartners() {
  return useQuery({
    queryKey: ["hub-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_partners_marketplace")
        .select("*")
        .eq("is_partner_public", true)
        .order("partner_display_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useHubRevenue() {
  return useQuery({
    queryKey: ["hub-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_revenue_marketplace")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useAPIKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useWebhookSubscriptions() {
  return useQuery({
    queryKey: ["webhook-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}


const externalCategories = new Set(["telecom", "finance", "marketing"]);

export function assetRequiresExternalProvider(asset: any): boolean {
  if (!asset) return false;
  if (asset.asset_type_code === "integration") return true;
  return externalCategories.has(asset.asset_category_code);
}

export function useInstallAsset() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  // @ts-ignore
  const orgId = profile?.organization_id || profile?.company_id;

  return useMutation({
    mutationFn: async (asset: any) => {
      if (!orgId) throw new Error("Organização não encontrada");
      const channelMapping = isChannelAsset(asset) ? inferProviderFromAsset(asset) : null;
      const status = channelMapping || assetRequiresExternalProvider(asset)
        ? "pending_configuration"
        : "installed";
      const { data: install, error } = await supabase
        .from("hub_installs_marketplace")
        .insert([
          {
            organization_id: orgId,
            asset_id: asset.id,
            installed_by_profile_id: profile?.id,
            current_install_status: status,
          },
        ])
        .select()
        .single();
      if (error) throw error;

      // Channel asset: create the paired channels row and cross-link.
      if (channelMapping) {
        const { data: channel, error: chErr } = await supabase
          .from("channels")
          .insert({
            organization_id: orgId,
            provider: channelMapping.providerId,
            channel_type: channelMapping.channelType,
            name: asset.asset_title,
            status: "pending_configuration",
            is_active: false,
            marketplace_install_id: install.id,
            settings: {
              channel_type: channelMapping.channelType,
              config: {},
              source: "marketplace",
              asset_id: asset.id,
            },
            credentials: {},
          })
          .select()
          .single();
        if (chErr) throw chErr;
        await supabase
          .from("hub_installs_marketplace")
          .update({ channel_id: channel.id })
          .eq("id", install.id);
        return { ...install, channel_id: channel.id, channel };
      }

      return install;
    },
    onSuccess: (data: any, asset) => {
      queryClient.invalidateQueries({ queryKey: ["hub-installs"] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      const pending =
        isChannelAsset(asset) ||
        assetRequiresExternalProvider(asset);
      toast.success(
        pending
          ? `${asset.asset_title} instalado — configuração de provedor pendente.`
          : `${asset.asset_title} instalado com sucesso.`
      );
    },
    onError: (e: any) =>
      toast.error("Erro ao instalar: " + (e?.message ?? "desconhecido")),
  });
}

export function useUninstallAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (installId: string) => {
      // Channel was created via marketplace? Detach via SET NULL FK; keep channel row + history.
      const { error } = await supabase
        .from("hub_installs_marketplace")
        .delete()
        .eq("id", installId);
      if (error) throw error;
      return installId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub-installs"] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Integração removida.");
    },
    onError: (e: any) => toast.error("Erro ao remover: " + e.message),
  });
}