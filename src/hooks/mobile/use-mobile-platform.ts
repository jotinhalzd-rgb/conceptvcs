import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export const useMobilePlatform = () => {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  // 1. Registro de Token Push
  const registerPushToken = useMutation({
    mutationFn: async ({ token, platform, deviceId }: { token: string, platform: string, deviceId: string }) => {
      const { data, error } = await supabase
        .from("mobile_push_tokens")
        .upsert({
          organization_id: profile?.organization_id!,
          profile_id: profile?.id!,
          device_id: deviceId,
          push_token: token,
          device_platform: platform,
          is_active: true,
          last_seen_at: new Date().toISOString()
        }, { onConflict: 'profile_id,device_id' });
      
      if (error) throw error;
      return data;
    }
  });

  // 2. Registro de Visita de Campo (Geolocalização)
  const recordVisit = useMutation({
    mutationFn: async (visit: {
      contact_id: string;
      deal_id?: string;
      visit_type: string;
      coords: any;
      address?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("mobile_field_visits")
        .insert({
          organization_id: profile?.organization_id!,
          profile_id: profile?.id!,
          contact_id: visit.contact_id,
          deal_id: visit.deal_id,
          visit_type: visit.visit_type,
          location_coords_json: visit.coords,
          location_address: visit.address,
          notes: visit.notes
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-visits"] });
    }
  });

  // 3. Consulta de Visitas Recentes
  const { data: recentVisits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ["mobile-visits", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_field_visits")
        .select(`
          *,
          contacts(name, email)
        `)
        .eq("profile_id", profile?.id!)
        .order("checkin_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  // 4. Logs de Sincronização
  const { data: syncLogs } = useQuery({
    queryKey: ["mobile-sync-logs", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_sync_logs")
        .select("*")
        .eq("profile_id", profile?.id!)
        .order("started_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  return {
    registerPushToken,
    recordVisit,
    recentVisits,
    syncLogs,
    isLoading: isLoadingVisits
  };
};
