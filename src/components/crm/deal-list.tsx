import React from 'react';
import { useDeals } from "@/hooks/crm/use-deals";
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

interface DealListProps {
  pipelineId?: string;
}

export function DealList({ pipelineId }: DealListProps) {
  const { data: deals, isLoading } = useDeals(pipelineId);

  if (isLoading) {
    return <div className="p-8 text-slate-500 animate-pulse">Carregando negócios...</div>;
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-600">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Nenhum negócio encontrado</p>
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
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Estágio</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Valor</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 h-12">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id} className="border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                <TableCell className="px-6 py-4">
                  <span className="text-sm font-bold text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                    {deal.title}
                  </span>
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
                <TableCell className="px-6 py-4">
                  <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-600/20 font-bold text-[9px] uppercase tracking-tighter">
                    {(deal.stages as any)?.name}
                  </Badge>
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
    </div>
  );
}
