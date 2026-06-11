import React from 'react';
import { 
  MessageSquare, 
  Instagram, 
  Mail, 
  Globe, 
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Settings
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChannelCardProps {
  channel: any;
  onRefresh: () => void;
}

export const ChannelCard = ({ channel, onRefresh }: ChannelCardProps) => {
  const getIcon = (provider: string) => {
    switch (provider) {
      case 'whatsapp': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'email': return <Mail className="w-5 h-5 text-indigo-400" />;
      default: return <Globe className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return "bg-emerald-500";
      case 'offline': return "bg-slate-500";
      case 'error': return "bg-rose-500";
      default: return "bg-amber-500";
    }
  };

  return (
    <div className="bg-[#030712] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 transition-all group shadow-lg shadow-black/20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
            {getIcon(channel.provider)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{channel.name}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{channel.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-white" onClick={onRefresh}>
                <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-white">
                <Settings className="w-3.5 h-3.5" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", getStatusColor(channel.status))} />
            <span className="text-[10px] font-black text-white uppercase">{channel.status}</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Última Sinc</p>
          <span className="text-[10px] font-bold text-slate-300">
            {channel.last_sync_at ? new Date(channel.last_sync_at).toLocaleTimeString() : 'Nunca'}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border-2 border-[#030712] flex items-center justify-center text-[7px] font-black text-slate-500">
                    AG
                </div>
            ))}
            <div className="w-5 h-5 rounded-full bg-indigo-600 border-2 border-[#030712] flex items-center justify-center text-[7px] font-black text-white">
                +4
            </div>
        </div>
        <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] font-black px-2 py-0.5">
            1.2k MSGS/DIA
        </Badge>
      </div>
    </div>
  );
};
