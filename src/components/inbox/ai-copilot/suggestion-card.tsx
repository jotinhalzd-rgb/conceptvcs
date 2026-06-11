import React from 'react';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  insight: any;
  onApply: (content: string) => void;
  onReject: () => void;
}

export const SuggestionCard = ({ insight, onApply, onReject }: SuggestionCardProps) => {
  const isReply = insight.type === 'reply';
  const isRisk = insight.type === 'risk';
  const isOpportunity = insight.type === 'opportunity';

  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-right-4 duration-300",
      isReply ? "bg-indigo-600/5 border-indigo-500/20" : 
      isRisk ? "bg-rose-500/5 border-rose-500/20" :
      isOpportunity ? "bg-emerald-500/5 border-emerald-500/20" :
      "bg-white/[0.02] border-white/5"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className={cn(
            "w-3.5 h-3.5",
            isReply ? "text-indigo-400" : isRisk ? "text-rose-400" : "text-emerald-400"
          )} />
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            isReply ? "text-indigo-400" : isRisk ? "text-rose-400" : "text-emerald-400"
          )}>
            {isReply ? "Sugestão de Resposta" : isRisk ? "Alerta de Risco" : isOpportunity ? "Oportunidade" : "Insight"}
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-500 tabular-nums">
          {Math.round(insight.confidence * 100)}% Match
        </span>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed mb-4 italic">
        "{insight.content}"
      </p>

      <div className="flex gap-2">
        {isReply ? (
          <>
            <Button 
              size="sm" 
              onClick={() => onApply(insight.content)}
              className="h-7 bg-indigo-600 hover:bg-indigo-500 text-[9px] font-black uppercase tracking-widest px-3 rounded-lg"
            >
              <Check className="w-3 h-3 mr-1.5" />
              Aplicar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReject}
              className="h-7 text-slate-500 hover:text-slate-300 text-[9px] font-black uppercase tracking-widest px-3"
            >
              Ignorar
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest px-3 bg-white/5"
          >
            Ver Detalhes
            <ArrowRight className="w-3 h-3 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
