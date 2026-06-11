import { createFileRoute } from '@tanstack/react-router';
import { BusinessHubView } from '@/components/hub/business-hub-view';

export const Route = createFileRoute('/dashboard/hub')({
  component: BusinessHubView,
});
