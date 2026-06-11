import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Smile, 
  Clock, 
  PanelRightClose, 
  PanelRightOpen,
  Lock,
  User,
  ShieldCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useMessages, useInternalNotes } from "@/hooks/inbox/use-messages";

interface ChatViewProps {
  chat: any;
  showCustomer360: boolean;
  onToggleCustomer360: () => void;
}

export const ChatView = ({ chat, showCustomer360, onToggleCustomer360 }: ChatViewProps) => {
  const [messageType, setMessageType] = useState<'public' | 'internal'>('public');
  const [inputMessage, setInputMessage] = useState("");
  const { data: messages } = useMessages(chat?.id);
  const { data: notes } = useInternalNotes(chat?.id);

  // Combine e ordene mensagens e notas para a timeline
  const timeline = [...(messages || []), ...(notes || [])].sort(
    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );


  return (
    <div className="flex flex-col h-full bg-[#020617] relative">
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#020617]/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-white/10">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
              {chat?.contacts?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">{chat?.contacts?.name || "Usuário"}</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
              {chat?.queues?.name} • {chat?.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white transition-all rounded-xl">
            <Clock className="w-4 h-4"/>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white transition-all rounded-xl" onClick={onToggleCustomer360}>
            {showCustomer360 ? <PanelRightClose className="w-4 h-4"/> : <PanelRightOpen className="w-4 h-4"/>}
          </Button>
          <Button className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-95">
            Finalizar Atendimento
          </Button>
        </div>
      </div>

      {/* Timeline unificada */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar scroll-smooth">
        {timeline.map((item: any, idx) => {
          const isNote = 'author_id' in item;
          return (
            <div 
              key={item.id} 
              className={cn(
                "flex gap-4 max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                isNote ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className={cn(
                  "text-[10px] font-bold",
                  isNote ? "bg-amber-500/20 text-amber-500" : "bg-slate-800 text-slate-500"
                )}>
                  {isNote ? "IA" : (item.sender_profile_id ? "AG" : "CL")}
                </AvatarFallback>
              </Avatar>
              <div className={cn("space-y-1.5", isNote ? "text-right" : "")}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm border",
                  isNote 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-200 rounded-tr-none" 
                    : "bg-white/[0.03] border-white/[0.08] text-slate-200 rounded-tl-none"
                )}>
                  {isNote && (
                    <div className="flex items-center gap-1.5 mb-1 justify-end">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Nota Interna</span>
                    </div>
                  )}
                  {item.body || item.content}
                </div>
                <span className="text-[10px] text-slate-600 font-bold uppercase">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-[#020617]/50 backdrop-blur-xl shrink-0">
        <div className="flex gap-2 mb-3 px-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMessageType('public')}
            className={cn(
              "h-7 text-[10px] font-black uppercase tracking-widest px-3 rounded-lg",
              messageType === 'public' ? "bg-indigo-600/10 text-indigo-400" : "text-slate-500"
            )}
          >
            <User className="w-3 h-3 mr-1.5" />
            Atendimento Público
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMessageType('internal')}
            className={cn(
              "h-7 text-[10px] font-black uppercase tracking-widest px-3 rounded-lg",
              messageType === 'internal' ? "bg-amber-500/10 text-amber-500" : "text-slate-500"
            )}
          >
            <Lock className="w-3 h-3 mr-1.5" />
            Nota Interna
          </Button>
        </div>
        
        <div className={cn(
          "bg-white/[0.02] border rounded-[1.5rem] flex items-center p-1.5 transition-all shadow-inner group",
          messageType === 'internal' ? "border-amber-500/30" : "border-white/5 focus-within:border-indigo-500/30"
        )}>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white transition-colors rounded-xl">
            <Paperclip className="w-4 h-4" />
          </Button>
          <input 
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" 
            placeholder={messageType === 'internal' ? "Escreva uma nota interna (cliente não visualiza)..." : "Pressione Alt + S para sugestões da IA..."}
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
            <Button className={cn(
              "h-10 w-10 rounded-xl p-0 transition-all shadow-lg active:scale-95",
              messageType === 'internal' ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
            )}>
              <Send className="w-4 h-4 text-white"/>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
