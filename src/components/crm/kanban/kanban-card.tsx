import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

interface KanbanCardProps {
  deal: any;
  onClick?: () => void;
}

export const KanbanCard = ({ deal, onClick }: KanbanCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("dealId", deal.id);
    e.dataTransfer.setData("fromStageId", deal.stage_id || "");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-rose-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="p-4 bg-[#030712] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing hover:border-indigo-500/30 transition-all group shadow-lg shadow-black/20"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
          {deal.title}
        </h4>
        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1", getScoreColor(deal.contacts?.lead_score || 0))} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-6 w-6 border border-white/10">
          <AvatarFallback className="text-[8px] font-black bg-indigo-600/20 text-indigo-400">
            {deal.contacts?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <span className="text-[10px] font-bold text-slate-400 truncate">{deal.contacts?.name}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-black text-white tabular-nums">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(deal.value)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 justify-end text-slate-500">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-bold tabular-nums">{deal.probability}%</span>
        </div>
      </div>

      {deal.expected_close_date && (
        <div className="mt-3 flex items-center gap-1.5 text-slate-600">
          <Calendar className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-tighter">
            {new Date(deal.expected_close_date).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};
