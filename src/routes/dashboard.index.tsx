import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/dashboard-view";

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});
