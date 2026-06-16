import React, { useState } from 'react';
import { AgentList } from "./agent-list";
import { AgentEditor } from "./agent-editor";
import { TrainingCenter } from "./training-center";
import { MonitoringHub } from "./monitoring-hub";
import { 
  Bot, 
  BrainCircuit, 
  Activity, 
  Library,
  Sparkles,
  Search,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { SmartBackButton } from "@/components/layout/back-button";
import {
  AGENT_TEMPLATES,
  useAgents,
  useInstallAgentTemplate,
  type AgentTemplate,
} from "@/hooks/ai/use-agents";
import { Loader2, CheckCircle2 } from "lucide-react";

export const AIStudioView = () => {
  const [activeTab, setActiveTab] = useState("agents");
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (agent: any) => {
    setEditingAgent(agent);
    setIsCreating(true);
  };

  const { agents } = useAgents();
  const installTemplate = useInstallAgentTemplate();

  const handleInstallTemplate = async (tpl: AgentTemplate) => {
    const existing = agents?.find((a: any) => a.name === tpl.name);
    if (existing) {
      handleEdit(existing);
      return;
    }
    const created = await installTemplate.mutateAsync(tpl);
    if (created) handleEdit(created);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/60 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-4">
          <SmartBackButton />
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-[0.1em] italic">AI Studio</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Digital Workforce Management</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                    placeholder="Buscar agente ou ação..." 
                    className="w-64 h-11 bg-white/5 border-white/10 rounded-2xl pl-12 text-sm focus:ring-indigo-600/20 focus:border-indigo-600/50"
                />
            </div>
            <Button 
              onClick={() => handleEdit(null)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-2xl shadow-xl shadow-indigo-600/20 gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Agente
            </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8"
            >
              <AgentEditor 
                agent={editingAgent} 
                onCancel={() => setIsCreating(false)} 
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-0"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-8 pt-6 sticky top-0 bg-[#020617] z-20 pb-4 border-b border-white/5">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl gap-1 h-auto">
                        <TabsTrigger value="agents" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                            <Bot className="w-3 h-3" />
                            Agentes Ativos
                        </TabsTrigger>
                        <TabsTrigger value="training" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                            <BrainCircuit className="w-3 h-3" />
                            Treinamento
                        </TabsTrigger>
                        <TabsTrigger value="monitoring" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                            <Activity className="w-3 h-3" />
                            Monitoramento
                        </TabsTrigger>
                        <TabsTrigger value="marketplace" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                            <Library className="w-3 h-3" />
                            Marketplace
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="agents" className="m-0">
                  <AgentList onEdit={handleEdit} />
                </TabsContent>

                <TabsContent value="training" className="m-0">
                  <TrainingCenter />
                </TabsContent>

                <TabsContent value="monitoring" className="m-0">
                  <MonitoringHub />
                </TabsContent>

                <TabsContent value="marketplace" className="m-0">
                  <div className="p-8">
                    <div className="mb-8">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Biblioteca de Especialistas</h3>
                      <p className="text-slate-500 text-sm mt-2">Instale agentes pré-treinados e refine no editor.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {AGENT_TEMPLATES.map((tpl) => {
                        const installed = agents?.find((a: any) => a.name === tpl.name);
                        const isPending = installTemplate.isPending && installTemplate.variables?.slug === tpl.slug;
                        return (
                          <div key={tpl.slug} className="bg-[#030712] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-indigo-500/30 transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                              </div>
                              {installed && (
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Instalado
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{tpl.sector}</p>
                            <h4 className="text-base font-black text-white mb-2">{tpl.name}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">{tpl.description}</p>
                            <Button
                              onClick={() => handleInstallTemplate(tpl)}
                              disabled={isPending}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-xl gap-2"
                            >
                              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              {installed ? "Editar agente" : "Instalar agente"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
