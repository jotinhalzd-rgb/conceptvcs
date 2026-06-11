import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ["current-subscription"],
    queryFn: async () => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) return null;

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", profile.user.id)
        .single();

      if (!userProfile) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq("company_id", userProfile.company_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
