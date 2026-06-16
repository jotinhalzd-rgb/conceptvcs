import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { QueuesManagement } from "@/components/queues/queues-management";

export function QueuesView() {
  return (
    <GlobalErrorBoundary name="QueuesView">
      <QueuesManagement />
    </GlobalErrorBoundary>
  );
}
