import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useVoiceExtensions() {
  return useQuery({
    queryKey: ["voice-extensions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_extensions")
        .select(`
          *,
          profiles(full_name)
        `)
        .order("extension_number", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCallLogs(contactId?: string) {
  return useQuery({
    queryKey: ["call-logs", contactId],
    queryFn: async () => {
      let query = supabase
        .from("call_logs")
        .select(`
          *,
          contacts(name, phone),
          profiles(full_name)
        `)
        .order("created_at", { ascending: false });

      if (contactId) {
        query = query.eq("contact_id", contactId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateExtensionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extensionId, status }: { extensionId: string, status: string }) => {
      const { data, error } = await supabase
        .from("voice_extensions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", extensionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-extensions"] });
    },
  });
}
