import React from 'react';
import { usePlans, useCurrentSubscription } from "@/hooks/billing/use-billing";
import { Check, Zap, Rocket, ShieldCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PlansGrid = () => {
  const { data: plans, isLoading } = usePlans();
  const { data: currentSub } = useCurrentSubscription();

  const getIcon = (name: string) => {
    switch (name) {
      case 'STARTER': return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'PROFESSIONAL': return <Rocket className="w-5 h-5 text-indigo-400" />;
      case 'BUSINESS': return <ShieldCheck className="w-5 h-5 text-indigo-500" />;
      case 'ENTERPRISE': return <Crown className="w-5 h-5 text-amber-400" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />)}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {plans?.map((plan) => {
        const isCurrent = currentSub?.plan_id === plan.id;
        const features = plan.features as any;

        return (
          <div 
            key={plan.id} 
            className={cn(
              "p-8 rounded-[2.5rem] border transition-all relative overflow-hidden flex flex-col h-full",
              isCurrent ? "bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-500/10" : "bg-[#030712] border-white/5 hover:border-white/10"
            )}
          >
            {isCurrent && (
              <div className="absolute top-4 right-6 px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest">
                Plano Atual
              </div>
            )}

            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                {getIcon(plan.name)}
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight italic">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">R$ {Number(plan.price).toLocaleString('pt-BR')}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/mês</span>
              </div>
            </div>

            <div className="space-y-4 flex-1 mb-8">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">O que está incluído:</p>
              {[
                { label: `${features.max_users} Usuários`, active: true },
                { label: `${features.max_channels} Canais Omnichannel`, active: true },
                { label: `${Number(features.max_messages).toLocaleString()} Mensagens/mês`, active: true },
                { label: 'Inteligência Artificial', active: features.ai_enabled },
                { label: 'White Label Integrado', active: plan.name === 'ENTERPRISE' },
              ].map((feature, idx) => (
                <div key={idx} className={cn("flex items-center gap-3", feature.active ? "text-slate-300" : "text-slate-700")}>
                  <Check className={cn("w-3.5 h-3.5", feature.active ? "text-emerald-500" : "text-slate-800")} />
                  <span className="text-[11px] font-medium leading-none">{feature.label}</span>
                </div>
              ))}
            </div>

            <Button 
              className={cn(
                "w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95",
                isCurrent 
                  ? "bg-transparent border-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/5" 
                  : "bg-white text-[#020617] hover:bg-slate-200"
              )}
            >
              {isCurrent ? "Gerenciar Assinatura" : "Fazer Upgrade"}
            </Button>
          </div>
        );
      })}
    </div>
  );
};
