import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";
import { 
  Network, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight,
  ChevronDown,
  Building2,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { motion } from "framer-motion";

export const PartnerDashboard = () => {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;

  // 1. Consulta das Redes onde a org é Master
  const { data: networks, isLoading: loadingNetworks } = useQuery({
    queryKey: ["partner-networks", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_networks_v2")
        .select("*")
        .eq("master_org_id", orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // 2. Consulta da Hierarquia (Filhos/Unidades)
  const { data: units, isLoading: loadingUnits } = useQuery({
    queryKey: ["network-units", networks?.[0]?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_hierarchy_v2")
        .select(`
          *,
          child_org:organizations(name)
        `)
        .eq("network_id", networks?.[0]?.id!);
      if (error) throw error;
      return data;
    },
    enabled: !!networks?.[0]?.id,
  });

  return (
    <GlobalErrorBoundary name="PartnerDashboard">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Network Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-black text-[9px] uppercase tracking-widest">Master Network</Badge>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Expansion Dashboard</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                {networks?.[0]?.network_name || "Sua Rede de Expansão"}
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </h1>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Unidades</p>
                  <p className="text-sm font-black text-white leading-none">{units?.length || 0}</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Rede MRR</p>
                  <p className="text-sm font-black text-white leading-none">R$ 124.5k</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] h-10">
              Configurar White Label
            </Button>
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-xl shadow-indigo-600/20">
              Nova Unidade
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Unit Performance Ranking */}
            <div className="lg:col-span-2 bg-[#030712] border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Ranking de Performance da Rede
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Comparativo de conversão e receita por unidade</p>
                </div>
              </div>

              <div className="space-y-4">
                {units?.map((unit: any, i: number) => (
                  <motion.div 
                    key={unit.id}
                    whileHover={{ x: 10 }}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                        #{i + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{(unit.child_org as any)?.name || 'Unidade Local'}</h4>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{unit.hierarchy_level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversão</p>
                            <p className="text-sm font-black text-emerald-400">18.4%</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receita</p>
                            <p className="text-sm font-black text-white">R$ 14.2k</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-700" />
                    </div>
                  </motion.div>
                ))}

                {(!units || units.length === 0) && (
                    <div className="p-12 text-center text-slate-600 italic text-sm">
                        Nenhuma unidade franqueada ou revenda ativa nesta rede.
                    </div>
                )}
              </div>
            </div>

            {/* Network Health & AI Stats */}
            <div className="space-y-8">
                <Card className="bg-indigo-600 border-none rounded-[2rem] p-8 relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                    <ShieldCheck className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Health Score da Rede</p>
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-5xl font-black text-white">92</span>
                        <span className="text-indigo-200 text-sm font-bold mb-1">/100</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100 text-[10px] font-black uppercase">
                        <TrendingUp className="w-3 h-3" />
                        +2.1% este mês
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                </Card>

                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insights de Expansão</p>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
                            <h5 className="text-[11px] font-black text-white uppercase mb-1">Gargalo Detectado</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed">Unidade Sudeste apresenta SLA 30% acima da média da rede.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-all cursor-pointer">
                            <h5 className="text-[11px] font-black text-emerald-400 uppercase mb-1">Oportunidade de Upsell</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed">15% da base de revendas ainda não ativou o módulo de IA.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
