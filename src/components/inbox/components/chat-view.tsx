import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Smile, 
  PanelRightClose, 
  PanelRightOpen,
  Lock,
  User,
  ShieldCheck,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useMessages, useInternalNotes } from "@/hooks/inbox/use-messages";
import { useSendMessage } from "@/hooks/inbox/use-send-message";
import { useCloseConversation, useAssignToMe } from "@/hooks/inbox/use-conversation-actions";
import { TransferModal } from "./transfer-modal";
import { Badge } from "@/components/ui/badge";
import { useEffect } from 'react';

interface ChatViewProps {
  chat: any;
  showCustomer360: boolean;
  onToggleCustomer360: () => void;
  appliedReply?: string | null;
  onReplyApplied?: () => void;
}



export const ChatView = ({ 
  chat, 
  showCustomer360, 
  onToggleCustomer360,
  appliedReply,
  onReplyApplied
}: ChatViewProps) => {
  const [messageType, setMessageType] = useState<'public' | 'internal'>('public');
  const [inputMessage, setInputMessage] = useState("");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { data: messages } = useMessages(chat?.id);
  const { data: notes } = useInternalNotes(chat?.id);
  const sendMessageMutation = useSendMessage();
  const closeMutation = useCloseConversation();
  const assignMutation = useAssignToMe();

  const handleSendMessage = () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      conversationId: chat.id,
      body: inputMessage,
      type: messageType
    }, {
      onSuccess: () => {
        setInputMessage("");
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (appliedReply) {
      setInputMessage(appliedReply);
      onReplyApplied?.();
    }
  }, [appliedReply, onReplyApplied]);


  // Combine e ordene mensagens e notas para a timeline
  const timeline = [...(messages || []), ...(notes || [])].sort(
    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );


  return (
    <div className="flex flex-col h-full bg-[#020817] relative">
      <div className="h-16 border-b border-[#1E293B] flex items-center justify-between px-6 shrink-0 bg-[#020817]/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-[#1E293B]">
            <AvatarFallback className="bg-[#8B5CF6] text-white font-bold text-xs">
              {chat?.contacts?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#E2E8F0] leading-none">{chat?.contacts?.name || "Usuário"}</h3>
              {chat?.contacts?.lead_score && (
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  chat.contacts.lead_score >= 80 ? "bg-rose-500" : "bg-emerald-500"
                )} />
              )}
            </div>
            <p className="text-[10px] text-[#94A3B8] font-bold mt-1 uppercase tracking-widest">
              {chat?.queues?.name} • {chat?.status}
            </p>
          </div>
        </div>

        {/* SLA / Status indicators (dados reais) */}
        <div className="hidden lg:flex items-center gap-3 mx-4">
          {chat?.sla_status === 'breached' && (
            <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest">
              SLA estourado
            </Badge>
          )}
          {chat?.priority && (
            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest">
              Prioridade: {chat.priority}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-[#94A3B8] hover:text-white transition-all rounded-xl"
            onClick={() => setIsTransferModalOpen(true)}
            title="Transferir"
          >
            <ArrowRightLeft className="w-4 h-4"/>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={assignMutation.isPending || chat?.status === 'closed'}
            onClick={() => assignMutation.mutate(chat.id)}
            className="h-9 text-[10px] font-black uppercase tracking-widest gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl px-4 border border-indigo-500/20"
          >
            <User className="w-3.5 h-3.5" />
            Assumir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={closeMutation.isPending || chat?.status === 'closed'}
            onClick={() => closeMutation.mutate(chat.id)}
            className="h-9 text-[10px] font-black uppercase tracking-widest gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl px-4 border border-emerald-500/20"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Encerrar
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-[#94A3B8] hover:text-white transition-all rounded-xl" onClick={onToggleCustomer360}>
            {showCustomer360 ? <PanelRightClose className="w-4 h-4"/> : <PanelRightOpen className="w-4 h-4"/>}
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
                  isNote ? "bg-amber-500/20 text-amber-500" : "bg-[#0F172A] text-[#94A3B8]"
                )}>
                  {isNote ? "IA" : (item.sender_profile_id ? "AG" : "CL")}
                </AvatarFallback>
              </Avatar>
              <div className={cn("space-y-1.5", isNote ? "text-right" : "")}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm border",
                  isNote 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-200 rounded-tr-none" 
                    : "bg-[#0F172A] border-[#1E293B] text-[#E2E8F0] rounded-tl-none"
                )}>
                  {isNote && (
                    <div className="flex items-center gap-1.5 mb-1 justify-end">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Nota Interna</span>
                    </div>
                  )}
                  {item.body || item.content}
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-[#1E293B] bg-[#020817]/50 backdrop-blur-xl shrink-0">
        <div className="flex gap-2 mb-3 px-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMessageType('public')}
            className={cn(
              "h-7 text-[10px] font-black uppercase tracking-widest px-3 rounded-lg",
              messageType === 'public' ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-[#94A3B8]"
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
              messageType === 'internal' ? "bg-amber-500/10 text-amber-500" : "text-[#94A3B8]"
            )}
          >
            <Lock className="w-3 h-3 mr-1.5" />
            Nota Interna
          </Button>
        </div>
        
        <div className={cn(
          "bg-[#0F172A] border rounded-[1.5rem] flex items-center p-1.5 transition-all shadow-inner group",
          messageType === 'internal' ? "border-amber-500/30" : "border-[#1E293B] focus-within:border-[#8B5CF6]/30"
        )}>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-[#94A3B8] hover:text-white transition-colors rounded-xl">
            <Paperclip className="w-4 h-4" />
          </Button>
          <input 
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#94A3B8] focus:outline-none" 
            placeholder={messageType === 'internal' ? "Escreva uma nota interna (cliente não visualiza)..." : "Pressione Alt + S para sugestões da IA..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={sendMessageMutation.isPending}
          />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#94A3B8] hover:text-white transition-colors rounded-xl">
              <Mic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#94A3B8] hover:text-white transition-colors rounded-xl">
              <Smile className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !inputMessage.trim()}
              className={cn(
                "h-10 w-10 rounded-xl p-0 transition-all shadow-lg active:scale-95",
                messageType === 'internal' ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" : "bg-[#8B5CF6] hover:bg-[#A78BFA] shadow-[#8B5CF6]/20"
              )}
            >
              {sendMessageMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white"/>
              )}
            </Button>
      </div>
      
      <TransferModal 
        conversationId={chat.id} 
        isOpen={isTransferModalOpen} 
        onOpenChange={setIsTransferModalOpen} 
      />
    </div>
      </div>
    </div>
  );
};
