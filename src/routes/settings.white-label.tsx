import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyView = lazy(() => import("@/components/settings/white-label-view").then((m) => ({ default: m.WhiteLabelView })));

export const Route = createFileRoute("/settings/white-label")({
  component: Page,
});

function Page() {
  return (
    <Suspense fallback={<div className="h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>}>
      <LazyView />
    </Suspense>
  );
}