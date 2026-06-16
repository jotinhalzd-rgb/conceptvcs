import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyInbox = lazy(() => import("@/components/inbox/inbox-view").then(m => ({ default: m.InboxView })));

type InboxSearch = { conversation?: string };

export const Route = createFileRoute("/inbox")({
  validateSearch: (search: Record<string, unknown>): InboxSearch => ({
    conversation: typeof search.conversation === "string" ? search.conversation : undefined,
  }),
  component: InboxPage,
});

function InboxPage() {
  const { conversation } = Route.useSearch();
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LazyInbox initialConversationId={conversation} />
    </Suspense>
  );
}
