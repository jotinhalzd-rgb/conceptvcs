import React, { useState, useEffect } from 'react';
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
  Loader2,
  Bell,
  PanelRightClose,
  PanelRightOpen,
  Filter,
  MoreHorizontal
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
  const [showCustomer360, setShowCustomer360] = useState(true);
  
  // Detecção de tamanho de tela para responsividade
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1440) {
        setShowCustomer360(false);
      } else {
        setShowCustomer360(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chats = [
    { 
      id: 1, 
      name: "Roberto Almeida", 
      lastMsg: "Quero cancelar meu plano.", 
      time: "2 min", 
      sentiment: "negative", 
      risk: "high", 
      unread: 2, 
      channel: "whatsapp",
      queue: "Suporte",
      agent: "IA Copilot",
      urgency: "Crítica"
    },
    { 
      id: 2, 
      name: "TechFlow Solutions", 
      lastMsg: "Como faço o upgrade?", 
      time: "15 min", 
      sentiment: "positive", 
      intent: "sale", 
      unread: 0, 
      channel: "instagram",
      queue: "Comercial",
      agent: "Vitor M.",
      urgency: "Média"
    },
    { 
      id: 3, 
      name: "Mariana Costa", 
      lastMsg: "Obrigada pela ajuda!", 
      time: "1h", 
      sentiment: "positive", 
      unread: 0, 
      channel: "messenger",
      queue: "Suporte",
      agent: "Ana Paula",
      urgency: "Baixa"
    },
    { 
      id: 4, 
      name: "Carlos Edu", 
      lastMsg: "Ainda não recebi o boleto.", 
      time: "2h", 
      sentiment: "neutral", 
      urgency: "medium", 
      unread: 1, 
      channel: "whatsapp",
      queue: "Financeiro",
      agent: "IA Copilot",
      urgency: "Alta"
    },
  ];

  const currentChat = chats.find(c => c.id === selectedChat);
  const { analysis, isAnalyzing } = useAICopilot(currentChat?.lastMsg || "");

  return (
    <div className={cn(
        "h-full w-full grid bg-[#020617] overflow-hidden transition-all duration-500",
        showCustomer360 ? "grid-cols-[360px_1fr_420px]" : "grid-cols-[360px_1fr]"
    )}>
      {/* 1. Lista de Conversas (360px) */}
      <div className="flex flex-col h-full border-r border-white/5 bg-[#030712]/40">
        <div className="p-4 h-16 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <h1 className="text-xs font-black text-white uppercase tracking-[0.2em]">Universal Inbox</h1>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] px-1.5 py-0">24</Badge>
            </div>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white transition-colors">
                    <Filter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white transition-colors">
                    <Search className="w-4 h-4" />
                </Button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-2 space-y-1">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat.id)}
                className={cn(
                  "p-3 rounded-xl cursor-pointer transition-all border border-transparent group relative",
                  selectedChat === chat.id ? "bg-indigo-600/10 border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]" : "hover:bg-white/[0.02]"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-white/5">
                        <AvatarFallback className="bg-slate-800 text-slate-400 font-bold text-[10px]">{chat.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-[#030712] flex items-center justify-center text-[8px] font-black text-white">
                            {chat.unread}
                        </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={cn("text-xs truncate transition-colors", selectedChat === chat.id ? "font-bold text-white" : "font-semibold text-slate-300 group-hover:text-white")}>{chat.name}</span>
                      <span className="text-[9px] text-slate-500 font-bold tabular-nums shrink-0">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mb-2 leading-relaxed">{chat.lastMsg}</p>
                    
                    <div className="flex flex-wrap gap-1">
                        <Badge className="bg-white/5 text-slate-500 border-none text-[8px] font-bold px-1 py-0">{chat.queue}</Badge>
                        <Badge className="bg-white/5 text-slate-500 border-none text-[8px] font-bold px-1 py-0">{chat.agent}</Badge>
                        {chat.sentiment === 'negative' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" title="Sentimento Negativo" />}
                        {chat.sentiment === 'positive' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" title="Sentimento Positivo" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 2. Chat Principal (1fr) */}
      <div className="flex flex-col h-full bg-[#020617] relative">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#020617]/50 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">{currentChat?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-sm font-bold text-white leading-none">{currentChat?.name}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online via {currentChat?.channel}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white transition-all rounded-xl">
                    <Clock className="w-4 h-4"/>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white transition-all rounded-xl" onClick={() => setShowCustomer360(!showCustomer360)}>
                    {showCustomer360 ? <PanelRightClose className="w-4 h-4"/> : <PanelRightOpen className="w-4 h-4"/>}
                </Button>
                <Button className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-95">
                    Finalizar Chamado
                </Button>
            </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar scroll-smooth">
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/5">Hoje, 11 de Junho</span>
            </div>
            
            <div className="flex gap-4 max-w-[65%] animate-in fade-in slide-in-from-left-2 duration-500">
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="bg-slate-800 text-slate-500 text-[10px] font-bold">RA</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <div className="bg-white/[0.03] border border-white/[0.08] text-slate-200 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-sm">
                  {currentChat?.lastMsg}
                </div>
                <span className="text-[10px] text-slate-600 font-bold ml-1 uppercase">12:30 • Entregue</span>
              </div>
            </div>

            <AnimatePresence>
                {showCopilot && analysis && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[500px] ml-12 bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">IA Copilot Suggestion</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4 italic">"{analysis.suggestion}"</p>
                        <div className="flex gap-2">
                            <Button size="sm" className="h-7 bg-indigo-500 hover:bg-indigo-400 text-[9px] font-black uppercase tracking-widest px-3 rounded-lg">Inserir Resposta</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-slate-500 hover:text-slate-300 text-[9px] font-black uppercase tracking-widest px-3" onClick={() => setShowCopilot(false)}>Ignorar</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/5 bg-[#020617]/50 backdrop-blur-xl shrink-0">
             <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center p-1.5 focus-within:border-indigo-500/30 transition-all shadow-inner group">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white transition-colors rounded-xl">
                    <Paperclip className="w-4 h-4" />
                </Button>
                <input 
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" 
                    placeholder="Pressione Alt + S para sugestões da IA..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white transition-colors rounded-xl">
                        <Mic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white transition-colors rounded-xl">
                        <Smile className="w-4 h-4" />
                    </Button>
                    <Button className="h-10 w-10 bg-indigo-600 hover:bg-indigo-500 rounded-xl p-0 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        <Send className="w-4 h-4 text-white"/>
                    </Button>
                </div>
             </div>
        </div>
      </div>

      {/* 3. Customer 360 (420px) */}
      <AnimatePresence>
        {showCustomer360 && (
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
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => setShowCustomer360(false)}>
                    <PanelRightClose className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-8 space-y-8 flex-1">
                {/* Profile */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 group">
                        <Avatar className="h-24 w-24 border-4 border-indigo-500/10 p-1 group-hover:border-indigo-500/30 transition-all duration-500">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-3xl font-black">
                                {currentChat?.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#030712]" />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">{currentChat?.name}</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5">Enterprise Client • TechFlow Solutions</p>
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
                                    <span className="text-white font-bold">Oportunidade detectada:</span> Upgrade para o plano Enterprise elevaria o MRR em 40%. Probabilidade de aceite: 85%.
                                </p>
                            </div>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    <span className="text-white font-bold">Atenção:</span> 2 tickets abertos com sentimento negativo nas últimas 48h. Risco de churn subiu 15%.
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
        )}
      </AnimatePresence>
    </div>
  );
};
