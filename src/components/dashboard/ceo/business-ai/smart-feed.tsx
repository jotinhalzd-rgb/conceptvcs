import React from 'react';
import { useExecutiveInsights, useResolveInsight } from "@/hooks/core/use-business-ai";
import { 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  MoreHorizontal,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const SmartFeed = () => {
  const { data: insights, isLoading } = useExecutiveInsights();
  const resolveInsight = useResolveInsight();

  const getIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'opportunity': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'milestone': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <TrendingUp className="w-4 h-4 text-indigo-400" />;
    }
  };

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Executive Smart Feed</h3>
        <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          AI Powered
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {insights?.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
              "group p-5 rounded-2xl border transition-all hover:shadow-2xl hover:shadow-black/40",
              insight.insight_type === 'risk' ? "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20" :
              insight.insight_type === 'opportunity' ? "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/20" :
              "bg-white/[0.02] border-white/5 hover:border-white/10"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                insight.insight_type === 'risk' ? "bg-rose-500/10 border-rose-500/20" :
                insight.insight_type === 'opportunity' ? "bg-amber-500/10 border-amber-500/20" :
                "bg-indigo-500/10 border-indigo-500/20"
              )}>
                {getIcon(insight.insight_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors">
                    {insight.title}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1.5 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {new Date(insight.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  {insight.description}
                </p>
                
                {insight.suggested_action && (
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 italic">
                      Sugerido: <span className="text-slate-300">"{insight.suggested_action}"</span>
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        size="sm" 
                        onClick={() => resolveInsight.mutate(insight.id)}
                        className="h-7 bg-white text-[#020617] hover:bg-slate-200 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all active:scale-95"
                      >
                        Executar Ação
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!isLoading && (!insights || insights.length === 0) && (
        <div className="p-12 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h5 className="text-xs font-black text-white uppercase tracking-widest mb-1">Tudo Sob Controle</h5>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Nenhuma anomalia crítica detectada no momento.</p>
        </div>
      )}
    </div>
  );
};
