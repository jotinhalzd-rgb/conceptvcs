import React from 'react';
import { PlansGrid } from "./plans-grid";
import { 
  CreditCard, 
  History, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ChevronDown,
  ArrowUpRight,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { useCurrentSubscription, useUsageMeters } from "@/hooks/billing/use-billing";
import { cn } from "@/lib/utils";

export const BillingView = () => {
  const { data: currentSub, isLoading } = useCurrentSubscription();
  const { data: usageMeters } = useUsageMeters();


  return (
    <GlobalErrorBoundary name="Billing">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Header Estratégico */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Financial Center</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Faturamento e Assinatura</h1>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status Global</p>
                  <p className="text-sm font-black text-white leading-none">Conta Ativa</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Próximo Vencimento</p>
                  <p className="text-sm font-black text-white leading-none">12 de Julho</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-10 text-slate-400 hover:text-white gap-2 border border-white/5 bg-white/5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Histórico de Faturas
            </Button>
            <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <span>Métodos de Pagamento</span>
            </Button>
          </div>
        </header>

        {/* Conteúdo Central */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Banner de Plano Atual se estiver em Trial */}
                {currentSub?.status === 'trial' && (
                    <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-amber-600/20">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-2 text-center md:text-left">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Seu Período de Testes está acabando</h3>
                                <p className="text-amber-500 bg-white px-3 py-1 rounded-full inline-block text-[10px] font-black uppercase tracking-widest mb-2">Restam 4 dias</p>
                                <p className="text-amber-50 font-medium opacity-90 max-w-xl">Habilite sua assinatura definitiva para manter o acesso a todas as funcionalidades de IA, Omnichannel e CRM sem interrupções.</p>
                            </div>
                            <Button className="bg-white text-amber-600 hover:bg-amber-50 h-14 px-10 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                                Ativar Assinatura Agora
                            </Button>
                        </div>
                    </div>
                )}

                {/* Grid de Planos */}
                <div>
                    <div className="text-center space-y-2 mb-12">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Escolha o poder da sua operação</h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Planos flexíveis para empresas de todos os tamanhos</p>
                    </div>
                    <PlansGrid />
                </div>

                {/* Métricas de Uso (Placeholder) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Mensagens Enviadas', current: 4250, total: 10000, icon: Zap },
                        { label: 'Minutos de Telefonia', current: 125, total: 500, icon: Clock },
                        { label: 'Tokens de IA', current: 85000, total: 200000, icon: BarChart3 }
                    ].map((usage, i) => (
                        <div key={i} className="bg-[#030712] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                        <usage.icon className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{usage.label}</span>
                                </div>
                                <span className="text-[10px] font-black text-white">{Math.round((usage.current/usage.total)*100)}%</span>
                            </div>
                            <div className="space-y-3">
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                                        style={{ width: `${(usage.current/usage.total)*100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                                    <span>{usage.current.toLocaleString()} utilizados</span>
                                    <span>Limite: {usage.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
