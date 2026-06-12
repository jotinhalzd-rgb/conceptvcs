import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, User, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferModalProps {
  conversationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferModal({ conversationId, isOpen, onOpenChange }: TransferModalProps) {
  const queryClient = useQueryClient();
  const [targetType, setTargetType] = useState<'queue' | 'agent'>('queue');
  const [targetId, setTargetId] = useState("");

  const { data: queues } = useQuery({
    queryKey: ["queues"],
    queryFn: async () => {
      const { data, error } = await supabase.from("queues").select("*");
      if (error) throw error;
      return data;
    }
  });

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    }
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      const updateData: any = {};
      if (targetType === 'queue') {
        updateData.queue_id = targetId;
        updateData.agent_id = null; // Unassign when transferring to a queue
      } else {
        updateData.agent_id = targetId;
      }

      const { error } = await supabase
        .from("conversations")
        .update(updateData)
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success(`Conversa transferida para ${targetType === 'queue' ? 'fila' : 'agente'} com sucesso`);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao transferir: ${error.message}`);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#020817] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            Transferir Conversa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Destino</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setTargetType('queue')}
                className={cn(
                  "h-10 rounded-xl gap-2 font-bold uppercase text-[10px] tracking-widest border border-white/5",
                  targetType === 'queue' ? "bg-indigo-600/10 text-indigo-400 border-indigo-600/20" : "text-slate-500"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                Fila
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setTargetType('agent')}
                className={cn(
                  "h-10 rounded-xl gap-2 font-bold uppercase text-[10px] tracking-widest border border-white/5",
                  targetType === 'agent' ? "bg-indigo-600/10 text-indigo-400 border-indigo-600/20" : "text-slate-500"
                )}
              >
                <User className="w-3.5 h-3.5" />
                Agente
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Selecionar {targetType === 'queue' ? 'Fila' : 'Agente'}
            </Label>
            <Select onValueChange={setTargetId}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11">
                <SelectValue placeholder={`Escolha a ${targetType === 'queue' ? 'fila' : 'agente'}`} />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                {targetType === 'queue' ? (
                  queues?.map(q => <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>)
                ) : (
                  agents?.map(a => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            disabled={!targetId || transferMutation.isPending}
            onClick={() => transferMutation.mutate()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 rounded-xl mt-4 gap-2"
          >
            {transferMutation.isPending ? "Transferindo..." : "Confirmar Transferência"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
