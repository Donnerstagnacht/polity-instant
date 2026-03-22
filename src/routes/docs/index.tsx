import { createFileRoute } from '@tanstack/react-router';

import { DocsLandingPage } from '@/features/docs/DocsLandingPage';

export const Route = createFileRoute('/docs/')({
  component: DocsOverviewRoute,
});

function DocsOverviewRoute() {
  return <DocsLandingPage />;
}