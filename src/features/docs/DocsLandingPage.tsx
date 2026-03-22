import { Link } from '@tanstack/react-router';

import { Button } from '@/features/shared/ui/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { useTranslation } from '@/features/shared/hooks/use-translation';

import { useDocsLandingPage } from './hooks/useDocsPage';
import { DocsSignalBadge } from './ui/DocsSignalBadge';
import { DocsTopicCard } from './ui/DocsTopicCard';

export function DocsLandingPage() {
  const { t } = useTranslation();
  const { featuredTopics, categorySections } = useDocsLandingPage();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_26%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-10 lg:px-6 lg:py-14">
        <section className="border-border/60 bg-background/90 overflow-hidden rounded-[2rem] border p-6 shadow-sm lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="space-y-5">
              <DocsSignalBadge tone="entry" />
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {t('pages.docs.overview.title')}
                </h1>
                <p className="text-muted-foreground max-w-3xl text-lg leading-8">
                  {t('pages.docs.overview.subtitle')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/docs/$topic" params={{ topic: 'users' }}>
                    {t('pages.docs.overview.primaryCta')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/docs/$topic" params={{ topic: 'roles-and-rights' }}>
                    {t('pages.docs.overview.secondaryCta')}
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="border-border/60 bg-card/85">
              <CardHeader>
                <CardTitle>{t('pages.docs.overview.pathwaysTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-3 text-sm leading-6">
                  {['start', 'coordinate', 'decide', 'follow-through'].map(item => (
                    <li key={item} className="flex gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>{t(`pages.docs.overview.pathways.${item}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('pages.docs.overview.featuredTitle')}
            </h2>
            <p className="text-muted-foreground">{t('pages.docs.overview.featuredDescription')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredTopics.map(topic => (
              <DocsTopicCard key={topic.slug} topic={topic} />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('pages.docs.overview.libraryTitle')}
            </h2>
            <p className="text-muted-foreground">{t('pages.docs.overview.libraryDescription')}</p>
          </div>

          <div className="space-y-8">
            {categorySections.map(section => (
              <div key={section.category} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
                  <p className="text-muted-foreground text-sm leading-6">{section.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.topics.map(topic => (
                    <DocsTopicCard key={`${section.category}-${topic.slug}`} topic={topic} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
