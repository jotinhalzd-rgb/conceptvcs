import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Activity } from "lucide-react";
import { format } from "date-fns";
import { SmartBackButton } from "@/components/layout/back-button";

export const Route = createFileRoute("/admin/audit")({ component: AdminAuditPage });

function AdminAuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_events_unified")
        .select("id, event_type, title, description, metadata, created_at, contact_id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <SmartBackButton className="mb-4" />
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Trilha de Auditoria</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">Auditoria Global</h1>
        <p className="text-slate-400 text-sm mt-1">{data?.length ?? 0} eventos recentes.</p>
      </header>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : !data?.length ? (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-16 flex flex-col items-center gap-3 text-center">
            <Activity className="w-12 h-12 text-slate-700" />
            <p className="text-slate-400 font-bold">Nenhum evento registrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-0 divide-y divide-white/5">
            {data.map((e: any) => (
              <div key={e.id} className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white truncate">{e.title}</p>
                    <Badge className="bg-white/5 text-slate-400 border-none text-[9px] uppercase">{e.event_type}</Badge>
                  </div>
                  {e.description && <p className="text-xs text-slate-500 truncate">{e.description}</p>}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">{format(new Date(e.created_at), "dd/MM HH:mm")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}