import React from 'react';
import { 
  MessageSquare, 
  Mail, 
  Globe, 
  Settings,
  MessageCircle,
  Camera,
  Phone,
  PlugZap,
} from 'lucide-react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, isDemoRecord } from "@/lib/demo-badge";
import { getProvider, type ChannelType } from "@/lib/channels/providers";
import {
  normalizeStatus,
  statusColor,
  statusLabel,
} from "@/lib/channels/status";
import { Store } from "lucide-react";

interface ChannelCardProps {
  channel: any;
  onConfigure: () => void;
}

export const ChannelCard = ({ channel, onConfigure }: ChannelCardProps) => {
  const isDemo =
    channel?.provider === "development_simulator" ||
    channel?.is_demo ||
    channel?.is_test ||
    isDemoRecord({
      metadata: channel?.metadata,
      is_demo: channel?.is_demo,
    });

  const provider = getProvider(channel.provider);
  const channelType: ChannelType | undefined =
    provider?.channelType ?? (channel?.settings as any)?.channel_type;
  const fromMarketplace = !!channel?.marketplace_install_id;

  const getIcon = (type: ChannelType | undefined) => {
    switch (type) {
      case 'whatsapp': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'instagram': return <Camera className="w-5 h-5 text-pink-400" />;
      case 'facebook': return <MessageCircle className="w-5 h-5 text-sky-400" />;
      case 'email': return <Mail className="w-5 h-5 text-indigo-400" />;
      case 'webchat': return <Globe className="w-5 h-5 text-violet-400" />;
      case 'voice': return <Phone className="w-5 h-5 text-amber-400" />;
      default: return <Globe className="w-5 h-5 text-slate-400" />;
    }
  };

  const status = normalizeStatus(channel.status);
  const primaryLabel =
    status === "pending_configuration" ? "Configurar"
    : status === "configured" ? "Testar conexão"
    : status === "connected" ? "Reconfigurar"
    : status === "error" ? "Corrigir"
    : "Configurar";

  return (
    <div className="bg-[#030712] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 transition-all group shadow-lg shadow-black/20 flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
            {getIcon(channelType)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{channel.name}</h3>
              {isDemo && <DemoBadge variant="simulated" />}
              {fromMarketplace && (
                <Badge className="bg-indigo-500/10 text-indigo-300 border-none text-[8px] font-black px-2 py-0.5 uppercase flex items-center gap-1">
                  <Store className="w-2.5 h-2.5" />
                  Marketplace
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {provider?.label ?? channel.provider}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 hover:text-white"
            onClick={onConfigure}
            aria-label="Abrir configuração"
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {isDemo && (
        <p className="text-[10px] text-amber-300/80 leading-relaxed mb-4">
          Canal de teste para demonstração. Não envia mensagens reais.
        </p>
      )}

      {status === "pending_configuration" && channel.error_log && (
        <p className="text-[10px] text-amber-300/80 leading-relaxed mb-4">
          {channel.error_log}
        </p>
      )}
      {status === "error" && channel.error_log && (
        <p className="text-[10px] text-rose-300/80 leading-relaxed mb-4">
          {channel.error_log}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", statusColor(status), status === "connected" && "animate-pulse")} />
            <span className="text-[10px] font-black text-white uppercase">{statusLabel(status)}</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Última Sinc</p>
          <span className="text-[10px] font-bold text-slate-300">
            {channel.last_sync_at ? new Date(channel.last_sync_at).toLocaleTimeString() : 'Nunca'}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
          {channel.identifier || "Sem identificador"}
        </span>
        <Badge
          className={cn(
            "border-none text-[8px] font-black px-2 py-0.5",
            channel.is_active
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-slate-500/10 text-slate-400"
          )}
        >
          {channel.is_active ? "ATIVO" : "INATIVO"}
        </Badge>
      </div>

      <Button
        onClick={onConfigure}
        className="w-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] font-bold gap-2"
      >
        <PlugZap className="w-3.5 h-3.5" />
        {primaryLabel}
      </Button>
    </div>
  );
};
