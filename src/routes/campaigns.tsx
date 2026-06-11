import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from "react";

const LazyCampaigns = lazy(() => import("@/components/campaigns/campaigns-view").then(m => ({ default: m.CampaignsView })));

export const Route = createFileRoute('/campaigns')({
  component: CampaignsPage,
});

function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyCampaigns />
    </Suspense>
  );
}

