import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  Key, 
  Globe, 
  FileCode2, 
  History,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { cn } from "@/lib/utils";
import { APIKeyManager } from "./api-key-manager";
import { WebhookManager } from "./webhook-manager";

export const DeveloperCenter = () => {
  const [activeSection, setActiveSection] = useState<'api' | 'webhooks' | 'logs'>('api');

  return (
    <GlobalErrorBoundary name="DeveloperCenter">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Header Developer */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Platform API & Webhooks</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Developer Center</h1>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">API Status</p>
                  <p className="text-sm font-black text-white leading-none">Healthy</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Zap className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Requests</p>
                  <p className="text-sm font-black text-white leading-none">1.2M / mês</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-10 text-slate-400 hover:text-white gap-2 border border-white/5 bg-white/5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                API Docs
                <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        {/* Navegação Interna */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617] shrink-0">
          <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl gap-1">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveSection('api')}
                className={cn(
                    "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                    activeSection === 'api' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <Key className="w-3 h-3 mr-2" />
                API Keys
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveSection('webhooks')}
                className={cn(
                    "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                    activeSection === 'webhooks' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <Globe className="w-3 h-3 mr-2" />
                Webhooks
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveSection('logs')}
                className={cn(
                    "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                    activeSection === 'logs' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <FileCode2 className="w-3 h-3 mr-2" />
                API Logs
            </Button>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
            <div className="max-w-4xl mx-auto py-4">
                {activeSection === 'api' && <APIKeyManager />}
                {activeSection === 'webhooks' && <WebhookManager />}
                {activeSection === 'logs' && (
                    <div className="p-12 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-3xl">
                        <History className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Nenhum log de API disponível.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
