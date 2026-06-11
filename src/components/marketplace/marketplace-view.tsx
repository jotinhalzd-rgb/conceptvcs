import React, { useState } from 'react';
import { useHubAssets, useHubInstalls } from "@/hooks/marketplace/use-marketplace";
import { AppCard } from "./app-card";
import { 
  Grid3X3, 
  Search, 
  Filter, 
  Terminal, 
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  ChevronDown,
  Box,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

export const MarketplaceView = () => {
  const navigate = useNavigate();
  const { data: assets, isLoading: loadingApps } = useHubAssets();
  const { data: installs, isLoading: loadingConnected } = useHubInstalls();
  const [activeCategory, setActiveTab] = useState('all');

  const categories = ['all', 'crm', 'marketing', 'support', 'finance', 'telecom'];

  const filteredAssets = assets?.filter((asset: any) => 
    activeCategory === 'all' || asset.asset_category_code === activeCategory
  );


  return (
    <GlobalErrorBoundary name="Marketplace">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Header Marketplace */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">OneContact Ecosystem</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Marketplace de Aplicativos</h1>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3 transition-all hover:bg-white/[0.04]">
                <Box className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Conectados</p>
                  <p className="text-sm font-black text-white leading-none">{installs?.length || 0}</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3 transition-all hover:bg-white/[0.04]">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Eventos/Dia</p>
                  <p className="text-sm font-black text-white leading-none">12.5k</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                onClick={() => navigate({ to: "/settings/developer" })}
                className="h-10 text-slate-400 hover:text-white gap-2 border border-white/5 bg-white/5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
                Developer Center
                <Terminal className="w-3.5 h-3.5" />
            </Button>

            <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <span>Sugerir Integração</span>
            </Button>
          </div>
        </header>

        {/* Filtros e Busca */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617] shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl gap-1">
                {categories.map((cat) => (
                    <Button 
                        key={cat}
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab(cat)}
                        className={cn(
                            "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                            activeCategory === cat ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {cat === 'all' ? 'Todos' : cat.toUpperCase()}
                    </Button>
                ))}
            </div>
            <div className="w-px h-4 bg-white/5 mx-2" />
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                placeholder="Buscar no marketplace..." 
                className="bg-transparent border-none text-[11px] font-medium text-slate-300 placeholder:text-slate-600 focus:outline-none pl-9 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-600">
              Mostrando {filteredAssets?.length || 0} de {assets?.length || 0} aplicativos
            </span>
          </div>
        </div>

        {/* Grid de Apps */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {loadingApps || loadingConnected ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredAssets?.map((asset: any) => (
                <AppCard 
                  key={asset.id} 
                  app={asset} 
                  isConnected={installs?.some((c: any) => c.asset_id === asset.id) || false} 
                  onConnect={(id) => console.log("Connect to", id)}
                />
              ))}

              {/* Placeholder para Build Your Own */}
              <button className="h-full min-h-[280px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/20 hover:bg-white/[0.01] transition-all group p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Terminal className="w-6 h-6 text-slate-600 group-hover:text-indigo-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">Construa sua Integração</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-2 leading-relaxed">Use nossa API robusta e Webhooks para conectar qualquer sistema.</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
