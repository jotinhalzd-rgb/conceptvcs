import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      body, 
      type = 'public' 
    }: { 
      conversationId: string; 
      body: string; 
      type?: 'public' | 'internal' 
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      if (type === 'internal') {
        const { data, error } = await supabase
          .from("internal_notes")
          .insert({
            conversation_id: conversationId,
            content: body,
            author_id: userData.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            body: body,
            type: 'text',
            sender_profile_id: userData.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        
        // Update conversation last_message
        await supabase
          .from("conversations")
          .update({ 
            last_message_preview: body,
            last_message_at: new Date().toISOString()
          })
          .eq("id", conversationId);

        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["internal_notes", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    }
  });
}
