import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyChannels = lazy(() => import("@/components/channels/channels-view").then(m => ({ default: m.ChannelsView })));

export const Route = createFileRoute("/admin/channels")({
  component: ChannelsPage,
});

function ChannelsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyChannels />
    </Suspense>
  );
}
