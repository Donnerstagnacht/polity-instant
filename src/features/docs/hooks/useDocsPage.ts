import { useMemo } from 'react';

import { useTranslation } from '@/features/shared/hooks/use-translation';

import { docsTopicDefinitions, docsTopicMap } from '../logic/docsTopics';
import type { DocsCategory, DocsTopicSlug } from '../types/docs.types';

const categoryOrder: DocsCategory[] = [
  'people',
  'collaboration',
  'governance',
  'coordination',
  'systems',
];

export function useDocsLandingPage() {
  const { t } = useTranslation();

  const featuredTopics = useMemo(
    () => docsTopicDefinitions.filter(topic => topic.featured),
    []
  );

  const categorySections = useMemo(
    () =>
      categoryOrder.map(category => ({
        category,
        title: t(`pages.docs.categories.${category}.title`),
        description: t(`pages.docs.categories.${category}.description`),
        topics: docsTopicDefinitions.filter(topic => topic.category === category),
      })),
    [t]
  );

  return {
    featuredTopics,
    categorySections,
  };
}

export function useDocsTopicPage(slug: DocsTopicSlug) {
  const { t, tArray } = useTranslation();
  const topic = docsTopicMap[slug];
  const baseKey = `pages.docs.topics.${slug}`;

  const relatedTopics = useMemo(
    () => topic.related.map(relatedSlug => docsTopicMap[relatedSlug]),
    [topic]
  );

  return {
    topic,
    baseKey,
    relatedTopics,
    title: t(`${baseKey}.title`),
    navLabel: t(`${baseKey}.navLabel`),
    summary: t(`${baseKey}.summary`),
    audience: t(`${baseKey}.audience`),
    entry: t(`${baseKey}.entry`),
    actions: tArray(`${baseKey}.actions`),
    concepts: tArray(`${baseKey}.concepts`),
    watchFor: tArray(`${baseKey}.watchFor`),
    states: tArray(`${baseKey}.states`),
  };
}