import type { IconName } from '@/features/navigation/nav-items/icon-map.tsx';

export type DocsTopicSlug =
  | 'users'
  | 'groups'
  | 'events'
  | 'amendments'
  | 'blogs'
  | 'elections'
  | 'votes'
  | 'decision-terminal'
  | 'search'
  | 'messages'
  | 'notifications'
  | 'calendar'
  | 'todos'
  | 'roles-and-rights'
  | 'networks-and-forwarding';

export type DocsCategory =
  | 'people'
  | 'collaboration'
  | 'governance'
  | 'coordination'
  | 'systems';

export type DocsSignalTone =
  | 'entry'
  | 'action'
  | 'collaboration'
  | 'attention'
  | 'decision'
  | 'result';

export interface DocsProcessStep {
  id: string;
  tone: DocsSignalTone;
  lane?: string;
}

export interface DocsProcessDefinition {
  kind: 'timeline' | 'lanes';
  steps: DocsProcessStep[];
  lanes?: string[];
}

export interface DocsTopicDefinition {
  slug: DocsTopicSlug;
  icon: IconName;
  category: DocsCategory;
  featured: boolean;
  related: DocsTopicSlug[];
  process: DocsProcessDefinition;
}