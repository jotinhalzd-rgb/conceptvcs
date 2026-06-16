import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfile } from "@/hooks/auth/use-auth";

export type WhiteLabelConfig = {
  id?: string;
  organization_id: string;
  platform_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_domain: string | null;
  support_email: string | null;
  help_center_url: string | null;
  is_active: boolean | null;
};

export function useWhiteLabelConfig() {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["white-label", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("white_label_configs_v2")
        .select("*")
        .eq("organization_id", orgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertWhiteLabel() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (patch: Partial<WhiteLabelConfig>) => {
      if (!profile?.organization_id) throw new Error("Organização não encontrada");
      const payload = {
        organization_id: profile.organization_id,
        platform_name: patch.platform_name ?? "OneContact OS",
        logo_url: patch.logo_url ?? null,
        favicon_url: patch.favicon_url ?? null,
        primary_color: patch.primary_color ?? "#4f46e5",
        secondary_color: patch.secondary_color ?? "#0f172a",
        custom_domain: patch.custom_domain ?? null,
        support_email: patch.support_email ?? null,
        help_center_url: patch.help_center_url ?? null,
        is_active: patch.is_active ?? true,
      };
      const { data, error } = await supabase
        .from("white_label_configs_v2")
        .upsert(payload, { onConflict: "organization_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["white-label"] });
      toast.success("Configuração salva");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/**
 * Domínio personalizado é gravado mas permanece pending_configuration até DNS
 * apontar para a infraestrutura. Não fingimos verificação automática.
 */
export function domainStatus(domain: string | null | undefined): "not_set" | "pending_configuration" {
  if (!domain || !domain.trim()) return "not_set";
  return "pending_configuration";
}