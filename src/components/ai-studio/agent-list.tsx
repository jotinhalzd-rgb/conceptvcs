import React from 'react';
import { useAgents } from "@/hooks/ai/use-agents";
import { 
  Bot, 
  Settings2, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  ShieldAlert,
  BrainCircuit,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export const AgentList = ({ onEdit }: { onEdit: (agent: any) => void }) => {
  const { agents, isLoading } = useAgents();

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Carregando Agentes...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onEdit(null)}
        className="h-[280px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Plus className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-white font-black uppercase tracking-widest">Novo Agente</p>
          <p className="text-slate-500 text-xs mt-1">Criar especialista digital</p>
        </div>
      </motion.button>

      {agents?.map((agent) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 relative group overflow-hidden"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex gap-2">
              <Badge className={agent.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/10 text-slate-500"}>
                {agent.is_active ? "Ativo" : "Inativo"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => onEdit(agent)} className="rounded-xl hover:bg-white/5 text-slate-400">
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <h3 className="text-white font-black uppercase tracking-wider mb-2">{agent.name}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-2">
            {agent.description || "Sem descrição disponível."}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Nível</p>
              <div className="flex items-center gap-2">
                {agent.autonomy_level === 'autonomous' ? (
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                ) : (
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                )}
                <span className="text-[11px] text-white font-bold uppercase">{agent.autonomy_level}</span>
              </div>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Dep.</p>
              <span className="text-[11px] text-white font-bold uppercase">{agent.role_type}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-white font-black text-sm">98%</span>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Precisão</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-sm">4.2k</span>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Ações</span>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-white/10 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase">
              Ver Treinamento
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
