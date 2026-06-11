import React from 'react';
import { 
  Key, 
  Trash2, 
  Copy, 
  ShieldCheck, 
  Clock, 
  Plus,
  Lock,
  Terminal,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAPIKeys } from "@/hooks/marketplace/use-marketplace";

export const APIKeyManager = () => {
  const { data: keys, isLoading } = useAPIKeys();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ID da chave copiado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Chaves de API</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gerencie tokens para acesso programático</p>
        </div>
        <Button className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-4 gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/10">
          <Plus className="w-3.5 h-3.5" />
          Nova Chave
        </Button>
      </div>

      <div className="space-y-3">
        {keys?.map((key) => (
          <div key={key.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <Key className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{key.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-mono text-slate-500">{key.key_prefix}••••••••••••</span>
                  <Badge variant="outline" className="text-[8px] font-black border-white/5 text-slate-500 uppercase px-1.5 py-0">
                    {key.scopes?.join(', ')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block mr-4">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Último Uso</p>
                <p className="text-[9px] font-bold text-slate-400">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Nunca'}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={() => copyToClipboard(key.id)}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {!isLoading && keys?.length === 0 && (
          <div className="p-12 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-3xl">
            <Lock className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Nenhuma chave ativa gerada.</p>
          </div>
        )}
      </div>
    </div>
  );
};
