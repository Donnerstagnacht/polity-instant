import { NotFound } from '@/features/shared/ui/ui/not-found';

import { isDocsTopicSlug } from './logic/docsTopics';
import { DocsTopicView } from './ui/DocsTopicView';

export function DocsTopicPage({ topic }: { topic: string }) {
  if (!isDocsTopicSlug(topic)) {
    return <NotFound />;
  }

  return <DocsTopicView slug={topic} />;
}