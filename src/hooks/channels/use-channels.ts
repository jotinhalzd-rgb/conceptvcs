import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useChannels() {
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateChannelStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ channelId, status }: { channelId: string, status: string }) => {
      const { data, error } = await supabase
        .from("channels")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", channelId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Status do canal atualizado.");
    },
  });
}
