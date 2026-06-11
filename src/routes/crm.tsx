import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyCRM = lazy(() => import("@/components/crm/crm-view").then(m => ({ default: m.CRMView })));

export const Route = createFileRoute("/crm" as any)({
  component: CRMPage,
});

function CRMPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyCRM />
    </Suspense>
  );
}
