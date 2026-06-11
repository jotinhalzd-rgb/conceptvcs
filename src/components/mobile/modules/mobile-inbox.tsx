import React, { useState } from 'react';
import { useConversations } from "@/hooks/inbox/use-conversations";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, ShieldCheck, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const MobileInbox = () => {
  const { data: conversations, isLoading } = useConversations();
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="flex flex-col h-full bg-[#020617] animate-in fade-in duration-500 pb-20">
      {/* Header Inbox Mobile */}
      <div className="p-6 pt-12 bg-[#030712]/60 border-b border-white/5">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-6">Inbox</h2>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['all', 'open', 'waiting', 'closed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                activeFilter === filter 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                  : "bg-white/5 border-white/5 text-slate-500"
              )}
            >
              {filter === 'all' ? 'Todos' : filter === 'open' ? 'Abertos' : filter === 'waiting' ? 'Aguardando' : 'Fechados'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Chats Mobile */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-6 border-b border-white/5 flex gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-white/5" />
              <div className="flex-1 space-y-3">
                <div className="h-3 bg-white/5 w-1/3 rounded" />
                <div className="h-2 bg-white/5 w-2/3 rounded" />
              </div>
            </div>
          ))
        ) : (
          conversations?.map((chat: any) => (
            <div 
              key={chat.id}
              className="p-6 border-b border-white/5 hover:bg-white/[0.02] active:bg-white/[0.05] transition-all flex gap-4 relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-white/5 flex items-center justify-center shrink-0">
                {chat.contact?.name?.substring(0, 1).toUpperCase() || <User className="w-5 h-5 text-indigo-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-black text-white truncate pr-2 uppercase tracking-tight">
                    {chat.contact?.name || 'Cliente Anonimo'}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-600 whitespace-nowrap">
                    {chat.last_message_at ? format(new Date(chat.last_message_at), "HH:mm", { locale: ptBR }) : 'Agora'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 truncate leading-relaxed">
                  {chat.last_message_preview || 'Iniciando nova conversa...'}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-black text-slate-600 uppercase">2m SLA</span>
                  </div>
                  {chat.ai_sentiment === 'positive' && (
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-600 uppercase">Satisfeito</span>
                    </div>
                  )}
                </div>
              </div>

              {chat.status === 'open' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
