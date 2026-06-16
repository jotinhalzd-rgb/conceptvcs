import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  History, 
  CheckCircle2,
  Target,
  MessageSquare,
  Zap,
  PanelRightClose,
  Phone,
  PhoneMissed,
  FileText,
  ShoppingBag,
  CreditCard
} from 'lucide-react';


import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DemoBadge, isDemoRecord } from "@/lib/demo-badge";

interface CustomerSidePanelProps {
  chat: any;
  onClose: () => void;
}

export const CustomerSidePanel = ({ chat, onClose }: CustomerSidePanelProps) => {
  const contact = chat?.contacts;
  const showDemo = chat?.is_demo || chat?.is_test || isDemoRecord({
    email: contact?.email,
    metadata: contact?.metadata,
    is_demo: contact?.is_demo,
  });
  const leadScore = contact?.lead_score as number | null | undefined;
  return (
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={onClose}>
              <PanelRightClose className="w-4 h-4" />
          </Button>
      </div>

      <div className="p-8 space-y-8 flex-1">
          {/* Profile */}
          <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 group">
                  <Avatar className="h-24 w-24 border-4 border-indigo-500/10 p-1 group-hover:border-indigo-500/30 transition-all duration-500">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-3xl font-black">
                          {chat?.contacts?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#030712]" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">{chat?.contacts?.name || "Usuário"}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5">
                {chat?.contacts?.email || "Cliente Enterprise"}
              </p>
              {showDemo && (
                <div className="mt-3"><DemoBadge variant={chat?.is_test ? "simulated" : "demo"} /></div>
              )}
          </div>

          {/* Lead score (real data only) */}
          {typeof leadScore === "number" && (
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lead Score</p>
                <span className="text-emerald-400 font-black text-sm tabular-nums">{leadScore}</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, leadScore)}%` }} />
              </div>
            </div>
          )}

          {/* Empty state — histórico em construção */}
          <div className="pb-10">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 text-center">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-bold text-white mb-1">Histórico ainda em construção</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Este cliente ainda não possui interações suficientes para gerar insights confiáveis.
              </p>
            </div>
          </div>
      </div>
    </motion.div>
  );
};
