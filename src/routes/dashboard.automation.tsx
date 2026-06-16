import { createFileRoute } from "@tanstack/react-router";
import { AutomationList } from "@/components/automation/automation-list";

export const Route = createFileRoute("/dashboard/automation")({
  component: () => (
    <div className="p-6 max-w-7xl mx-auto">
      <AutomationList />
    </div>
  ),
});