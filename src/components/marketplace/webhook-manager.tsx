import React from 'react';
import { 
  Globe, 
  Trash2, 
  Settings, 
  CheckCircle2, 
  Plus,
  Activity,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebhookSubscriptions } from "@/hooks/marketplace/use-marketplace";

export const WebhookManager = () => {
  const { data: webhooks, isLoading } = useWebhookSubscriptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Webhooks de Saída</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Notifique sistemas externos sobre eventos na plataforma</p>
        </div>
        <Button className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-4 gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/10">
          <Plus className="w-3.5 h-3.5" />
          Cadastrar Endpoint
        </Button>
      </div>

      <div className="space-y-3">
        {webhooks?.map((hook) => (
          <div key={hook.id} className="bg-[#030712] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">{hook.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-xs">{hook.target_url}</p>
                </div>
              </div>
              <Badge className={hook.is_active ? "bg-emerald-500/10 text-emerald-500 border-none" : "bg-white/5 text-slate-500 border-none"}>
                {hook.is_active ? 'Ativo' : 'Pausado'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {hook.events?.map((event: string) => (
                <Badge key={event} variant="outline" className="text-[8px] font-black border-white/5 text-slate-500 uppercase px-1.5 py-0">
                  {event}
                </Badge>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  98.5% Success Rate
                </span>
                <span className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                  125 envios/dia
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                  <Settings className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && webhooks?.length === 0 && (
          <div className="p-12 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-3xl">
            <Globe className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Nenhum endpoint cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
