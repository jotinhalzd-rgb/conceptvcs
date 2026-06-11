import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useConversations(queueId?: string) {
  return useQuery({
    queryKey: ["conversations", queueId],
    queryFn: async () => {
      let query = supabase
        .from("conversations")
        .select(`
          *,
          contacts(name, email),
          profiles(full_name),
          queues(name),
          channels(name, provider)
        `)

        .order("last_message_at", { ascending: false });

      if (queueId) {
        query = query.eq("queue_id", queueId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
