import React, { useState } from "react";
import { useAgents } from "@/hooks/ai/use-agents";
import { useQueues } from "@/hooks/queues/use-queues";
import { useChannels } from "@/hooks/channels/use-channels";
import { Bot, Settings2, Trash2, Plus, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { AgentTestDialog } from "./agent-test-dialog";

export const AgentList = ({ onEdit }: { onEdit: (agent: any) => void }) => {
  const { agents, isLoading, toggleAgent, deleteAgent } = useAgents();
  const { data: queues } = useQueues();
  const { data: channels } = useChannels();
  const [testing, setTesting] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const queueName = (id?: string | null) =>
    id ? (queues ?? []).find((q: any) => q.id === id)?.name ?? "—" : "—";
  const channelName = (id?: string | null) => {
    if (!id) return "—";
    const c: any = (channels ?? []).find((c: any) => c.id === id);
    return c?.name ?? c?.identifier ?? "—";
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
        Carregando Agentes...
      </div>
    );
  }

  const list = agents ?? [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onEdit(null)}
          className="h-[280px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Plus className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-white font-black uppercase tracking-widest">Novo Agente</p>
            <p className="text-slate-500 text-xs mt-1">Criar especialista digital</p>
          </div>
        </motion.button>

        {list.length === 0 && (
          <div className="col-span-full text-center text-slate-500 text-xs py-8">
            Nenhum agente criado ainda. Comece criando um especialista digital.
          </div>
        )}

        {list.map((agent: any) => {
          const meta = (agent.metadata && typeof agent.metadata === "object" ? agent.metadata : {}) as Record<string, any>;
          const model = (meta.model as string) || "—";
          const provider = (meta.provider as string) || "lovable_ai";
          const updated = agent.updated_at ? new Date(agent.updated_at).toLocaleString() : "—";
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 relative group overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex gap-2 items-center">
                  <Badge
                    className={
                      agent.status === "pending_configuration"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : agent.is_active
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500"
                    }
                  >
                    {agent.status === "pending_configuration"
                      ? "Pendente"
                      : agent.is_active
                        ? "Ativo"
                        : "Inativo"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(agent)}
                    className="rounded-xl hover:bg-white/5 text-slate-400"
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDelete(agent)}
                    className="rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-white font-black uppercase tracking-wider mb-2">{agent.name}</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-2">
                {agent.description || "Sem descrição disponível."}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Fila</p>
                  <span className="text-[11px] text-white font-bold">{queueName(agent.queue_id)}</span>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Canal</p>
                  <span className="text-[11px] text-white font-bold">{channelName(agent.channel_id)}</span>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 col-span-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Modelo</p>
                  <span className="text-[11px] text-white font-mono">{provider} · {model}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!agent.is_active}
                    onCheckedChange={(v) => toggleAgent.mutate({ id: agent.id, is_active: v })}
                  />
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Atualizado {updated}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setTesting(agent)}
                  className="rounded-xl border-white/10 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase gap-2"
                >
                  <Beaker className="w-3 h-3" /> Testar
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AgentTestDialog
        agent={testing}
        open={!!testing}
        onOpenChange={(v) => !v && setTesting(null)}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent className="bg-[#030712] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir agente?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação remove permanentemente o agente <strong>{confirmDelete?.name}</strong>. As
              configurações e histórico de teste serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete?.id) deleteAgent.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};