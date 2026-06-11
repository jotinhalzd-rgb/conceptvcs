import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyInbox = lazy(() => import("@/components/inbox/inbox-view").then(m => ({ default: m.InboxView })));

export const Route = createFileRoute("/inbox")({
  component: InboxPage,
});

function InboxPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyInbox />
    </Suspense>
  );
}
