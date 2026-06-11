import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Mail, 
  History, 
  ShoppingBag, 
  MessageSquare, 
  Ticket, 
  TrendingUp, 
  ShieldCheck,
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
  const { contact, timeline, deals, tickets, insights, transactions, isLoading } = useCustomer360(contactId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="space-y-6">
          <Skeleton className="h-[400px] bg-white/[0.02]" />
          <Skeleton className="h-[300px] bg-white/[0.02]" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[600px] bg-white/[0.02]" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
          <User className="w-10 h-10 opacity-20" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest opacity-50 text-center max-w-xs leading-relaxed">
          Nenhum cliente selecionado ou encontrado no banco de dados
        </p>
      </div>
    );
  }

  const ltv = transactions?.reduce((acc, t) => acc + Number(t.amount || 0), 0) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Coluna Esquerda: Perfil e Dados */}
      <div className="space-y-6">
        <Card className="bg-white/[0.02] border-white/[0.08] overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
          <CardContent className="px-6 pb-6 -mt-10 relative">
            <div className="w-20 h-20 rounded-2xl bg-[#020617] p-1 mb-4">
              <div className="w-full h-full rounded-xl bg-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {(contact?.name || "UN").substring(0, 2).toUpperCase()}
              </div>
            </div>
            <h3 className="text-xl font-black text-white">{contact?.name}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID: #{contact?.id.substring(0, 5)}</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-indigo-400" />
                {contact?.phone || "Não informado"}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-indigo-400" />
                {contact?.email || "Não informado"}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {contact?.lifecycle_stage || "Prospect"}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <div className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-tighter border border-indigo-500/20">VIP</div>
              <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter border border-emerald-500/20">PAGADOR</div>
            </div>
          </CardContent>
        </Card>

        {/* IA Insights Widget */}
        <Card className="bg-white/[0.02] border-white/[0.08] border-l-4 border-l-indigo-500 shadow-xl">
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
                <span className="text-emerald-400 font-black">{contact?.lead_score || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${contact?.lead_score || 0}%` }} 
                />
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 min-h-[60px] flex items-center">
              <p className="text-xs text-indigo-300 leading-relaxed italic">
                {insights?.summary || "IA está analisando o histórico do cliente para gerar novos insights preditivos."}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Próxima Melhor Ação</h4>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 font-medium">
                  {insights?.next_best_action || "Continue o atendimento para que a IA possa sugerir a próxima ação."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Central: Timeline Omnichannel */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-white/[0.02] border-white/[0.08] shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Timeline Unificada
            </CardTitle>
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 cursor-pointer transition-colors hover:bg-indigo-500/20">TODOS</div>
              <div className="px-3 py-1 rounded-full bg-white/[0.05] text-[10px] font-bold text-slate-400 cursor-pointer transition-colors hover:bg-white/[0.1]">IA</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 min-h-[300px]">
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
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <History className="w-12 h-12 opacity-10 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Nenhuma atividade registrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Painéis Contextuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CRM & Tickets */}
          <Card className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.03] transition-colors">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Negócios & Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">Deals Ativos</span>
                <span className="text-white font-black">{deals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">Tickets Abertos</span>
                <span className="text-rose-400 font-black">{tickets?.filter((t: any) => t.status === 'open').length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Probabilidade de Fechamento</span>
                <span className="text-indigo-400 font-black">{insights?.purchase_probability || 0}%</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Financeiro */}
          <Card className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.03] transition-colors">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                Financeiro Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">LTV (Life Time Value)</span>
                <span className="text-emerald-400 font-black tabular-nums shadow-emerald-400/10 drop-shadow-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ltv)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">Risco de Inadimplência</span>
                <span className="text-white font-black uppercase tracking-tighter italic">Nível Seguro</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Última Transação</span>
                <span className="text-slate-300 font-bold">
                  {transactions?.[0]?.created_at ? format(new Date(transactions[0].created_at), "dd/MM/yyyy") : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
