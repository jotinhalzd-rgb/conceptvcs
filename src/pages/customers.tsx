import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  ShoppingBag, 
  Ticket, 
  History, 
  TrendingUp, 
  ShieldAlert, 
  Zap,
  Target,
  BarChart3,
  ExternalLink,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Customer360View() {
  return (
    <GlobalErrorBoundary name="Customer360View">
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-indigo-500/20 shadow-2xl">
              <AvatarImage src="" />
              <AvatarFallback className="bg-indigo-600 text-white text-2xl font-black">ER</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Eduardo Rocha</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase font-black text-[10px]">Cliente VIP</Badge>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Mail className="w-3.5 h-3.5" />
                  eduardo@exemplo.com
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Phone className="w-3.5 h-3.5" />
                  +55 11 99999-9999
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl border-white/10 text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest px-6 h-12">
              Editar Perfil
            </Button>
            <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-[10px] tracking-widest px-6 h-12 gap-2 shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4" />
              Nova Ação
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Inteligência */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/[0.02] border-white/[0.08] shadow-2xl">
              <CardHeader>
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Inteligência IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score de Saúde</span>
                    <span className="text-2xl font-black text-emerald-400 italic">98</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Churn Risk</p>
                    <p className="text-sm font-black text-emerald-400 uppercase">Baixo</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">LTV Est.</p>
                    <p className="text-sm font-black text-indigo-400 uppercase">R$ 45k</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contexto da Conta</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Origem</span>
                      <span className="text-white font-bold uppercase italic tracking-tight">WhatsApp Enterprise</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Atendente Responsável</span>
                      <span className="text-indigo-400 font-black italic tracking-tight underline cursor-pointer">Ana Paula</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Gerente</span>
                      <span className="text-white font-bold uppercase italic tracking-tight">Ricardo S.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-600/5 border-indigo-600/20">
              <CardHeader>
                <CardTitle className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Observações Internas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Cliente focado em resultados de ROI. Prioriza atendimento via voz para decisões complexas. Possui interesse no módulo de Automação IA v2."
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Área Principal - Timeline e Detalhes */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-2xl h-auto gap-2">
                <TabsTrigger value="timeline" className="rounded-xl px-6 py-2.5 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Timeline Omnichannel</TabsTrigger>
                <TabsTrigger value="compras" className="rounded-xl px-6 py-2.5 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Histórico de Compras</TabsTrigger>
                <TabsTrigger value="tickets" className="rounded-xl px-6 py-2.5 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Suporte & Tickets</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6 space-y-4">
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/[0.05]">
                  {[
                    { type: 'message', title: 'Conversa via WhatsApp', desc: 'Dúvida técnica sobre integração API processada por IA.', time: 'há 2 horas', icon: MessageSquare, color: 'bg-emerald-500' },
                    { type: 'purchase', title: 'Compra Aprovada', desc: 'Renovação de licença anual - Plano Enterprise.', time: 'há 1 dia', icon: ShoppingBag, color: 'bg-indigo-500' },
                    { type: 'ticket', title: 'Ticket Resolvido', desc: 'Ajuste de permissões de usuário master.', time: 'há 3 dias', icon: Ticket, color: 'bg-amber-500' },
                    { type: 'campaign', title: 'Campanha Enviada', desc: 'Convite para Webinar: O Futuro da IA Conversacional.', time: 'há 1 semana', icon: Zap, color: 'bg-purple-500' }
                  ].map((event, i) => (
                    <div key={i} className="relative group">
                      <div className={cn(
                        "absolute -left-[27px] top-1 w-6 h-6 rounded-full border-4 border-[#020617] flex items-center justify-center z-10 transition-transform group-hover:scale-125",
                        event.color
                      )}>
                        <event.icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:bg-white/[0.04] transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{event.title}</h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{event.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="compras" className="mt-6">
                 <Card className="bg-white/[0.02] border-white/[0.08]">
                   <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/[0.05]">
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 text-xs font-bold text-slate-400">12 Jun, 2026</td>
                              <td className="px-6 py-4 text-xs font-black text-white italic">Plano Enterprise 12M</td>
                              <td className="px-6 py-4 text-xs font-black text-indigo-400">R$ 12.500,00</td>
                              <td className="px-6 py-4"><Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold text-[9px] uppercase tracking-tighter italic">Processado</Badge></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                   </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
}
