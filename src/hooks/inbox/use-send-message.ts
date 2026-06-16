import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      body,
      type = 'public',
      mediaUrl,
      mediaKind,
    }: {
      conversationId: string;
      body: string;
      type?: 'public' | 'internal';
      mediaUrl?: string;
      mediaKind?: 'image' | 'audio' | 'document';
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      // Chamar a nova Edge Function que lida com envio real e bypass de RLS via Service Role interna
      const { data, error } = await supabase.functions.invoke('send-message-v2', {
        body: { conversationId, body, type, mediaUrl, mediaKind }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["internal_notes", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      console.error("Send Message Hook Error:", error);
      toast.error(`Erro ao enviar: ${error.message || "Verifique as configurações do canal"}`);
    }
  });
}
