import React, { useState } from 'react';
import { 
  Rocket, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Zap,
  ChevronDown,
  MoreVertical,
  Calendar,
  MousePointer2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { useCampaigns } from "@/hooks/campaigns/use-campaigns";
import { cn } from "@/lib/utils";
import { SmartBackButton } from "@/components/layout/back-button";

export const CampaignsView = () => {
  const { data: campaigns, isLoading } = useCampaigns();
  const [activeTab, setActiveTab] = useState<'all' | 'sending' | 'scheduled'>('all');

  return (
    <GlobalErrorBoundary name="Campaigns">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Header Growth Hub */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <SmartBackButton />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Growth & Automation Hub</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Campanhas Inteligentes</h1>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
                <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Conversão Média</p>
                        <p className="text-sm font-black text-white leading-none">12.4%</p>
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">ROI Global</p>
                        <p className="text-sm font-black text-white leading-none">4.8x</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-10 text-indigo-400 hover:text-indigo-300 gap-2 border border-indigo-500/20 bg-indigo-500/5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Campaign AI
            </Button>
            <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Nova Campanha</span>
            </Button>
          </div>
        </header>

        {/* Filtros */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617] shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl gap-1">
                    {['all', 'sending', 'scheduled'].map((tab) => (
                        <Button 
                            key={tab}
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                                activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {tab === 'all' ? 'Todas' : tab === 'sending' ? 'Em Envio' : 'Agendadas'}
                        </Button>
                    ))}
                </div>
                <div className="w-px h-4 bg-white/5 mx-2" />
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        placeholder="Pesquisar campanhas..." 
                        className="bg-transparent border-none text-[11px] font-medium text-slate-300 placeholder:text-slate-600 focus:outline-none pl-9 w-64"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 12 Ativas</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 4 Agendadas</span>
            </div>
        </div>

        {/* Grade de Campanhas */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {campaigns?.map((campaign) => (
                    <div key={campaign.id} className="bg-[#030712] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 transition-all group relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px] pointer-events-none rounded-full" />
                        
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                    <Rocket className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{campaign.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] font-black px-1.5 py-0 uppercase">{campaign.campaign_type}</Badge>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Mini Analytics */}
                        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                            {[
                                { label: 'Enviadas', val: '4.2k', color: 'text-slate-300' },
                                { label: 'Aberturas', val: '68%', color: 'text-emerald-400' },
                                { label: 'Cliques', val: '12%', color: 'text-indigo-400' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={cn("text-xs font-black", stat.color)}>{stat.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2 mb-6 relative z-10">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <span>Progresso do Disparo</span>
                                <span className="text-white">85%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                                <MousePointer2 className="w-3 h-3 text-slate-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Último clique há 2 min</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/10">Ver Relatório Full</Button>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New */}
                <button className="h-[280px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/20 hover:bg-white/[0.01] transition-all group">
                    <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <Plus className="w-6 h-6 text-slate-600 group-hover:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400">Criar Nova Jornada</p>
                        <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-1">Sugerido pela Campaign AI</p>
                    </div>
                </button>
            </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
