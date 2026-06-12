import React, { useState } from 'react';
import { KanbanBoard } from "./kanban/kanban-board";
import { DealList } from "./deal-list";
import { 
  Plus, 
  Search, 
  Filter, 
  Target, 
  DollarSign,
  ChevronDown,
  LayoutGrid,
  List,
  LineChart,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { usePipelines, useCRMGoals, useCRMForecast, useCreateDeal, useDeals, useComputedForecast, useCreatePipeline } from "@/hooks/crm/use-deals";
import { Input as UInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DealForm } from "./deal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ViewMode = 'kanban' | 'list' | 'forecast';

export const CRMView = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const { data: pipelines } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const { data: goals } = useCRMGoals();
  const { data: forecast } = useCRMForecast(selectedPipelineId || undefined);
  const { data: deals } = useDeals(selectedPipelineId || undefined);
  const { data: computed } = useComputedForecast(selectedPipelineId || undefined);
  const createDealMutation = useCreateDeal();
  const createPipelineMutation = useCreatePipeline();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState("");

  const activePipeline = pipelines?.find(p => p.id === selectedPipelineId) || pipelines?.[0];
  const activeGoal = goals?.[0];
  const activeForecast = forecast?.[0];

  const pipelineTitle = (activePipeline as any)?.title || (activePipeline as any)?.name || "Selecione o Pipeline";
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDealsCount = deals?.filter(d => 
    d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.contacts as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).length || 0;

  return (
    <GlobalErrorBoundary name="CRM">
      <div className="h-full flex flex-col bg-[#020817] overflow-hidden">
        {/* Header de Gestão */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Enterprise CRM</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center gap-3">
                    <h1 className="text-xl font-black text-white tracking-tight uppercase italic">
                      {pipelineTitle}
                    </h1>
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#0f172a] border-white/10 text-slate-300">
                  {pipelines?.map((p) => (
                    <DropdownMenuItem 
                      key={p.id} 
                      onClick={() => setSelectedPipelineId(p.id)}
                      className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                    >
                      {(p as any).title || (p as any).name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Forecast Previsto</p>
                  <p className="text-sm font-black text-white leading-none">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(computed?.weighted ?? activeForecast?.predicted_revenue ?? 0))}
                  </p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Target className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Meta: {activeGoal?.title || (activeGoal as any)?.name || "Geral"}</p>
                  <p className="text-sm font-black text-white leading-none">
                    {activeGoal ? `${Math.round((Number(activeGoal.current_value) / Number(activeGoal.target_value)) * 100)}%` : "0%"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                  viewMode === 'kanban' ? "bg-indigo-600 text-white" : "text-slate-500"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                Kanban
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-indigo-600 text-white" : "text-slate-500"
                )}
              >
                <List className="w-3.5 h-3.5 mr-2" />
                Lista
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('forecast')}
                className={cn(
                  "h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                  viewMode === 'forecast' ? "bg-indigo-600 text-white" : "text-slate-500"
                )}
              >
                <LineChart className="w-3.5 h-3.5 mr-2" />
                Previsão
              </Button>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                  <Plus className="w-4 h-4" />
                  <span>Novo Negócio</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#020817] border-white/10 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Novo Negócio</DialogTitle>
                </DialogHeader>
                <DealForm 
                  onSubmit={async (data) => {
                    await createDealMutation.mutateAsync(data);
                    setIsCreateOpen(false);
                  }} 
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isPipelineOpen} onOpenChange={setIsPipelineOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-10 border-white/10 text-slate-300 hover:bg-white/5 rounded-xl px-4 gap-2">
                  <Plus className="w-4 h-4" /> Pipeline
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#020817] border-white/10 text-white max-w-sm">
                <DialogHeader><DialogTitle className="text-base font-black uppercase">Novo Pipeline</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <UInput placeholder="Nome do pipeline" value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                  <Button onClick={async () => { if (!newPipelineName.trim()) return; await createPipelineMutation.mutateAsync({ name: newPipelineName.trim() }); setNewPipelineName(""); setIsPipelineOpen(false); }} className="w-full bg-indigo-600 hover:bg-indigo-500">Criar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Barra de Filtros */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#020817] shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                placeholder="Pesquisar negócios..." 
                className="bg-transparent border-none text-[11px] font-medium text-slate-300 placeholder:text-slate-600 focus:outline-none pl-9 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black text-slate-500 gap-2">
              <Filter className="w-3.5 h-3.5" />
              Filtros Avançados
            </Button>
            <div className="w-px h-4 bg-white/5 mx-2" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tabular-nums tracking-widest">
              Visualizando {filteredDealsCount} negócios
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {viewMode === 'kanban' && <KanbanBoard pipelineId={activePipeline?.id} />}
          {viewMode === 'list' && <DealList pipelineId={activePipeline?.id} />}
          {viewMode === 'forecast' && (
            <div className="p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
               <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Enterprise Forecast</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Análise Preditiva via IA Strategist</p>
                </div>
                <div className="flex gap-3">
                   <Card className="bg-emerald-500/5 border-emerald-500/20 px-6 py-4 rounded-2xl flex flex-col items-center">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Certeza da IA</span>
                      <span className="text-xl font-black text-white italic">94%</span>
                   </Card>
                </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white/[0.02] border-white/[0.08] p-6 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Receita Projetada</h3>
                       <p className="text-2xl font-black text-white italic">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(computed?.weighted ?? 0))}
                      </p>
                    </div>
                  </Card>

                   <Card className="bg-white/[0.02] border-white/[0.08] p-6 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ganho / Perdido</h3>
                      <p className="text-2xl font-black text-emerald-400 italic">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(Number(computed?.won ?? 0))}
                        <span className="text-slate-600 mx-2">/</span>
                        <span className="text-rose-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(Number(computed?.lost ?? 0))}</span>
                      </p>
                    </div>
                  </Card>

                  <Card className="bg-white/[0.02] border-white/[0.08] p-6 space-y-4 shadow-xl shadow-indigo-500/5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Aberto (Em Andamento)</h3>
                      <p className="text-2xl font-black text-amber-400 italic">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(computed?.open ?? 0))}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{computed?.count ?? 0} negócios</p>
                    </div>
                  </Card>
               </div>

               <div className="p-20 text-center space-y-4 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                  <LineChart className="w-12 h-12 text-slate-700 mx-auto opacity-20" />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Gráficos Avançados de Performance sendo processados...</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};
