import { createFileRoute } from '@tanstack/react-router';
import { CampaignManager } from '@/components/campaigns/campaign-manager';
import { AppLayout } from '@/components/layout/app-layout';

export const Route = createFileRoute('/campaigns')({
  component: CampaignsPage,
});

function CampaignsPage() {
  return (
    <AppLayout>
      <CampaignManager />
    </AppLayout>
  );
}
