import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Activity, Clock, AlertTriangle, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/supervisor")({ component: SupervisorPage });

function SupervisorPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["supervisor", "open-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, status, priority, sla_status, waiting_since, last_message_at, last_message_preview, ai_sentiment, queue_id, queues(name), contacts(name)")
        .eq("status", "open")
        .order("last_message_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 15000,
  });

  const items = data ?? [];
  const breaching = items.filter((c: any) => c.sla_status === "breached" || c.sla_status === "warning").length;
  const queues = new Set(items.map((c: any) => c.queues?.name).filter(Boolean)).size;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Monitoramento ao Vivo</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">Supervisor IA</h1>
        <p className="text-slate-400 text-sm mt-1">Controle em tempo real das conversas ativas.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Conversas Ativas", value: items.length },
          { icon: AlertTriangle, label: "Em Risco SLA", value: breaching },
          { icon: ShieldCheck, label: "Filas Ativas", value: queues },
          { icon: Clock, label: "Aguardando", value: items.filter((c: any) => c.waiting_since).length },
        ].map((s) => (
          <Card key={s.label} className="bg-white/[0.02] border-white/[0.08]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2"><s.icon className="w-4 h-4 text-indigo-400" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span></div>
              <p className="text-2xl font-black text-white italic">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-16 flex flex-col items-center gap-3 text-center">
            <MessageSquare className="w-12 h-12 text-slate-700" />
            <p className="text-slate-400 font-bold">Nenhuma conversa ativa no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-0 divide-y divide-white/5">
            {items.map((c: any) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{c.contacts?.name || "Sem contato"}</p>
                  <p className="text-xs text-slate-500 truncate">{c.last_message_preview || "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.queues?.name && <Badge className="bg-white/5 text-slate-300 border-none text-[9px] uppercase">{c.queues.name}</Badge>}
                  {c.priority && <Badge className="bg-indigo-600/10 text-indigo-400 border-none text-[9px] uppercase">{c.priority}</Badge>}
                  {c.sla_status && <Badge className={`text-[9px] uppercase border-none ${c.sla_status === "breached" ? "bg-rose-500/10 text-rose-400" : c.sla_status === "warning" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>{c.sla_status}</Badge>}
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {c.last_message_at ? formatDistanceToNow(new Date(c.last_message_at), { locale: ptBR, addSuffix: true }) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}