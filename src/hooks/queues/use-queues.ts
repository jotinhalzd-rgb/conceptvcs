import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type QueueWithStats = any & {
  open_count: number;
  avg_wait_seconds: number;
  agents_count: number;
};

export function useQueues() {
  return useQuery({
    queryKey: ["queues-with-stats"],
    queryFn: async (): Promise<QueueWithStats[]> => {
      const { data: queues, error } = await supabase
        .from("queues")
        .select("*")
        .order("priority_level", { ascending: false });
      if (error) throw error;

      const { data: convs } = await supabase
        .from("conversations")
        .select("queue_id, status, waiting_since, first_response_at, agent_id");

      return (queues || []).map((q: any) => {
        const list = (convs || []).filter((c: any) => c.queue_id === q.id);
        const open = list.filter((c: any) => c.status === "open" || c.status === "pending");
        const responded = list.filter((c: any) => c.first_response_at && c.waiting_since);
        const avg =
          responded.length > 0
            ? responded.reduce(
                (acc: number, c: any) =>
                  acc +
                  (new Date(c.first_response_at).getTime() -
                    new Date(c.waiting_since).getTime()) /
                    1000,
                0
              ) / responded.length
            : 0;
        const agents = new Set(
          list.map((c: any) => c.agent_id).filter(Boolean)
        ).size;
        return {
          ...q,
          open_count: open.length,
          avg_wait_seconds: Math.max(0, Math.round(avg)),
          agents_count: agents,
        };
      });
    },
  });
}

export function useCreateQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      department?: string;
      priority_level?: number;
      max_capacity?: number;
    }) => {
      const { error } = await supabase.from("queues").insert({
        name: input.name,
        department: input.department || null,
        priority_level: input.priority_level ?? 1,
        max_capacity: input.max_capacity ?? 50,
        color: "indigo",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queues-with-stats"] });
      qc.invalidateQueries({ queryKey: ["queues"] });
      toast.success("Fila criada");
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });
}