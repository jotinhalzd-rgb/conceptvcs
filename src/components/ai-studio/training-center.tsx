import React from 'react';
import { 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  ExternalLink,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const TrainingCenter = () => {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-500" />
            Central de Treinamento
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Alimente a inteligência dos seus agentes com dados reais da sua empresa.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2">
            <LinkIcon className="w-4 h-4" />
            Vincular Site
          </Button>
          <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black uppercase tracking-widest text-[10px] gap-2 h-11 px-6">
            <Upload className="w-4 h-4" />
            Upload PDF/Word
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FileText, label: "Documentos", count: "42", color: "text-indigo-400" },
          { icon: LinkIcon, label: "Links Rastreados", count: "12", color: "text-emerald-400" },
          { icon: Search, label: "FAQ Gerado", count: "156", color: "text-amber-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Fila de Processamento</h3>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase">IA Sincronizada</Badge>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {[
            { name: "Manual_de_Procedimentos_v2.pdf", size: "2.4MB", status: "completed", progress: 100 },
            { name: "FAQ_Suporte_Tecnico.xlsx", size: "1.1MB", status: "processing", progress: 65 },
            { name: "https://kb.onecontact.os/integration", size: "URL", status: "pending", progress: 0 },
          ].map((item, i) => (
            <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                    <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 max-w-md">
                    <p className="text-sm font-bold text-white mb-1 truncate">{item.name}</p>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-600 font-bold uppercase">{item.size}</span>
                        <Progress value={item.progress} className="h-1 flex-1 bg-white/5" />
                    </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {item.status === 'completed' && (
                    <div className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Indexado</span>
                    </div>
                )}
                {item.status === 'processing' && (
                    <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Vetorizando...</span>
                    </div>
                )}
                {item.status === 'pending' && (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Aguardando</span>
                    </div>
                )}
                <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
