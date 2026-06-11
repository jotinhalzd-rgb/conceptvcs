import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  History, 
  CheckCircle2,
  Target,
  MessageSquare,
  Zap,
  PanelRightClose
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CustomerSidePanelProps {
  chat: any;
  onClose: () => void;
}

export const CustomerSidePanel = ({ chat, onClose }: CustomerSidePanelProps) => {
  return (
    <motion.div 
      initial={{ x: 420 }}
      animate={{ x: 0 }}
      exit={{ x: 420 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="h-full border-l border-white/5 bg-[#030712]/60 backdrop-blur-2xl p-0 overflow-y-auto no-scrollbar flex flex-col z-20"
    >
      {/* Header Fixo */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Customer 360</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={onClose}>
              <PanelRightClose className="w-4 h-4" />
          </Button>
      </div>

      <div className="p-8 space-y-8 flex-1">
          {/* Profile */}
          <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 group">
                  <Avatar className="h-24 w-24 border-4 border-indigo-500/10 p-1 group-hover:border-indigo-500/30 transition-all duration-500">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-3xl font-black">
                          {chat?.contacts?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#030712]" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">{chat?.contacts?.name || "Usuário"}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5">
                {chat?.contacts?.email || "Cliente Enterprise"}
              </p>
          </div>

          {/* Score Grid */}
          <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center transition-all hover:bg-white/[0.04]">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Health Score</p>
                  <p className="text-xl font-black text-emerald-400 tabular-nums">88<span className="text-[10px] text-slate-600 ml-0.5">/100</span></p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center transition-all hover:bg-white/[0.04]">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">NPS Médio</p>
                  <p className="text-xl font-black text-white tabular-nums">9.2</p>
              </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Predictive Insights</h4>
                  <Zap className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-3">
                  <div className="bg-indigo-600/5 border border-indigo-500/10 p-4 rounded-2xl">
                      <div className="flex items-start gap-3">
                          <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                              <span className="text-white font-bold">Oportunidade detectada:</span> Upgrade para o plano Enterprise elevaria o MRR em 40%.
                          </p>
                      </div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
                      <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                              <span className="text-white font-bold">Atenção:</span> Sentimento negativo detectado na última interação.
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Unified Timeline */}
          <div className="space-y-6 pb-10">
              <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timeline Unificada</h4>
                  <History className="w-3.5 h-3.5 text-slate-600" />
              </div>
              
              <div className="space-y-6 relative ml-4 border-l border-white/5 pl-6 py-2">
                  {[
                      { icon: MessageSquare, text: "Atendimento iniciado", time: "12:30", color: "bg-indigo-500/10 text-indigo-400" },
                      { icon: Target, text: "Lead qualificado por IA", time: "11:45", color: "bg-emerald-500/10 text-emerald-400" },
                      { icon: CheckCircle2, text: "Boleto liquidado", time: "Ontem", color: "bg-emerald-500/10 text-emerald-400" },
                  ].map((item, i) => (
                      <div key={i} className="relative">
                          <div className={cn("absolute -left-[36px] top-0 w-8 h-8 rounded-xl flex items-center justify-center border-4 border-[#030712]", item.color)}>
                              <item.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                              <p className="text-xs font-bold text-slate-200">{item.text}</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 tabular-nums">{item.time}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </motion.div>
  );
};
