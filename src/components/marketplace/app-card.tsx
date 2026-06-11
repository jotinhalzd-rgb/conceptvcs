import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

interface AppCardProps {
  app: any;
  isConnected: boolean;
  onConnect: (appId: string) => void;
}

export const AppCard = ({ app, isConnected, onConnect }: AppCardProps) => {
  return (
    <div className="bg-[#030712] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 transition-all group relative overflow-hidden flex flex-col h-full shadow-lg shadow-black/20">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 blur-[40px] pointer-events-none rounded-full" />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center overflow-hidden p-2">
          {app.logo_url ? (
            <img src={app.logo_url} alt={app.name} className="w-full h-full object-contain filter brightness-110" />
          ) : (
            <div className="w-full h-full bg-slate-800 rounded-xl" />
          )}
        </div>
        {isConnected ? (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black px-2 py-0.5 uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Conectado
          </Badge>
        ) : (
          <Badge className="bg-white/5 text-slate-500 border-none text-[8px] font-black px-2 py-0.5 uppercase">
            Disponível
          </Badge>
        )}
      </div>

      <div className="flex-1 mb-6 relative z-10">
        <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight mb-2">
          {app.name}
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
          {app.description}
        </p>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10 mt-auto">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
          Categoria: {app.category}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onConnect(app.id)}
          className={cn(
            "h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-xl transition-all",
            isConnected 
              ? "text-slate-400 hover:text-white hover:bg-white/5" 
              : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/10"
          )}
        >
          {isConnected ? "Gerenciar" : "Conectar"}
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      </div>
    </div>
  );
};
