import React from 'react';
import { 
  Zap, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Trophy,
  Lightbulb,
  Target,
  LineChart,
  Network
} from "lucide-react";
import { useEIN } from "@/hooks/ai/use-ein";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export const CEOAdvisorView = () => {
  const { benchmarks, insights, bestPractices, industry, isLoading } = useEIN();

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Consultando Rede de Inteligência...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 relative">
            <Sparkles className="w-8 h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#020617] animate-ping" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
              CEO Advisor
              <Badge className="bg-indigo-600/10 text-indigo-400 border-none font-black text-[10px] uppercase h-5">Enterprise AI</Badge>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Insights Estratégicos Baseados em Inteligência Coletiva</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">Setor: {industry}</span>
            <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black uppercase tracking-widest text-[10px] h-11 px-6 shadow-xl shadow-indigo-600/20 gap-2">
                Simular Cenários
                <LineChart className="w-3 h-3" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Benchmark - Peer Analysis */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            Peer Performance Benchmarking
                        </h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Comparativo Real vs. Setor {industry}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { label: 'Tempo Médio de Resposta', your: '8.2 min', average: '4.5 min', status: 'critical', trend: 'down' },
                        { label: 'Taxa de Conversão (Lead → Venda)', your: '18.4%', average: '12.2%', status: 'excellent', trend: 'up' },
                        { label: 'Customer Satisfaction (CSAT)', your: '92%', average: '88%', status: 'good', trend: 'up' },
                        { label: 'Frequência de Compra', your: '1.2x/m', average: '1.8x/m', status: 'warning', trend: 'stable' },
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                {item.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-black text-white">{item.your}</p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Sua Empresa</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-indigo-400">{item.average}</p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Média do Setor</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Progress value={item.status === 'excellent' ? 95 : (item.status === 'good' ? 80 : (item.status === 'warning' ? 50 : 30))} className="h-1 bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 group">
                    <Lightbulb className="w-10 h-10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Playbook Engine</h4>
                    <p className="text-indigo-200/60 text-sm mb-6 leading-relaxed">
                        Detectamos que empresas do setor {industry} que utilizam o módulo de "Pós-Venda Automatizado" possuem retenção 22% maior.
                    </p>
                    <Button variant="link" className="text-indigo-400 text-[10px] font-black uppercase tracking-widest p-0 flex items-center gap-2">
                        Instalar Playbook Vencedor
                        <ArrowUpRight className="w-3 h-3" />
                    </Button>
                </div>

                <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-3xl p-8 group">
                    <Target className="w-10 h-10 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Market Intelligence</h4>
                    <p className="text-emerald-200/60 text-sm mb-6 leading-relaxed">
                        Tendência detectada: Aumento de 15% na demanda por atendimentos via "Vídeo Chamada" no seu segmento este trimestre.
                    </p>
                    <Button variant="link" className="text-emerald-400 text-[10px] font-black uppercase tracking-widest p-0 flex items-center gap-2">
                        Ver Relatório de Tendências
                        <ArrowUpRight className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>

        {/* Advisor Feed - Real-time Strategic Insights */}
        <div className="space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-500" />
                Strategic Insights Feed
            </h3>
            
            <div className="space-y-4">
                {insights && insights.length > 0 ? (
                    insights.map((insight: any, i: number) => (
                        <motion.div 
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className={`p-6 rounded-3xl border ${insight.priority === 'high' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-white/[0.02] border-white/[0.05]'} transition-all cursor-pointer`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Badge className={insight.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-600/10 text-indigo-400'}>
                                    {insight.type?.toUpperCase()}
                                </Badge>
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Agora</span>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">{insight.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{insight.content}</p>
                        </motion.div>
                    ))
                ) : (
                    <>
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="p-6 rounded-3xl border bg-rose-500/5 border-rose-500/10 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Badge className="bg-rose-500/20 text-rose-400">GAP</Badge>
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Agora</span>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Gap de Atendimento</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Seu tempo de resposta médio aumentou 20% enquanto o mercado reduziu 5%. Risco de perda de leads detectado.</p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="p-6 rounded-3xl border bg-white/[0.02] border-white/[0.05] transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Badge className="bg-indigo-600/10 text-indigo-400">STRATEGY</Badge>
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Agora</span>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Oportunidade de Expansão</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Base de dados indica que 15% dos seus clientes são da região Sul, onde você ainda não possui operação física.</p>
                        </motion.div>
                    </>
                )}
            </div>


            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <ShieldCheck className="w-12 h-12 text-white/20 mb-4" />
                <h4 className="text-white font-black uppercase tracking-tighter text-lg mb-2">Privacidade Garantida</h4>
                <p className="text-indigo-100/60 text-xs leading-relaxed">Toda inteligência é anonimizada e agregada por setor seguindo padrões globais de LGPD e segurança de dados.</p>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
            </div>
        </div>
      </div>
    </div>
  );
};
