import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { useConversations } from "@/hooks/inbox/use-conversations";
import { ChatList } from "./components/chat-list";
import { ChatView } from "./components/chat-view";
import { CustomerSidePanel } from "./components/customer-panel";
import { AISidebar } from "./ai-copilot/ai-sidebar";


export const InboxView = () => {
  return (
    <GlobalErrorBoundary name="Inbox">
      <InboxContent />
    </GlobalErrorBoundary>
  );
};

const InboxContent = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCustomer360, setShowCustomer360] = useState(false);
  const [showAICopilot, setShowAICopilot] = useState(true);
  const [appliedReply, setAppliedReply] = useState<string | null>(null);
  const { data: conversations, isLoading } = useConversations();

  
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

  const selectedChat = conversations?.find(c => c.id === selectedChatId);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#020617]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
        "h-full w-full grid bg-[#020617] overflow-hidden transition-all duration-500",
        showCustomer360 && showAICopilot ? "grid-cols-[360px_1fr_420px_380px]" :
        showCustomer360 ? "grid-cols-[360px_1fr_420px]" :
        showAICopilot ? "grid-cols-[360px_1fr_380px]" : "grid-cols-[360px_1fr]"
    )}>

      {/* 1. Lista de Conversas (360px) */}
      <div className="flex flex-col h-full border-r border-white/5 bg-[#030712]/40">
        <div className="p-4 h-16 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <h1 className="text-xs font-black text-white uppercase tracking-[0.2em]">Universal Inbox</h1>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] px-1.5 py-0">
                  {conversations?.length || 0}
                </Badge>
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
        
        <ChatList 
          conversations={conversations || []} 
          selectedId={selectedChatId} 
          onSelect={setSelectedChatId} 
        />
      </div>

      {/* 2. Chat Principal (1fr) */}
      {selectedChatId ? (
        <ChatView 
          chat={selectedChat} 
          showCustomer360={showCustomer360} 
          onToggleCustomer360={() => {
            setShowCustomer360(!showCustomer360);
            if (!showCustomer360) setShowAICopilot(false);
          }} 
          appliedReply={appliedReply}
          onReplyApplied={() => setAppliedReply(null)}
        />
      ) : (

        <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] text-slate-500 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <Search className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest opacity-50">Selecione uma conversa para iniciar</p>
        </div>
      )}

      {/* 4. IA Copilot (380px) */}
      {showAICopilot && selectedChat && (
        <AISidebar 
          chat={selectedChat} 
          onApplyReply={(content) => setAppliedReply(content)} 
        />
      )}
    </div>
  );
};


