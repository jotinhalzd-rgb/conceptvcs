import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createApiKey, revokeApiKey, rotateApiKey } from "@/lib/developer/api-keys.functions";

export function useCreateApiKey() {
  const qc = useQueryClient();
  const fn = useServerFn(createApiKey);
  return useMutation({
    mutationFn: (data: { name: string; scopes?: string[] }) => fn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  const fn = useServerFn(revokeApiKey);
  return useMutation({
    mutationFn: (data: { id: string }) => fn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

export function useRotateApiKey() {
  const qc = useQueryClient();
  const fn = useServerFn(rotateApiKey);
  return useMutation({
    mutationFn: (data: { id: string }) => fn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}