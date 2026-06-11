import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfile } from "@/hooks/auth/use-auth";

export function usePlans() {
  return useQuery({
    queryKey: ["billing-plans-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_plans_v2")
        .select("*")
        .eq("is_public", true)
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCurrentSubscription() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["current-subscription-v2", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_subscriptions_v2")
        .select(`
          *,
          plan:billing_plans_v2(*)
        `)
        .eq("organization_id", orgId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useUsageMeters() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["billing-usage-meters", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_usage_meters")
        .select("*")
        .eq("organization_id", orgId!);

      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useInvoices() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["billing-invoices-v2", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_invoices_v2")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useCommissions() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["billing-commissions-v2", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_commissions_v2")
        .select(`
          *,
          asset:hub_assets_marketplace(asset_title)
        `)
        .eq("partner_org_id", orgId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

