import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useIntegrationApps() {
  return useQuery({
    queryKey: ["integration-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_apps")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useConnectedIntegrations() {
  return useQuery({
    queryKey: ["connected-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connected_integrations")
        .select(`
          *,
          app:integration_apps(*)
        `)
        .order("updated_at", { ascending: false });

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
