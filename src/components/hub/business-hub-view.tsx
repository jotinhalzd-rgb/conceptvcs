import React, { useState } from 'react';
import { 
  Globe, 
  Users, 
  ShoppingBag, 
  Share2, 
  ShieldCheck, 
  Star,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Map,
  Link2
} from "lucide-react";
import { useHub } from "@/hooks/ai/use-hub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { SmartBackButton } from "@/components/layout/back-button";

export const BusinessHubView = () => {
  const { publicProfiles, connections, assets, isLoading } = useHub();
  const [activeTab, setActiveTab] = useState("network");

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Conectando ao Ecossistema OneContact...</div>;

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/60 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-4">
          <SmartBackButton />
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Globe className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-[0.1em] italic">Business Hub</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Corporate Ecosystem</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                    placeholder="Buscar empresas ou ativos..." 
                    className="w-64 h-11 bg-white/5 border-white/10 rounded-2xl pl-12 text-sm focus:ring-indigo-600/20"
                />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-2xl shadow-xl shadow-indigo-600/20 gap-2">
              <Share2 className="w-4 h-4" />
              Convidar Empresa
            </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="mb-8">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl gap-1 h-auto">
                        <TabsTrigger value="network" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                            <Map className="w-3 h-3" />
                            Network Graph
                        </TabsTrigger>
                        <TabsTrigger value="marketplace" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                            <ShoppingBag className="w-3 h-3" />
                            Exchange Hub
                        </TabsTrigger>
                        <TabsTrigger value="partners" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 gap-2">
                            <Users className="w-3 h-3" />
                            Meus Parceiros
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="network" className="m-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 h-[600px] flex items-center justify-center relative overflow-hidden group">
                            {/* Visual Placeholder for the Network Graph */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
                            <div className="relative z-10 text-center">
                                <div className="w-32 h-32 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 animate-pulse">
                                    <Globe className="w-16 h-16 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Network Mapping</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto">Visualize as conexões de valor entre sua empresa, fornecedores e parceiros estratégicos em tempo real.</p>
                            </div>
                            
                            {/* Decorative Floating Nodes */}
                            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><Link2 className="w-5 h-5 text-indigo-400" /></motion.div>
                            <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Users className="w-6 h-6 text-emerald-400" /></motion.div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400" />
                                Empresas em Destaque
                            </h3>
                            {publicProfiles?.map((profile: any) => (
                                <motion.div 
                                    key={profile.id}
                                    whileHover={{ x: 10 }}
                                    className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-5 hover:border-indigo-500/30 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                                            {profile.display_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                {profile.display_name}
                                                {profile.verified_badge && <ShieldCheck className="w-3 h-3 text-indigo-400" />}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{profile.industry}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex gap-1">
                                            <Badge variant="outline" className="text-[8px] bg-white/5 border-none text-slate-400">Reputação: {profile.reputation_score}</Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase text-indigo-400">Conectar</Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="marketplace" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-4 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 mb-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Corporate Assets Exchange</h2>
                            <p className="text-indigo-200/60 text-sm max-w-2xl">Instale templates verificados, automações complexas e agentes treinados criados pelas melhores empresas do ecossistema.</p>
                        </div>
                        {assets?.map((asset: any) => (
                            <motion.div 
                                key={asset.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group"
                            >
                                <div className="mb-4">
                                    <Badge className="bg-indigo-600/10 text-indigo-400 border-none font-black text-[9px] uppercase mb-2">
                                        {asset.asset_type.replace('_', ' ')}
                                    </Badge>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{asset.name}</h4>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-6">{asset.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-sm font-black text-white">{asset.price === 0 ? 'FREE' : `R$ ${asset.price}`}</span>
                                    <Button size="sm" className="bg-white text-indigo-600 rounded-xl font-black uppercase text-[10px] px-4 h-8">
                                        Instalar
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="partners" className="m-0">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-12 text-center">
                        <Users className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Sua Rede de Parceiros</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2 mb-8">Gerencie suas conexões estratégicas, comissões de indicações e fluxos de trabalho compartilhados.</p>
                        <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] h-12 px-8">
                            Ver Diretório de Parceiros
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
};
