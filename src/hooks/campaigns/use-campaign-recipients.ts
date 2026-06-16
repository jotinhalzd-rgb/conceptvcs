import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface SegmentFilters {
  search?: string;
  mainChannel?: string;
  status?: string;
  tag?: string;
  fromDate?: string;
}

function applySegment(q: any, f: SegmentFilters) {
  if (f.mainChannel) q = q.eq("main_channel", f.mainChannel);
  if (f.status) q = q.eq("status", f.status);
  if (f.fromDate) q = q.gte("created_at", f.fromDate);
  if (f.search) {
    const s = `%${f.search}%`;
    q = q.or(`name.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
  }
  if (f.tag) q = q.contains("tags", [f.tag]);
  return q;
}

export function useEstimateRecipients(filters: SegmentFilters) {
  return useQuery({
    queryKey: ["estimate-recipients", filters],
    queryFn: async () => {
      let q = supabase.from("contacts").select("id", { count: "exact", head: true });
      q = applySegment(q, filters);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useMaterializeRecipients() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      organizationId,
      filters,
    }: {
      campaignId: string;
      organizationId: string;
      filters: SegmentFilters;
    }) => {
      let q = supabase.from("contacts").select("id");
      q = applySegment(q, filters);
      const { data, error } = await q;
      if (error) throw error;
      const contacts = data ?? [];
      if (contacts.length === 0) return 0;
      const rows = contacts.map((c: any) => ({
        campaign_id: campaignId,
        contact_id: c.id,
        organization_id: organizationId,
        status: "pending",
      }));
      const { error: insErr } = await supabase
        .from("campaign_recipients")
        .upsert(rows, { onConflict: "campaign_id,contact_id", ignoreDuplicates: true });
      if (insErr) throw insErr;
      await supabase
        .from("campaigns")
        .update({ estimated_recipients: contacts.length })
        .eq("id", campaignId);
      await supabase.from("campaign_events").insert({
        campaign_id: campaignId,
        organization_id: organizationId,
        event_type: "recipients_materialized",
        payload: { count: contacts.length, filters: filters as any },
      });
      return contacts.length;
    },
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(`${n} contatos adicionados à campanha.`);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao materializar destinatários"),
  });
}