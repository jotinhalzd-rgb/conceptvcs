import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  MessageSquare, 
  Search,
  BookOpen,
  History,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SuggestionCard } from "./suggestion-card";
import { CopilotEngine } from "@/services/ai/copilot-engine";
import { motion, AnimatePresence } from "framer-motion";
import { useAgents } from "@/hooks/ai/use-agents";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface AISidebarProps {
  chat: any;
  onApplyReply: (content: string) => void;
}

export const AISidebar = ({ chat, onApplyReply }: AISidebarProps) => {
  const { agents } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'copilot' | 'knowledge'>('copilot');

  useEffect(() => {
    if (agents && agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents]);


  useEffect(() => {
    if (chat?.last_message_preview) {
      handleAnalyze();
    }
  }, [chat?.last_message_preview, selectedAgentId]);


  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const results = await CopilotEngine.getInsights(chat.id, chat.last_message_preview, selectedAgentId);
      setInsights(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[380px] h-full border-l border-white/5 bg-[#030712]/40 flex flex-col shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#030712]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">IA Copilot</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest italic">Análise Ativa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        {/* Agent Selector */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Especialista Ativo</label>
          <Select value={selectedAgentId || ""} onValueChange={setSelectedAgentId}>
            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-10 text-[10px] font-bold text-white uppercase tracking-wider">
              <SelectValue placeholder="Selecionar Agente" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f172a] border-white/10">
              {agents?.map(agent => (
                <SelectItem key={agent.id} value={agent.id} className="text-[10px] font-bold uppercase">
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Tabs */}

        <div className="grid grid-cols-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveTab('copilot')}
            className={cn(
              "h-8 text-[9px] font-black uppercase tracking-widest rounded-lg",
              activeTab === 'copilot' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500"
            )}
          >
            Copilot
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveTab('knowledge')}
            className={cn(
              "h-8 text-[9px] font-black uppercase tracking-widest rounded-lg",
              activeTab === 'knowledge' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500"
            )}
          >
            Base Hub
          </Button>
        </div>

        {activeTab === 'copilot' ? (
          <>
            {/* Insights Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sugestões em Tempo Real</h4>
                {isLoading && <Zap className="w-3 h-3 text-indigo-400 animate-spin" />}
              </div>
              
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {insights.map((insight, idx) => (
                    <motion.div
                      key={`${insight.type}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <SuggestionCard 
                        insight={insight} 
                        onApply={(content) => {
                          onApplyReply(content);
                          setInsights(prev => prev.filter((_, i) => i !== idx));
                          CopilotEngine.logSuggestion(chat.id, insight.type, insight.content, 'applied');
                        }}
                        onReject={() => {
                          setInsights(prev => prev.filter((_, i) => i !== idx));
                          CopilotEngine.logSuggestion(chat.id, insight.type, insight.content, 'rejected');
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {!isLoading && insights.length === 0 && (
                  <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl border-dashed">
                    <BrainCircuit className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Aguardando contexto...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Context Summary */}
            <div className="space-y-4 bg-indigo-600/5 border border-indigo-500/10 p-5 rounded-3xl">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Resumo do Contexto</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-2 text-[10px] text-slate-400 leading-relaxed">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                  <span>Cliente busca informações sobre upgrade de plano e negociação de valores.</span>
                </li>
                <li className="flex gap-2 text-[10px] text-slate-400 leading-relaxed">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                  <span>Histórico mostra 3 tickets de suporte resolvidos nos últimos 60 dias.</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          /* Knowledge Base Hub */
          <div className="space-y-4">
             <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                placeholder="Pesquisar na base hub..." 
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-3">
              {[
                { title: 'Tabela de Preços 2026', type: 'PDF' },
                { title: 'Scripts de Vendas Enterprise', type: 'Doc' },
                { title: 'Política de Reembolso', type: 'FAQ' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">{doc.title}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-600 uppercase bg-white/5 px-1.5 py-0.5 rounded">{doc.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-[#030712]/60">
        <Button className="w-full h-10 bg-white text-[#020617] hover:bg-slate-200 rounded-xl shadow-xl font-black transition-all active:scale-95 uppercase text-[9px] tracking-widest gap-2">
          <BrainCircuit className="w-4 h-4" />
          Gerar Resumo Final
        </Button>
      </div>
    </div>
  );
};
