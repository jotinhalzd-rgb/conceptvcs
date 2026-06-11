import { createFileRoute } from "@tanstack/react-router";
import { QueuesView } from "@/pages/queues";

export const Route = createFileRoute("/queues")({
  component: QueuesPage,
});

function QueuesPage() {
  return <QueuesView />;
}
