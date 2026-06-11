import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Mail, 
  Tag, 
  History, 
  ShoppingBag, 
  MessageSquare, 
  Ticket, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  ShieldCheck,
  Star,
  BrainCircuit,
  Wallet,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomer360 } from "@/hooks/crm/use-customer-360";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TimelineItem = ({ title, description, time, icon: Icon, color }: any) => (
  <div className="flex gap-4 relative pb-6 last:pb-0">
    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-white/[0.05]" />
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10", color)}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 pt-1">
      <div className="flex justify-between items-start mb-1">
        <h5 className="text-sm font-bold text-white">{title}</h5>
        <span className="text-[10px] text-slate-500 font-bold uppercase">{time}</span>
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  </div>
);

export function Customer360({ contactId }: { contactId?: string }) {
  // Para demo, se não houver ID, usamos um mock
  const effectiveId = contactId || "demo-id";
  const { contact, timeline, deals, tickets, insights, transactions, isLoading } = useCustomer360(effectiveId === "demo-id" ? undefined : effectiveId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <Skeleton className="h-[400px] bg-white/[0.02]" />
        <Skeleton className="lg:col-span-2 h-[600px] bg-white/[0.02]" />
      </div>
    );
  }

  // Fallback para demo se os dados não existirem no banco
  const displayContact = contact || {
    name: "Eduardo Rocha",
    phone: "+55 (11) 99887-7665",
    email: "eduardo.rocha@email.com",
    lead_score: 92,
    lifecycle_stage: "Lead Qualificado (IA)" as string | null
  };

  const displayInsights = insights || {
    summary: "IA detectou padrão de compra recorrente a cada 15 dias. Próxima oportunidade em 3 dias.",
    churn_risk_score: 8,
    purchase_probability: 85,
    next_best_action: "Enviar proposta de upgrade para plano Enterprise"
  };

  const ltv = transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 14280;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Coluna Esquerda: Perfil e Dados */}
      <div className="space-y-6">
        <Card className="bg-white/[0.02] border-white/[0.08] overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
          <CardContent className="px-6 pb-6 -mt-10 relative">
            <div className="w-20 h-20 rounded-2xl bg-[#020617] p-1 mb-4">
              <div className="w-full h-full rounded-xl bg-indigo-500 flex items-center justify-center text-white text-3xl font-black">
                {(contact?.name || "UN").substring(0, 2).toUpperCase()}
              </div>
            </div>
            <h3 className="text-xl font-black text-white">{displayContact.name}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID: #{effectiveId.substring(0, 5)}</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-indigo-400" />
                {displayContact.phone || "Não informado"}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-indigo-400" />
                {displayContact.email || "Não informado"}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {displayContact.lifecycle_stage}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <div className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-tighter border border-indigo-500/20">VIP</div>
              <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter border border-emerald-500/20">PAGADOR</div>
            </div>
          </CardContent>
        </Card>

        {/* IA Insights Widget */}
        <Card className="bg-white/[0.02] border-white/[0.08] border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              IA Strategist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Saúde da Conta</span>
                <span className="text-emerald-400 font-black">{displayContact.lead_score || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${displayContact.lead_score || 0}%` }} />
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-xs text-indigo-300 leading-relaxed italic">
                "{displayInsights.summary}"
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Próxima Melhor Ação</h4>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 font-medium">
                  {displayInsights.next_best_action}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Central: Timeline Omnichannel */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Timeline Unificada
            </CardTitle>
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 cursor-pointer">TODOS</div>
              <div className="px-3 py-1 rounded-full bg-white/[0.05] text-[10px] font-bold text-slate-400 cursor-pointer">IA</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeline && timeline.length > 0 ? (
                timeline.map((event: any) => (
                  <TimelineItem 
                    key={event.id}
                    title={event.title} 
                    description={event.description} 
                    time={format(new Date(event.created_at), "HH:mm 'atrás'", { locale: ptBR })} 
                    icon={event.event_type === 'deal' ? TrendingUp : event.event_type === 'ticket' ? Ticket : MessageSquare} 
                    color={event.event_type === 'deal' ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"} 
                  />
                ))
              ) : (
                <>
                  <TimelineItem 
                    title="Conversa encerrada via WhatsApp" 
                    description="Finalizou suporte técnico sobre configuração de API. CSAT: 5 estrelas." 
                    time="10 min atrás" 
                    icon={MessageSquare} 
                    color="bg-emerald-500/10 text-emerald-400" 
                  />
                  <TimelineItem 
                    title="Compra de Créditos IA" 
                    description="Pagamento aprovado via PIX: R$ 450,00" 
                    time="2 horas atrás" 
                    icon={ShoppingBag} 
                    color="bg-indigo-500/10 text-indigo-400" 
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Painéis Contextuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CRM & Tickets */}
          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Negócios & Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Deals Ativos</span>
                <span className="text-white font-bold">{deals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tickets Abertos</span>
                <span className="text-rose-400 font-bold">{tickets?.filter((t: any) => t.status === 'open').length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Probabilidade de Fechamento</span>
                <span className="text-indigo-400 font-bold">{displayInsights.purchase_probability}%</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Financeiro */}
          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                Financeiro Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">LTV (Life Time Value)</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ltv)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Risco de Inadimplência</span>
                <span className="text-white font-bold">MUITO BAIXO</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Última Transação</span>
                <span className="text-slate-300">
                  {transactions?.[0]?.created_at ? format(new Date(transactions[0].created_at), "dd/MM/yyyy") : "15/05/2026"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

