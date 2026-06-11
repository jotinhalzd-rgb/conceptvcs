import { createFileRoute } from '@tanstack/react-router';
import { AIStudioView } from '@/components/ai-studio/ai-studio-view';

export const Route = createFileRoute('/ai-studio')({
  component: AIStudioView,
});
