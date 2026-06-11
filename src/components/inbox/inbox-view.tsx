import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  MessageSquare,
  Clock,
  AlertTriangle,
  Layout
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
import { Skeleton } from "@/components/ui/skeleton";


export const InboxView = () => {
  return (
    <GlobalErrorBoundary name="Inbox">
      <InboxContent />
    </GlobalErrorBoundary>
  );
};

const InboxContent = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomer360, setShowCustomer360] = useState(false);
  const [showAICopilot, setShowAICopilot] = useState(true);
  const [appliedReply, setAppliedReply] = useState<string | null>(null);
  const { data: conversations, isLoading } = useConversations();

  const filteredConversations = conversations?.filter(c => 
    (c.contacts as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_message_preview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
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
      <div className="h-full w-full grid grid-cols-[360px_1fr_420px] bg-[#020817] overflow-hidden">
        <div className="border-r border-[#1E293B] bg-[#0F172A]/30 p-4 space-y-4">
          <Skeleton className="h-8 w-1/2 bg-[#1E293B]" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-[#1E293B]" />
            ))}
          </div>
        </div>
        <div className="flex flex-col p-8 space-y-6">
          <Skeleton className="h-12 w-full bg-[#1E293B]" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-32 w-2/3 bg-[#1E293B]" />
            <Skeleton className="h-32 w-2/3 ml-auto bg-[#1E293B]" />
            <Skeleton className="h-32 w-1/2 bg-[#1E293B]" />
          </div>
        </div>
        <div className="border-l border-[#1E293B] bg-[#0F172A]/30 p-6 space-y-6">
          <Skeleton className="h-24 w-24 rounded-full mx-auto bg-[#1E293B]" />
          <Skeleton className="h-8 w-3/4 mx-auto bg-[#1E293B]" />
          <Skeleton className="h-40 w-full bg-[#1E293B]" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
        "h-full w-full grid bg-[#020817] overflow-hidden transition-all duration-500",
        showCustomer360 && showAICopilot ? "grid-cols-[360px_1fr_420px_380px]" :
        showCustomer360 ? "grid-cols-[360px_1fr_420px]" :
        showAICopilot ? "grid-cols-[360px_1fr_380px]" : "grid-cols-[360px_1fr]"
    )}>

      {/* 1. Lista de Conversas (360px) */}
      <div className="flex flex-col h-full border-r border-[#1E293B] bg-[#0F172A]/20">
        <div className="p-4 border-b border-[#1E293B] flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xs font-black text-[#E2E8F0] uppercase tracking-[0.2em]">Universal Inbox</h1>
                    <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20 text-[9px] px-1.5 py-0">
                      {filteredConversations?.length || 0}
                    </Badge>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94A3B8] hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] group-focus-within:text-[#8B5CF6] transition-colors" />
                <input 
                  placeholder="Pesquisar conversas..." 
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl py-2 pl-9 pr-3 text-xs text-[#E2E8F0] focus:outline-none focus:border-[#8B5CF6]/30 transition-all placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <ChatList 
          conversations={filteredConversations || []} 
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
        <div className="flex-1 flex flex-col items-center justify-center bg-[#020817] text-[#94A3B8] p-12">
          <div className="w-full max-w-2xl bg-[#0F172A]/50 border border-[#1E293B] rounded-[2.5rem] p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -ml-32 -mb-32" />

            <div className="w-24 h-24 rounded-3xl bg-[#020817] border border-[#1E293B] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <MessageSquare className="w-10 h-10 text-[#8B5CF6] opacity-80" />
            </div>
            
            <h2 className="text-2xl font-black text-[#E2E8F0] tracking-tight mb-3">Selecione uma conversa</h2>
            <p className="text-sm text-[#94A3B8] max-w-sm leading-relaxed mb-10 font-medium">
              Escolha uma conversa na lista para visualizar mensagens e informações do cliente.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-8 border-t border-[#1E293B]/50">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#020817]/40 border border-[#1E293B]/30">
                <span className="text-2xl font-black text-[#E2E8F0] mb-1">{conversations?.length || 0}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">Total</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#020817]/40 border border-[#1E293B]/30">
                <span className="text-2xl font-black text-emerald-400 mb-1">
                  {conversations?.filter(c => c.status === 'open').length || 0}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">Abertas</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#020817]/40 border border-[#1E293B]/30">
                <span className="text-2xl font-black text-amber-400 mb-1">
                  {conversations?.filter(c => c.status === 'pending').length || 0}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">Aguardando</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#020817]/40 border border-[#1E293B]/30">
                <span className="text-2xl font-black text-rose-400 mb-1">
                  {conversations?.filter(c => c.sla_status === 'breached').length || 0}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">SLA em Risco</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 bg-[#8B5CF6]/5 px-4 py-2 rounded-full border border-[#8B5CF6]/10">
              <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider">Tempo médio de resposta: 4m 32s</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Customer 360 (420px) */}
      {showCustomer360 && selectedChat && (
        <CustomerSidePanel 
          chat={selectedChat} 
          onClose={() => setShowCustomer360(false)} 
        />
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


