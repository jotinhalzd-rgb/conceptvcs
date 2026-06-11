import React, { useState } from 'react';
import { useDeals, usePipelines } from "@/hooks/crm/use-deals";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, TrendingUp, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MobileCRM = () => {
  const { data: pipelines } = usePipelines();
  const { data: deals, isLoading } = useDeals(pipelines?.[0]?.id);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDeals = deals?.filter((deal: any) => 
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.contacts?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#020617] animate-in fade-in duration-500 pb-20">
      {/* Header Mobile CRM */}
      <div className="p-6 pt-12 bg-[#030712]/60 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Pipeline</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              {pipelines?.[0]?.title || "Vendas Principal"}
            </p>
          </div>
          <button className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou negócio..." 
            className="w-full h-12 bg-white/5 border-none rounded-xl pl-12 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 outline-none"
          />
        </div>
      </div>

      {/* Lista de Deals Mobile */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))
        ) : (
          <AnimatePresence>
            {filteredDeals?.map((deal: any) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="bg-[#030712] border-white/5 p-5 rounded-2xl relative overflow-hidden group active:border-indigo-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 blur-2xl rounded-full" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{deal.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{deal.contacts?.name}</p>
                    </div>
                    <Badge className="bg-indigo-600/10 text-indigo-400 border-none font-black text-[10px] uppercase">
                      {deal.stages?.name || 'Lead'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm font-black text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deal.value))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase">{deal.probability || 0}%</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
