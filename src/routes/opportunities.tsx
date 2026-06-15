import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePipelines, useStages, useDeals } from "@/hooks/crm/use-deals";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import { format } from "date-fns";
import { SmartBackButton } from "@/components/layout/back-button";

export const Route = createFileRoute("/opportunities")({ component: OpportunitiesPage });

function OpportunitiesPage() {
  const [pipelineId, setPipelineId] = useState<string | undefined>(undefined);
  const [stageId, setStageId] = useState<string | undefined>(undefined);

  const { data: pipelines } = usePipelines();
  const { data: stages } = useStages(pipelineId);
  const { data: deals, isLoading } = useDeals(pipelineId);

  const open = (deals ?? []).filter((d: any) => d.status !== "won" && d.status !== "lost" && (!stageId || d.stage_id === stageId));
  const totalValue = open.reduce((s, d: any) => s + Number(d.value || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <SmartBackButton className="mb-4" />
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">Opportunities</h1>
        <p className="text-slate-400 text-sm mt-1">{open.length} negócios abertos · {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)}</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Select value={pipelineId ?? "all"} onValueChange={(v) => { setPipelineId(v === "all" ? undefined : v); setStageId(undefined); }}>
          <SelectTrigger className="w-56 bg-white/[0.03] border-white/10"><SelectValue placeholder="Pipeline" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Pipelines</SelectItem>
            {pipelines?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stageId ?? "all"} onValueChange={(v) => setStageId(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-56 bg-white/[0.03] border-white/10"><SelectValue placeholder="Estágio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Estágios</SelectItem>
            {stages?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : open.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-16 flex flex-col items-center gap-3 text-center">
            <Briefcase className="w-12 h-12 text-slate-700" />
            <p className="text-slate-400 font-bold">Nenhuma oportunidade aberta.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {open.map((d: any) => (
            <Card key={d.id} className="bg-white/[0.02] border-white/[0.08] hover:border-indigo-500/30 transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{d.title}</h3>
                  <Badge className="bg-indigo-600/10 text-indigo-400 border-none text-[9px]">{d.stages?.name || "—"}</Badge>
                </div>
                <p className="text-2xl font-black text-emerald-400 italic">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(d.value || 0))}</p>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>{d.contacts?.name || "Sem contato"}</span>
                  <span>{d.expected_close_date ? format(new Date(d.expected_close_date), "dd/MM") : "—"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}