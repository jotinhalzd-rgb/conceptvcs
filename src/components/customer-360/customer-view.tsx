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
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function Customer360() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Coluna Esquerda: Perfil e Dados */}
      <div className="space-y-6">
        <Card className="bg-white/[0.02] border-white/[0.08] overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
          <CardContent className="px-6 pb-6 -mt-10 relative">
            <div className="w-20 h-20 rounded-2xl bg-[#020617] p-1 mb-4">
              <div className="w-full h-full rounded-xl bg-indigo-500 flex items-center justify-center text-white text-3xl font-black">
                ER
              </div>
            </div>
            <h3 className="text-xl font-black text-white">Eduardo Rocha</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cliente Gold • ID: #88241</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-indigo-400" />
                +55 (11) 99887-7665
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-indigo-400" />
                eduardo.rocha@email.com
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Lead Qualificado (IA)
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <div className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-tighter border border-indigo-500/20">VIP</div>
              <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter border border-emerald-500/20">PAGADOR</div>
              <div className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-tighter border border-amber-500/20">RECORRENTE</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Score IA & Risco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Saúde da Conta</span>
                <span className="text-emerald-400 font-black">9.2 / 10</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Risco de Churn</span>
                <span className="text-rose-400 font-black">MUITO BAIXO</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[8%]" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-xs text-indigo-300 leading-relaxed italic">
                "IA detectou padrão de compra recorrente a cada 15 dias. Próxima oportunidade em 3 dias."
              </p>
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
              Timeline Omnichannel
            </CardTitle>
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-full bg-white/[0.05] text-[10px] font-bold text-slate-400">TODOS</div>
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">CONVERSAS</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
              <TimelineItem 
                title="Ticket #921 aberto" 
                description="Dúvida técnica sobre integração Webhook" 
                time="Ontem às 14:20" 
                icon={Ticket} 
                color="bg-amber-500/10 text-amber-400" 
              />
              <TimelineItem 
                title="E-mail enviado pela IA" 
                description="Campanha de Recuperação: 'Vimos que você não finalizou seu checkout...'" 
                time="2 dias atrás" 
                icon={Mail} 
                color="bg-purple-500/10 text-purple-400" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informações de Gestão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Último Atendente</span>
                <span className="text-white font-bold">Ana Paula</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Gerente Responsável</span>
                <span className="text-white font-bold">Marcos Oliveira</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Canal de Origem</span>
                <span className="text-white font-bold">WhatsApp Direct</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">LTV (Total Pago)</span>
                <span className="text-emerald-400 font-bold tabular-nums">R$ 14.280,00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Ticket Médio</span>
                <span className="text-white font-bold tabular-nums">R$ 420,00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Faturas em Aberto</span>
                <span className="text-white font-bold">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
