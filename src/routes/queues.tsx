import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { QueuesManagement } from "@/components/queues/queues-management";

export const Route = createFileRoute("/queues")({
  component: QueuesPage,
});

function QueuesPage() {
  return (
    <Suspense fallback={<div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />}>
      <QueuesManagement />
    </Suspense>
  );
}
