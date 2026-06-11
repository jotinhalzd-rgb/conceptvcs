import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Mail, 
  MessageSquare, 
  Plus, 
  Play, 
  Save, 
  Settings,
  Filter,
  Clock,
  LayoutGrid,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { motion, AnimatePresence } from "framer-motion";

const WorkflowNode = ({ type, title, description, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="relative group cursor-pointer"
  >
    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-[#020617] group-hover:scale-125 transition-transform z-10" />
    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-[#020617] group-hover:scale-125 transition-transform z-10" />
    
    <Card className="bg-[#030712] border-white/5 p-6 min-w-[280px] shadow-2xl relative overflow-hidden group-hover:border-indigo-500/30 transition-all">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl ${color.replace('bg-', 'bg-')}/10 flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{title}</h4>
          <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">{description}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

export const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState([
    { id: '1', type: 'trigger', title: 'Novo Lead Criado', desc: 'Disparar quando um contato entrar no sistema', icon: Zap, color: 'bg-amber-500' },
    { id: '2', type: 'condition', title: 'Lead Score > 50?', desc: 'Verificar qualificação do contato', icon: Filter, color: 'bg-indigo-500' },
    { id: '3', type: 'action', title: 'Enviar WhatsApp', desc: 'Mensagem de boas-vindas automática', icon: MessageSquare, color: 'bg-emerald-500' }
  ]);

  return (
    <GlobalErrorBoundary name="WorkflowBuilder">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Builder Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[9px] uppercase">Rascunho v1.2</Badge>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Marketing Automation</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Onboarding Automatizado Tech</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest gap-2">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Button>
            <div className="w-px h-6 bg-white/5 mx-2" />
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2">
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </Button>
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black uppercase tracking-widest text-[10px] h-11 px-6 shadow-xl shadow-indigo-600/20 gap-2">
              Publish Workflow
              <Play className="w-3.5 h-3.5 fill-current" />
            </Button>
          </div>
        </header>

        {/* Builder Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-12">
              {nodes.map((node, i) => (
                <React.Fragment key={node.id}>
                  <WorkflowNode 
                    title={node.title}
                    description={node.desc}
                    icon={node.icon}
                    color={node.color}
                  />
                  {i < nodes.length - 1 && (
                    <div className="h-12 w-0.5 bg-indigo-500/20 relative">
                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#020617] border border-indigo-500/20 flex items-center justify-center">
                            <ArrowRight className="w-2 h-2 text-indigo-400 rotate-90" />
                        </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
              
              <button className="w-10 h-10 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-slate-600 hover:border-indigo-500/30 hover:text-indigo-400 transition-all active:scale-95">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Node Library Sidebar */}
          <div className="absolute left-8 top-8 bottom-8 w-72 bg-[#030712]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl z-20">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Blocos Disponíveis</p>
            
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Triggers</p>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 cursor-grab">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Novo Lead</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 cursor-grab">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Data/Hora</span>
                    </div>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Ações</p>
                <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 cursor-grab group hover:border-emerald-500/20">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase group-hover:text-white">WhatsApp</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 cursor-grab group hover:border-emerald-500/20">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase group-hover:text-white">E-mail Marketing</span>
                    </div>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Inteligência (OIL)</p>
                <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-3 cursor-grab group hover:bg-indigo-600/20 transition-all">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase">AI Strategy Decision</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
