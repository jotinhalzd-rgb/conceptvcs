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
  Loader2,
  Bell
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
  
  const chats = [
    { id: 1, name: "Roberto Almeida", lastMsg: "Quero cancelar meu plano.", time: "2 min", sentiment: "negative", risk: "high", unread: 2, channel: "whatsapp" },
    { id: 2, name: "TechFlow Solutions", lastMsg: "Como faço o upgrade?", time: "15 min", sentiment: "positive", intent: "sale", unread: 0, channel: "instagram" },
    { id: 3, name: "Mariana Costa", lastMsg: "Obrigada pela ajuda!", time: "1h", sentiment: "positive", unread: 0, channel: "messenger" },
    { id: 4, name: "Carlos Edu", lastMsg: "Ainda não recebi o boleto.", time: "2h", sentiment: "neutral", urgency: "medium", unread: 1, channel: "whatsapp" },
  ];

  const currentChat = chats.find(c => c.id === selectedChat);
  const { analysis, isAnalyzing } = useAICopilot(currentChat?.lastMsg || "");

  return (
    <div className="h-full w-full grid grid-cols-[360px_1fr_420px] bg-[#020617] overflow-hidden">
      {/* 1. Lista de Conversas (360px) */}
      <div className="flex flex-col h-full border-r border-white/5 bg-[#030712]/50">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h1 className="text-sm font-black text-white uppercase tracking-widest">Inbox</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Zap className="w-4 h-4" />
            </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat.id)}
                className={cn(
                  "p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                  selectedChat === chat.id ? "bg-indigo-600/10 border-indigo-500/20" : "hover:bg-white/[0.03]"
                )}
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 border border-white/5 shrink-0">
                    <AvatarFallback className="bg-slate-800 text-white font-black text-xs">{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-white text-xs truncate">{chat.name}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{chat.lastMsg}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 2. Chat Principal (1fr) */}
      <div className="flex flex-col h-full bg-[#020617]">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <span className="font-bold text-white text-sm">{currentChat?.name}</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">Online</Badge>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Clock/></Button>
                <Button className="h-8 bg-indigo-600 text-white text-[11px] font-bold px-4 rounded-lg">Finalizar</Button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl max-w-[70%] text-sm text-slate-300">
                {currentChat?.lastMsg}
            </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-[#020617]">
             <div className="bg-white/[0.03] border border-white/5 rounded-xl flex items-center p-2 focus-within:border-indigo-500/50">
                <input className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none" placeholder="Escreva uma mensagem..." />
                <Button className="h-8 w-8 bg-indigo-600 rounded-lg p-0">
                    <Send className="w-4 h-4 text-white"/>
                </Button>
             </div>
        </div>
      </div>

      {/* 3. Customer 360 (420px) */}
      <div className="h-full border-l border-white/5 bg-[#030712]/50 p-6 overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-3 border-4 border-indigo-500/10">
                <AvatarFallback className="bg-indigo-600 text-white text-2xl font-black">{currentChat?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-white">{currentChat?.name}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Diretor @ TechFlow</p>
        </div>

        <div className="space-y-4">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Insights IA</h4>
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl text-xs text-indigo-200">
                Cliente com intenção de upgrade. Sugiro oferecer plano premium com desconto exclusivo.
            </div>
        </div>
      </div>
    </div>
  );
};
