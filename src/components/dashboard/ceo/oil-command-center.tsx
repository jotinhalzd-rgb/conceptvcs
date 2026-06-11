import React from 'react';
import { 
  BrainCircuit, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  History,
  LayoutDashboard
} from "lucide-react";
import { useOIL } from "@/hooks/ai/use-oil";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export const OILCommandCenter = () => {
  const { recommendations, healthHistory, latestScore, alerts, isLoading } = useOIL();

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Iniciando Camada de Inteligência...</div>;


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <BrainCircuit className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">OIL Command Center</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">OneContact Intelligence Layer • Executive View</p>
          </div>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2">
                Digital Twin Sync
            </Button>
            <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black uppercase tracking-widest text-[10px] gap-2 h-11 px-6 shadow-xl shadow-indigo-600/20">
                Generate Strategy
                <Zap className="w-3 h-3" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Risk Monitor */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-rose-500/20 text-rose-400 border-none font-black text-[10px] uppercase">Risk Guard</Badge>
                    <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Churn Risk</h3>
                <p className="text-rose-200/40 text-xs mb-6 font-medium leading-relaxed">3 contas enterprise apresentam queda de 40% no engajamento esta semana.</p>
                <Button className="w-full bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black uppercase tracking-widest text-[10px] py-6">
                    Mitigate Now
                </Button>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 blur-3xl rounded-full" />
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Saúde por Departamento</p>
                <div className="space-y-4">
                    {[
                        { label: 'Comercial', value: 88, color: 'bg-emerald-500' },
                        { label: 'Suporte', value: 64, color: 'bg-amber-500' },
                        { label: 'Financeiro', value: 92, color: 'bg-indigo-500' },
                    ].map((dept, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                <span>{dept.label}</span>
                                <span>{dept.value}%</span>
                            </div>
                            <Progress value={dept.value} className={`h-1 bg-white/5 ${dept.color}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Opportunity Engine */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-400" />
                        Opportunity Engine
                    </h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Inteligência Preditiva</p>
                </div>
                <Button variant="ghost" className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Ver Todas</Button>
            </div>

            <div className="space-y-4">
                {[
                    { title: 'Reativação: Campanha "Black Week"', desc: '242 clientes inativos há 90 dias detectados com perfil similar a compradores atuais.', category: 'Revenue', impact: '+R$ 42k', priority: 'High' },
                    { title: 'Upgrade: Plano Pro → Enterprise', desc: '12 empresas excederam limite de atendentes. Probabilidade de conversão: 88%.', category: 'Expansion', impact: '+R$ 12k/m', priority: 'Medium' },
                    { title: 'Cross-sell: Módulo de Telefonia', desc: '40% da base utiliza CRM mas não possui ramais vinculados.', category: 'Product', impact: '+15% ARPU', priority: 'Low' },
                ].map((opp, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ x: 10 }}
                        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-indigo-500/30 transition-all group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{opp.title}</h4>
                            <Badge className="bg-indigo-600/10 text-indigo-400 border-none font-black text-[9px] uppercase">{opp.impact}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{opp.desc}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Badge variant="outline" className="text-[8px] border-white/10 text-slate-500">{opp.category}</Badge>
                                <Badge variant="outline" className={`text-[8px] border-none ${opp.priority === 'High' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-white/5'}`}>{opp.priority}</Badge>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Global Intelligence Stats */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-600 border border-indigo-500 rounded-3xl p-6 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                <ShieldCheck className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Health Score Global</p>
                <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl font-black text-white">{latestScore}</span>
                    <span className="text-indigo-200 text-sm font-bold mb-1">/100</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-100 text-[10px] font-black uppercase">
                    <TrendingUp className="w-3 h-3" />
                    +4.2% vs. Mês Anterior
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
            </div>


            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Digital Twin Activity</h4>
                <div className="space-y-4">
                    {[
                        { label: 'Eventos OIL', value: '42.1k', icon: Activity },
                        { label: 'Relacionamentos', value: '156k', icon: LayoutDashboard },
                        { label: 'Decisões IA', value: '1.2k', icon: Zap },
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <stat.icon className="w-4 h-4 text-slate-600" />
                                <span className="text-xs font-bold text-slate-400">{stat.label}</span>
                            </div>
                            <span className="text-sm font-black text-white">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
