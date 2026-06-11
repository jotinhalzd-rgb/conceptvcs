import React from 'react';
import { Search, Filter, MessageSquare, Ticket, User, Users, ChevronDown, Bell } from 'lucide-react';
import { cn } from "@/lib/utils";

export const InboxView = () => {
  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#020617] rounded-3xl overflow-hidden border border-white/[0.05] shadow-2xl">
      {/* Coluna 1: Filtros/Filas */}
      <div className="w-[260px] bg-[#030712]/50 border-r border-white/[0.05] p-4 flex flex-col gap-6">
        <div className="font-bold text-white tracking-widest text-[10px] uppercase text-slate-500">Filas & Filtros</div>
        <div className="space-y-2">
          {['Comercial', 'Financeiro', 'Suporte', 'Pós-venda'].map(queue => (
            <button key={queue} className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 rounded-xl hover:bg-white/[0.03]">
              {queue}
            </button>
          ))}
        </div>
      </div>

      {/* Coluna 2: Lista de Conversas */}
      <div className="w-[320px] bg-[#030712] border-r border-white/[0.05] flex flex-col">
        <div className="p-4 border-b border-white/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2 pl-9 text-sm text-white" placeholder="Buscar conversas..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="p-4 border-b border-white/[0.05] hover:bg-white/[0.03] cursor-pointer">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-white text-sm">Cliente {i}</span>
                <span className="text-[10px] text-slate-500">12:30</span>
              </div>
              <p className="text-xs text-slate-400 truncate">Última mensagem enviada pelo cliente...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 3: Chat */}
      <div className="flex-1 flex flex-col bg-[#020617]">
        <div className="h-16 border-b border-white/[0.05] flex items-center justify-between px-6">
          <span className="font-bold text-white">Conversa Principal</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-indigo-600/10 text-indigo-200 p-4 rounded-2xl rounded-bl-none max-w-[70%]">Olá, como posso ajudar?</div>
          <div className="bg-slate-800 text-white p-4 rounded-2xl rounded-br-none max-w-[70%] ml-auto">Olá, gostaria de saber sobre...</div>
        </div>
        <div className="p-4 border-t border-white/[0.05]">
          <input className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-white" placeholder="Escreva uma mensagem..." />
        </div>
      </div>

      {/* Coluna 4: Customer 360 */}
      <div className="w-[300px] bg-[#030712]/50 border-l border-white/[0.05] p-6 hidden xl:block">
        <div className="font-bold text-white mb-6">Customer 360</div>
        <div className="space-y-4 text-sm">
          <div className="text-slate-400">Nome: <span className="text-white">João Silva</span></div>
          <div className="text-slate-400">Score: <span className="text-emerald-400 font-bold">88/100</span></div>
        </div>
      </div>
    </div>
  );
};
