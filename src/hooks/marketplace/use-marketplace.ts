import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
          asset:hub_assets_marketplace(*)
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

