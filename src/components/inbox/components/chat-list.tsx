import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, MessageCircle, Mail, Globe } from "lucide-react";

interface ChatListProps {
  conversations: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}


export const ChatList = ({ conversations, selectedId, onSelect }: ChatListProps) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-2 space-y-1">
      {conversations?.map((chat) => (
        <div 
          key={chat.id} 
          onClick={() => onSelect(chat.id)}
          className={cn(
            "p-3 rounded-xl cursor-pointer transition-all border border-transparent group relative",
            selectedId === chat.id ? "bg-indigo-600/10 border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]" : "hover:bg-white/[0.02]"
          )}
        >
          <div className="flex gap-3">
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 border border-white/5">
                <AvatarFallback className="bg-slate-800 text-slate-400 font-bold text-[10px]">
                  {chat.contacts?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#030712] border border-white/10 flex items-center justify-center">
                {chat.channels?.provider === 'whatsapp' ? <MessageSquare className="w-2.5 h-2.5 text-emerald-500" /> :
                 chat.channels?.provider === 'instagram' ? <MessageCircle className="w-2.5 h-2.5 text-pink-500" /> :
                 chat.channels?.provider === 'email' ? <Mail className="w-2.5 h-2.5 text-indigo-500" /> :
                 <Globe className="w-2.5 h-2.5 text-slate-500" />}
              </div>
              {chat.status === 'new' && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#030712]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className={cn(
                  "text-xs truncate transition-colors", 
                  selectedId === chat.id ? "font-bold text-white" : "font-semibold text-slate-300 group-hover:text-white"
                )}>
                  {chat.contacts?.name || "Usuário Desconhecido"}
                </span>
                <span className="text-[9px] text-slate-500 font-bold tabular-nums shrink-0">
                  {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mb-2 leading-relaxed">
                {chat.last_message_preview || "Nenhuma mensagem"}
              </p>
              
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-white/5 text-slate-500 border-none text-[8px] font-bold px-1 py-0 uppercase">
                  {chat.queues?.name || "Sem Fila"}
                </Badge>
                {chat.sla_status === 'breached' && (
                  <Badge className="bg-rose-500/10 text-rose-400 border-none text-[8px] font-bold px-1 py-0">SLA Estourado</Badge>
                )}
                {chat.temperature === 'hot' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" title="Temperatura: Quente" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
