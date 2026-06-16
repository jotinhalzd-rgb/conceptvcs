import React, { useState } from 'react';
import { useDeals, type DealFilters } from "@/hooks/crm/use-deals";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { DealDetailDialog } from "./deal-detail-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Target } from "lucide-react";

interface DealListProps {
  pipelineId?: string;
  filters?: DealFilters;
  onCreateDeal?: () => void;
  onClearFilters?: () => void;
  filtersActive?: boolean;
}

export function DealList({ pipelineId, filters, onCreateDeal, onClearFilters, filtersActive }: DealListProps) {
  const { data: deals, isLoading } = useDeals(pipelineId, filters);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  if (isLoading) {
    return <div className="p-8 text-slate-500 animate-pulse">Carregando negócios...</div>;
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Target}
          title={filtersActive ? "Nenhum resultado para os filtros" : "Nenhum negócio encontrado"}
          description={filtersActive ? "Ajuste ou limpe os filtros." : "Crie sua primeira oportunidade para começar."}
          action={filtersActive
            ? { label: "Limpar filtros", onClick: () => onClearFilters?.() }
            : { label: "Criar oportunidade", onClick: () => onCreateDeal?.() }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Título</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Cliente</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Responsável</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Estágio</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Status</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Valor</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow
                key={deal.id}
                className="border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                onClick={() => setSelectedDeal(deal)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                      {deal.title}
                    </span>
                    {(deal as any).origin_conversation_id && (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase">Omnichannel</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white/10">
                      <AvatarFallback className="bg-slate-800 text-[8px] font-bold text-slate-500">
                        {(deal.contacts as any)?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-300">{(deal.contacts as any)?.name || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-xs text-slate-400">
                  {(deal as any).responsible?.full_name || "—"}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-600/20 font-bold text-[9px] uppercase tracking-tighter">
                    {(deal.stages as any)?.name}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge className={
                    deal.status === "won" ? "bg-emerald-600/10 text-emerald-400 border-emerald-600/20 font-bold text-[9px] uppercase" :
                    deal.status === "lost" ? "bg-rose-600/10 text-rose-400 border-rose-600/20 font-bold text-[9px] uppercase" :
                    "bg-amber-600/10 text-amber-400 border-amber-600/20 font-bold text-[9px] uppercase"
                  }>{deal.status}</Badge>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-xs font-black text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deal.value || 0))}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">
                  {deal.created_at ? format(new Date(deal.created_at), "dd/MM/yyyy") : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DealDetailDialog deal={selectedDeal} open={!!selectedDeal} onOpenChange={(v) => !v && setSelectedDeal(null)} />
    </div>
  );
}
