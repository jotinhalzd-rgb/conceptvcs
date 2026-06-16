import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export function useOrgUsers() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["org-users", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("organization_id", orgId)
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}