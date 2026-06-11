import { createFileRoute } from '@tanstack/react-router';
import { AIStudioView } from '@/components/dashboard/ai-studio/dashboard/ai-studio-view';

export const Route = createFileRoute('/dashboard/ai-studio')({
  component: AIStudioView,
});
