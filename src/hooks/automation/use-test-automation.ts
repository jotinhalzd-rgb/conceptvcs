import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { testAutomation, type TestAutomationResult } from "@/lib/automation/test-automation.functions";
import { toast } from "sonner";

export function useTestAutomation() {
  const run = useServerFn(testAutomation);
  return useMutation<TestAutomationResult, Error, { workflow_id: string; payload: Record<string, unknown> }>({
    mutationFn: (vars) => run({ data: vars }),
    onError: (e) => toast.error("Erro no teste: " + e.message),
  });
}