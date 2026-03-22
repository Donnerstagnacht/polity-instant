import { createFileRoute } from '@tanstack/react-router';

import { DocsTopicPage } from '@/features/docs/DocsTopicPage';

export const Route = createFileRoute('/docs/$topic')({
  component: DocsTopicRoute,
});

function DocsTopicRoute() {
  const { topic } = Route.useParams();

  return <DocsTopicPage topic={topic} />;
}