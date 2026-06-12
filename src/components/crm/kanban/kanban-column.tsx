import React from 'react';
import { KanbanCard } from "./kanban-card";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  stage: any;
  deals: any[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onCardClick?: (deal: any) => void;
}

export const KanbanColumn = ({ stage, deals, onDragOver, onDrop, onCardClick }: KanbanColumnProps) => {
  const totalValue = deals.reduce((acc, deal) => acc + (Number(deal.value) || 0), 0);

  return (
    <div 
      className="w-80 flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-colors hover:border-white/10"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">{stage.name}</h3>
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white">
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="mb-4 px-1">
        <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.1em]">
          Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
        {deals.map((deal) => (
          <KanbanCard key={deal.id} deal={deal} onClick={() => onCardClick?.(deal)} />
        ))}
      </div>
    </div>
  );
};
