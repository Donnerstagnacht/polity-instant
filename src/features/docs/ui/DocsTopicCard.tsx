import { Link } from '@tanstack/react-router';

import { getIconComponent } from '@/features/navigation/nav-items/icon-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { useTranslation } from '@/features/shared/hooks/use-translation';

import { DocsSignalBadge } from './DocsSignalBadge';
import type { DocsTopicDefinition } from '../types/docs.types';

export function DocsTopicCard({ topic }: { topic: DocsTopicDefinition }) {
  const { t } = useTranslation();
  const Icon = getIconComponent(topic.icon);
  const baseKey = `pages.docs.topics.${topic.slug}`;

  return (
    <Link to="/docs/$topic" params={{ topic: topic.slug }} className="group block h-full">
      <Card className="h-full border-border/60 bg-background/90 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <DocsSignalBadge tone={topic.process.steps[0]?.tone ?? 'entry'} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl group-hover:text-primary">{t(`${baseKey}.title`)}</CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground">
              {t(`${baseKey}.summary`)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t(`pages.docs.categories.${topic.category}.title`)}
          </p>
          <p className="text-sm text-foreground/80">{t(`${baseKey}.entry`)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}