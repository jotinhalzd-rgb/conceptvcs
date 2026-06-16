import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UploadKind = "image" | "audio" | "document";

function detectKind(file: File): UploadKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
}

export function useAttachmentUpload() {
  return useMutation({
    mutationFn: async ({
      file,
      conversationId,
    }: {
      file: File | Blob;
      conversationId: string;
    }): Promise<{ url: string; kind: UploadKind; name: string }> => {
      const f = file as File;
      const name = f.name || `audio-${Date.now()}.webm`;
      const kind = (f as File).type ? detectKind(f as File) : "audio";
      const ext = name.includes(".") ? name.split(".").pop() : "bin";
      const path = `${conversationId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("message-attachments")
        .upload(path, file, {
          contentType: (f as File).type || "application/octet-stream",
          upsert: false,
        });
      if (error) throw error;

      const { data: signed, error: sigErr } = await supabase.storage
        .from("message-attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      if (sigErr) throw sigErr;

      return { url: signed.signedUrl, kind, name };
    },
    onError: (e: any) => toast.error(`Falha no upload: ${e.message}`),
  });
}