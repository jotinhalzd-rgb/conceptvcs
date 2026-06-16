import React, { useEffect, useMemo, useState } from 'react';
import { useChannels } from "@/hooks/channels/use-channels";
import { ChannelCard } from "./channel-card";
import { 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  Zap,
  Loader2,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { ChannelPickerModal } from "./channel-picker-modal";
import { ChannelConfigDrawer } from "./channel-config-drawer";
import { SmartBackButton } from "@/components/layout/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { normalizeStatus, type ChannelStatus } from "@/lib/channels/status";
import { useSearch, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ChannelsView = () => {
  const { data: channels, isLoading } = useChannels();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChannelStatus | "all">("all");

  // Deep link from Marketplace: /admin/channels?channel=<id>
  const routerState = useRouterState({ select: (s) => s.location.search });
  const navigate = useNavigate();
  const targetChannelId = (routerState as any)?.channel as string | undefined;

  useEffect(() => {
    if (!targetChannelId || !channels) return;
    const match = channels.find((c: any) => c.id === targetChannelId);
    if (match) {
      setEditingChannel(match);
      // Clear the query param so re-renders don't fight user actions
      navigate({ to: ".", search: {} as any, replace: true });
    }
  }, [targetChannelId, channels, navigate]);

  const filtered = useMemo(() => {
    const list = channels ?? [];
    return list.filter((c: any) => {
      const status = normalizeStatus(c.status);
      const matchesSearch =
        !search.trim() ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.provider?.toLowerCase().includes(search.toLowerCase()) ||
        c.identifier?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [channels, search, statusFilter]);

  return (
    <GlobalErrorBoundary name="Channels">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        {/* Header Estratégico */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <SmartBackButton />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Omni-Gateway Center</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Central de Canais</h1>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Como conecto meu WhatsApp ou outro canal?</p>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex gap-4">
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Canais Ativos</p>
                  <p className="text-sm font-black text-white leading-none">
                    {channels?.filter((c: any) => c.is_active).length || 0}
                  </p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <Zap className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total</p>
                  <p className="text-sm font-black text-white leading-none">
                    {channels?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsPickerOpen(true)}
              className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Conectar Novo Canal</span>
            </Button>
          </div>
        </header>

        {/* Filtros e Busca */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617] shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                placeholder="Filtrar canais..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none text-[11px] font-medium text-slate-300 placeholder:text-slate-600 focus:outline-none pl-9 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ChannelStatus | "all")}
            >
              <SelectTrigger className="h-8 bg-transparent border-white/5 text-[10px] font-bold text-slate-300 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="connected">Conectado</SelectItem>
                <SelectItem value="configured">Configurado</SelectItem>
                <SelectItem value="pending_configuration">Aguardando configuração</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="disconnected">Desconectado</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-white/5 mx-2" />
            <span className="text-[10px] font-bold text-slate-600">
              {filtered.length} de {channels?.length || 0}
            </span>
          </div>
        </div>

        {/* Grid de Canais */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : !channels || channels.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="Nenhum canal configurado"
              description="Conecte WhatsApp, e-mail ou outro canal para começar a receber conversas."
              action={{
                label: "Conectar canal",
                onClick: () => setIsPickerOpen(true),
              }}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum canal corresponde ao filtro"
              description="Ajuste a busca ou o filtro de status para ver outros canais."
              action={{
                label: "Limpar filtros",
                onClick: () => {
                  setSearch("");
                  setStatusFilter("all");
                },
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filtered.map((channel: any) => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onConfigure={() => setEditingChannel(channel)}
                />
              ))}

              <button 
                onClick={() => setIsPickerOpen(true)}
                className="h-[280px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/20 hover:bg-white/[0.01] transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-slate-600 group-hover:text-indigo-400" />
                </div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400">Adicionar Integração</p>
              </button>
            </div>
          )}
        </div>
        <ChannelPickerModal open={isPickerOpen} onOpenChange={setIsPickerOpen} />
        <ChannelConfigDrawer
          open={!!editingChannel}
          onOpenChange={(o) => { if (!o) setEditingChannel(null); }}
          channel={editingChannel}
        />
      </div>
    </GlobalErrorBoundary>
  );
};
