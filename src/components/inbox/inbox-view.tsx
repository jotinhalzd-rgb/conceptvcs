import React, { useState } from 'react';
import { 
  Search, 
  MessageSquare, 
  User, 
  Users, 
  ChevronDown, 
  Send, 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  History, 
  CheckCircle2,
  MoreVertical,
  Paperclip,
  Mic,
  Smile,
  Zap,
  ShieldCheck,
  Target,
  Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useAICopilot } from "@/hooks/inbox/use-ai-copilot";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";

export const InboxView = () => {
  return (
    <GlobalErrorBoundary name="Inbox">
      <InboxContent />
    </GlobalErrorBoundary>
  );
};

const InboxContent = () => {

  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [showCopilot, setShowCopilot] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  
  // Encontrar o chat selecionado para pegar a última mensagem real
  const chats = [
    { id: 1, name: "Roberto Almeida", lastMsg: "Quero cancelar meu plano.", time: "2 min", sentiment: "negative", risk: "high", unread: 2, channel: "whatsapp" },
    { id: 2, name: "TechFlow Solutions", lastMsg: "Como faço o upgrade?", time: "15 min", sentiment: "positive", intent: "sale", unread: 0, channel: "instagram" },
    { id: 3, name: "Mariana Costa", lastMsg: "Obrigada pela ajuda!", time: "1h", sentiment: "positive", unread: 0, channel: "messenger" },
    { id: 4, name: "Carlos Edu", lastMsg: "Ainda não recebi o boleto.", time: "2h", sentiment: "neutral", urgency: "medium", unread: 1, channel: "whatsapp" },
  ];

  const currentChat = chats.find(c => c.id === selectedChat);
  const { analysis, isAnalyzing } = useAICopilot(currentChat?.lastMsg || "");

  const queues = [
    { name: "Comercial", count: 12, color: "bg-emerald-500" },
    { name: "Financeiro", count: 5, color: "bg-amber-500" },
    { name: "Suporte", count: 28, color: "bg-indigo-500" },
    { name: "Pós-venda", count: 8, color: "bg-purple-500" },
    { name: "VIP", count: 3, color: "bg-rose-500" },
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#020617] rounded-[2.5rem] overflow-hidden border border-white/[0.05] shadow-2xl relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none rounded-full" />
      
      <TooltipProvider delayDuration={0}>
        {/* Coluna 1: Navegação de Filas (Inteligência de Fluxo) */}
        <div className="w-[80px] lg:w-[260px] bg-[#030712]/80 backdrop-blur-xl border-r border-white/[0.05] flex flex-col transition-all duration-300">
          <div className="p-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 hidden lg:block">Operação Real-time</h2>
            <div className="space-y-1">
              {queues.map((q) => (
                <button key={q.name} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.03] group transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", q.color)} />
                    <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors hidden lg:block">{q.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-400 hidden lg:block">{q.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-6 border-t border-white/[0.05]">
            <div className="bg-indigo-600/10 rounded-2xl p-4 border border-indigo-500/20 hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">SLA Status</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-indigo-500" />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tight">92% de eficiência</p>
            </div>
          </div>
        </div>

        {/* Coluna 2: Inbox Universal (Lista de Conversas) */}
        <div className="w-[320px] lg:w-[380px] bg-[#030712]/50 backdrop-blur-md border-r border-white/[0.05] flex flex-col">
          <div className="p-6 border-b border-white/[0.05] space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-white tracking-tight">Inbox <span className="text-indigo-500">2.0</span></h1>
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-500">
                <Zap className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600" 
                placeholder="Pesquisar em conversas..." 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            {chats.map((chat) => (
              <motion.div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat.id)}
                whileHover={{ x: 4 }}
                className={cn(
                  "p-4 mx-3 my-1 rounded-[1.5rem] cursor-pointer transition-all duration-300 relative group",
                  selectedChat === chat.id ? "bg-indigo-600/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5" : "hover:bg-white/[0.03] border border-transparent"
                )}
              >
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-white/5">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-slate-800 text-white font-black">{chat.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#030712] rounded-full flex items-center justify-center p-0.5">
                      <div className="w-full h-full bg-indigo-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-white text-sm truncate">{chat.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tabular-nums">{chat.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-medium mb-2">{chat.lastMsg}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {chat.sentiment === 'negative' && <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] uppercase font-black px-2 py-0">IA: Crítico</Badge>}
                      {chat.risk === 'high' && <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase font-black px-2 py-0">Risco Churn</Badge>}
                      {chat.intent === 'sale' && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-black px-2 py-0">Oportunidade</Badge>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coluna 3: Chat Central & IA Copilot */}
        <div className="flex-1 flex flex-col bg-[#020617] relative">
          <div className="h-20 border-b border-white/[0.05] flex items-center justify-between px-8 backdrop-blur-xl bg-[#020617]/50 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarFallback className="bg-indigo-600 text-white font-bold">
                  {currentChat?.name.charAt(0) || "R"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">
                  {currentChat?.name || "Cliente"}
                </h3>
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Digitando via {currentChat?.channel === 'whatsapp' ? 'WhatsApp' : currentChat?.channel || 'Chat'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400 hover:text-white transition-all">
                <Clock className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400 hover:text-white transition-all">
                <MoreVertical className="w-5 h-5" />
              </Button>
              <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-6 font-bold shadow-xl shadow-indigo-600/20">
                Finalizar
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
            <div className="flex justify-center">
              <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">Hoje, 11 de Junho</span>
            </div>
            
            <div className="flex gap-4 max-w-[80%]">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-slate-800 text-slate-400 text-xs font-bold">
                  {currentChat?.name.split(' ').map(n => n[0]).join('') || "RA"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="bg-white/[0.03] border border-white/[0.08] text-slate-200 p-4 rounded-3xl rounded-tl-none shadow-sm">
                  {currentChat?.lastMsg || "Olá, como posso ajudar?"}
                </div>
                <span className="text-[10px] text-slate-600 font-bold ml-2">12:30</span>
              </div>
            </div>

            {/* AI Copilot Suggestion Card - Refatorado para usar Service Layer */}
            <AnimatePresence>
              {showCopilot && (analysis || isAnalyzing) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto max-w-md w-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-6"
                >
                  <div className="absolute top-0 right-0 p-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-400/50 hover:text-indigo-400" onClick={() => setShowCopilot(false)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      {isAnalyzing ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">IA Copilot Assist</h4>
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest opacity-70">
                        {isAnalyzing ? "Analisando contexto..." : "Análise em Tempo Real"}
                      </p>
                    </div>
                  </div>

                  {analysis && (
                    <div className="space-y-4">
                      {analysis.intent === 'churn' && (
                        <div className="flex items-start gap-3 bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-rose-200 font-medium">Detectado risco de {analysis.intent === 'churn' ? 'churn' : 'cancelamento'}. Cliente estratégico.</p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sugestão de Resposta:</p>
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-xs text-slate-300 italic">
                          "{analysis.suggestion}"
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl">Aplicar Texto</Button>
                        <Button size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-400">Ver Scripts</Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-white/[0.05] bg-[#020617]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-2 focus-within:border-indigo-500/50 transition-all shadow-inner">
              <Button variant="ghost" size="icon" className="rounded-2xl text-slate-500 hover:text-white h-12 w-12 transition-all">
                <Paperclip className="w-5 h-5" />
              </Button>
              <input 
                className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-600 text-sm py-3 px-2 focus:outline-none" 
                placeholder="Responda com ajuda da IA... (Alt + S para sugestões)" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <div className="flex items-center gap-1 pr-2">
                <Button variant="ghost" size="icon" className="rounded-2xl text-slate-500 hover:text-white h-10 w-10 transition-all">
                  <Mic className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-2xl text-slate-500 hover:text-white h-10 w-10 transition-all">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-11 w-11 p-0 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 4: Customer 360 & Timeline Omnichannel */}
        <div className="w-[340px] bg-[#030712]/80 backdrop-blur-2xl border-l border-white/[0.05] flex flex-col hidden 2xl:flex overflow-y-auto no-scrollbar">
          <div className="p-8 space-y-8">
            {/* Profile Section */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto border-4 border-indigo-500/20 p-1">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-3xl font-black">
                    {currentChat?.name.charAt(0) || "R"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">
                  {currentChat?.id === 1 ? "Cliente VIP" : "Standard"}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">{currentChat?.name || "Cliente"}</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                  {currentChat?.id === 1 ? "Diretor Executivo @ TechFlow" : "Contato Externo"}
                </p>
              </div>
            </div>

            {/* Customer Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[1.5rem] text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Score Saúde</p>
                <p className="text-xl font-black text-emerald-400 tabular-nums">88<span className="text-[10px] text-slate-600 ml-0.5">/100</span></p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[1.5rem] text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">LTV Total</p>
                <p className="text-xl font-black text-white tabular-nums">4.5k</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Inteligência 360</h4>
              <div className="space-y-3">
                {[
                  { label: "Prob. Expansão", val: currentChat?.id === 2 ? 95 : 85, color: "bg-emerald-500" },
                  { label: "Engajamento", val: currentChat?.id === 1 ? 92 : 70, color: "bg-indigo-500" },
                  { label: "Risco de Churn", val: currentChat?.sentiment === 'negative' ? 65 : 12, color: "bg-rose-500" },
                ].map(m => (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="text-white">{m.val}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full", m.color)} style={{ width: `${m.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unified Timeline Omnichannel */}
            <div className="space-y-6">
              <div className="flex items-center justify-between ml-1">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timeline Unificada</h4>
                <History className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <div className="space-y-6 relative ml-4 border-l border-white/[0.05] pl-6 py-2">
                {[
                  { icon: MessageSquare, text: "Atendimento iniciado", time: "12:30", color: "bg-indigo-500/20 text-indigo-400" },
                  { icon: Target, text: "Lead qualificado por IA", time: "11:45", color: "bg-emerald-500/20 text-emerald-400" },
                  { icon: TrendingUp, text: "Upgrade de plano realizado", time: "Ontem", color: "bg-purple-500/20 text-purple-400" },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className={cn("absolute -left-[37px] top-0 w-8 h-8 rounded-xl flex items-center justify-center border border-[#030712]", item.color)}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{item.text}</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

