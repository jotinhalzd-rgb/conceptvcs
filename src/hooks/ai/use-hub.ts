import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";
import { toast } from "sonner";

export const useHub = () => {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const orgId = profile?.organization_id || profile?.company_id;

  const { data: publicProfiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ["hub-public-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_profiles")
        .select("*")
        .eq("is_public", true)
        .order("reputation_score", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["hub-connections", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_connections")
        .select(`
          *,
          target_org:hub_profiles!hub_connections_target_org_id_fkey(*)
        `)
        .eq("source_org_id", orgId!);
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ["hub-marketplace-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_marketplace_assets")
        .select("*")
        .eq("is_public", true)
        .order("download_count", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return {
    publicProfiles,
    connections,
    assets,
    isLoading: isLoadingProfiles || isLoadingConnections || isLoadingAssets,
  };
};
