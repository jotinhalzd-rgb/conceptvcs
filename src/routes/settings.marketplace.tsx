import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyMarketplace = lazy(() => import("@/components/marketplace/marketplace-view").then(m => ({ default: m.MarketplaceView })));

export const Route = createFileRoute("/settings/marketplace")({
  component: MarketplacePage,
});

function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyMarketplace />
    </Suspense>
  );
}
