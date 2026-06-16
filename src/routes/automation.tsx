import { createFileRoute } from "@tanstack/react-router";
import { AutomationList } from "@/components/automation/automation-list";
import { AppLayout } from "@/components/layout/app-layout";

export const Route = createFileRoute("/automation")({
  component: () => (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <AutomationList />
      </div>
    </AppLayout>
  ),
});