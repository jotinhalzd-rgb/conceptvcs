import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Send, 
  MoreVertical,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignService, Campaign } from "@/services/campaigns/campaign-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await CampaignService.list();
      setCampaigns(data as any);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors = {
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    scheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    sending: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    paused: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const channelIcons = {
    whatsapp: <MessageSquare className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    sms: <Smartphone className="w-4 h-4" />,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Motor de <span className="text-indigo-500">Campanhas 2.0</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Engajamento Omnichannel de Alta Escala</p>
        </div>
        <Button className="h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-6 font-bold shadow-xl shadow-indigo-600/20 gap-2 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Criar Nova Campanha</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Disparos Hoje", val: "128k", icon: Send, color: "text-indigo-400" },
          { label: "Taxa de Entrega", val: "99.2%", icon: CheckCircle2, color: "text-emerald-400" },
          { label: "ROI Estimado", val: "R$ 45k", icon: BarChart3, color: "text-purple-400" },
          { label: "Público Ativo", val: "2.5M", icon: Users, color: "text-amber-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-[2rem] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <Badge variant="outline" className="bg-white/5 border-none text-[10px] text-slate-500 font-black">+12%</Badge>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white mt-1 tabular-nums">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#030712]/50 border border-white/[0.05] rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all w-[300px]" 
                placeholder="Pesquisar campanhas..." 
              />
            </div>
            <Button variant="ghost" className="text-slate-400 hover:text-white gap-2 font-bold text-xs uppercase tracking-widest">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white rounded-xl">
              <Zap className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white rounded-xl">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Campanha</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Canal</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Performance</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <Zap className="w-8 h-8 text-indigo-500 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Acessando rede de inteligência...</p>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhuma campanha ativa</p>
                    <Button variant="link" className="text-indigo-400 font-black uppercase text-[10px] mt-2 tracking-widest">Iniciar Primeira Jornada</Button>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{campaign.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">{campaign.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                          {channelIcons[campaign.channel as keyof typeof channelIcons] || <Smartphone className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{campaign.channel}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full", statusColors[campaign.status as keyof typeof statusColors])}>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2 w-32">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 tracking-tight">
                          <span>Conversão</span>
                          <span className="text-indigo-400">12.5%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-indigo-500" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
