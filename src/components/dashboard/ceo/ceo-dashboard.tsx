import React, { useState } from 'react';
import { 
  Globe, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Rocket,
  BrainCircuit,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthScoreWidget } from "./business-ai/health-score-widget";
import { SmartFeed } from "./business-ai/smart-feed";
import { OILCommandCenter } from "./oil-command-center";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export const CEODashboard = () => {
  const [activeTab, setActiveTab] = useState("intelligence");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl gap-1 h-auto">
                <TabsTrigger value="intelligence" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                    <BrainCircuit className="w-3 h-3" />
                    OIL Intelligence
                </TabsTrigger>
                <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                    <LayoutDashboard className="w-3 h-3" />
                    Executive Overview
                </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OIL Engine: Online</span>
            </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="intelligence" className="m-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OILCommandCenter />
            </motion.div>
          </TabsContent>

          <TabsContent value="overview" className="m-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Resumo de Health e Feed Principal */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-4 space-y-6">
                  <HealthScoreWidget />
                  
                  <div className="bg-[#030712] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-24 h-24 text-white" />
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Revenue Intelligence</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-black text-white">R$ 1.240.000,00</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Faturamento Mensal (Forecast)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[68%] bg-indigo-500 rounded-full" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-400">68%</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                        <span>Meta: R$ 1.8M</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          +12.5% vs Mês Anterior
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-8">
                  <SmartFeed />
                </div>
              </div>

              {/* Grid de Canais e Operação */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Uptime Global', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-400' },
                  { label: 'Msgs Processadas', val: '1.2M', icon: Zap, color: 'text-indigo-400' },
                  { label: 'Empresas Ativas', val: '482', icon: Globe, color: 'text-indigo-400' },
                  { label: 'SLA Médio', val: '94.2%', icon: BarChart3, color: 'text-amber-400' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-black text-white">{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Quick Launch para CEO */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Próxima Geração de Inteligência</h3>
                    <p className="text-indigo-100 font-medium opacity-80 max-w-xl">Habilite o motor de IA Conversacional Analítica para realizar consultas em linguagem natural sobre toda a sua base de dados.</p>
                  </div>
                  <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shrink-0">
                    <Rocket className="w-4 h-4" />
                    Ativar Business AI Core
                  </button>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

