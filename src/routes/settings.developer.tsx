import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyDeveloperCenter = lazy(() => import("@/components/marketplace/developer-center").then(m => ({ default: m.DeveloperCenter })));

export const Route = createFileRoute("/settings/developer" as any)({
  component: DeveloperCenterPage,
});

function DeveloperCenterPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyDeveloperCenter />
    </Suspense>
  );
}
