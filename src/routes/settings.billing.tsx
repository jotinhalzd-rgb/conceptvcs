import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyBilling = lazy(() => import("@/components/billing/billing-view").then(m => ({ default: m.BillingView })));

export const Route = createFileRoute("/settings/billing")({
  component: BillingPage,
});

function BillingPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyBilling />
    </Suspense>
  );
}
