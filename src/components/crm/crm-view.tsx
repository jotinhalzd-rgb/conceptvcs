import React, { useState } from 'react';
import { KanbanBoard } from "./kanban/kanban-board";
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Target, 
  TrendingUp, 
  DollarSign,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { motion } from "framer-motion";

export const CRMView = () => {
  return (
    <GlobalErrorBoundary name="CRM">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Header de Gestão */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Sales Pipeline</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Pipeline Comercial</h1>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Forecast</p>
                  <p className="text-sm font-black text-white leading-none">R$ 1.2M</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Target className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Meta Batida</p>
                  <p className="text-sm font-black text-white leading-none">68%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg bg-indigo-600 text-white">Kanban</Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg text-slate-500">Lista</Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg text-slate-500">Previsão</Button>
            </div>
            <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Novo Negócio</span>
            </Button>
          </div>
        </header>

        {/* Barra de Filtros */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617] shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                placeholder="Pesquisar negócios..." 
                className="bg-transparent border-none text-[11px] font-medium text-slate-300 placeholder:text-slate-600 focus:outline-none pl-9 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black text-slate-500 gap-2">
              <Filter className="w-3.5 h-3.5" />
              Filtros Avançados
            </Button>
            <div className="w-px h-4 bg-white/5 mx-2" />
            <span className="text-[10px] font-bold text-slate-600">Visualizando 24 negócios</span>
          </div>
        </div>

        {/* Kanban Area */}
        <KanbanBoard />
      </div>
    </GlobalErrorBoundary>
  );
};
