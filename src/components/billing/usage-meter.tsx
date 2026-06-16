import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useUsageMeters } from "@/hooks/billing/use-billing";

export function UsageMeter() {
  const { data: meters = [], isLoading } = useUsageMeters();

  if (isLoading) return <div className="h-32 animate-pulse bg-white/[0.02] rounded-xl" />;
  if (!meters || meters.length === 0) {
    return <EmptyState icon={BarChart3} title="Sem dados de uso ainda" description="A medição aparecerá aqui assim que houver consumo registrado." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {meters.map((m: any) => (
        <div key={m.id} className="bg-[#030712] border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{m.resource_type}</p>
          <p className="text-2xl font-black text-white tabular-nums">{Number(m.quantity_used ?? 0).toLocaleString("pt-BR")}</p>
          {m.reset_cycle_at && (
            <p className="text-[10px] text-slate-500 mt-2">Renova em {new Date(m.reset_cycle_at).toLocaleDateString("pt-BR")}</p>
          )}
        </div>
      ))}
    </div>
  );
}
