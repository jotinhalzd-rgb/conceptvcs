import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { testInboundEndpoint } from "@/lib/developer/webhook-test.functions";
import { rotateWebhookSecret } from "@/lib/developer/webhook-secret.functions";

export function useTestInbound() {
  const fn = useServerFn(testInboundEndpoint);
  return useMutation({
    mutationFn: (data: { channelId: string; payload?: Record<string, any> }) => fn({ data }),
  });
}

export function useRotateWebhookSecret() {
  const fn = useServerFn(rotateWebhookSecret);
  return useMutation({
    mutationFn: (data: { channelId: string }) => fn({ data }),
  });
}