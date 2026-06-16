import { createFileRoute } from "@tanstack/react-router";
import { NotificationsCenter } from "@/components/notifications/notifications-center";

export const Route = createFileRoute("/dashboard/notifications")({
  component: () => (
    <div className="p-6 max-w-5xl mx-auto">
      <NotificationsCenter />
    </div>
  ),
});