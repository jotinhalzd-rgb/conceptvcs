import React from 'react';
import { PlansGrid } from "./plans-grid";
import { InvoiceList } from "./invoice-list";
import { UsageMeter } from "./usage-meter";
import { CreditCard, ChevronDown, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { useCurrentSubscription } from "@/hooks/billing/use-billing";
import { SmartBackButton } from "@/components/layout/back-button";
import { toast } from "sonner";

export const BillingView = () => {
  const { data: currentSub } = useCurrentSubscription();
  // Gateway de pagamento ainda não conectado para esta organização.
  const gatewayConfigured = false;
  const nextRenewal = currentSub?.current_period_end
    ? new Date(currentSub.current_period_end).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
    : "—";

  return (
    <GlobalErrorBoundary name="Billing">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <SmartBackButton />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                  <p className="text-sm font-black text-white leading-none">{currentSub?.subscription_status ?? "Sem assinatura"}</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Próxima renovação</p>
                  <p className="text-sm font-black text-white leading-none">{nextRenewal}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {!gatewayConfigured && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-100">Gateway de pagamento não configurado</p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    Você pode visualizar o catálogo de planos e o uso atual, mas cobranças reais exigem configurar Stripe/Paddle. Solicite ao administrador.
                  </p>
                </div>
                <Button
                  onClick={() => toast.message("Configuração de gateway", { description: "Esta etapa ficará disponível após contratar um provider. Nenhuma cobrança é iniciada." })}
                  className="bg-amber-500 text-amber-950 hover:bg-amber-400 font-black text-[10px] uppercase tracking-widest"
                >
                  Configurar
                </Button>
              </div>
            )}

            <div>
              <div className="text-center space-y-2 mb-12">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Catálogo de Planos</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Planos disponíveis para sua operação</p>
              </div>
              <PlansGrid />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Uso atual</h2>
              <UsageMeter />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Faturas</h2>
              <InvoiceList />
            </div>
          </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
