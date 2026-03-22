import { Link } from '@tanstack/react-router';

import { getIconComponent } from '@/features/navigation/nav-items/icon-map';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/shared/ui/ui/accordion';
import { Button } from '@/features/shared/ui/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Separator } from '@/features/shared/ui/ui/separator';

import { useDocsTopicPage } from '../hooks/useDocsPage';
import type { DocsTopicSlug } from '../types/docs.types';
import { DocsSignalBadge } from './DocsSignalBadge';
import { DocsTopicCard } from './DocsTopicCard';
import { ProcessDiagram } from './ProcessDiagram';

export function DocsTopicView({ slug }: { slug: DocsTopicSlug }) {
  const { t } = useTranslation();
  const { topic, baseKey, title, summary, audience, entry, actions, concepts, watchFor, states, relatedTopics } =
    useDocsTopicPage(slug);
  const Icon = getIconComponent(topic.icon);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.02),transparent_40%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-6 lg:py-14">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-border/60 bg-background/90 p-6 shadow-sm lg:p-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-foreground">
              {t('pages.docs.overview.navLabel')}
            </Link>
            <span>/</span>
            <span>{title}</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <DocsSignalBadge tone={topic.process.steps[0]?.tone ?? 'entry'} />
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{summary}</p>
              </div>
            </div>
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base">{t('pages.docs.labels.quickView')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-xs">{t('pages.docs.labels.audience')}</p>
                  <p className="mt-1 text-foreground/80">{audience}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-xs">{t('pages.docs.labels.entry')}</p>
                  <p className="mt-1 text-foreground/80">{entry}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <ProcessDiagram baseKey={baseKey} process={topic.process} />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60 bg-card/80">
                <CardHeader>
                  <CardTitle>{t('pages.docs.labels.actions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                    {actions.map(action => (
                      <li key={action} className="flex gap-3">
                        <span className="mt-1 text-primary">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card/80">
                <CardHeader>
                  <CardTitle>{t('pages.docs.labels.concepts')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                    {concepts.map(concept => (
                      <li key={concept} className="flex gap-3">
                        <span className="mt-1 text-primary">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="rounded-3xl border border-border/60 bg-card/80 px-6">
              <AccordionItem value="watch-for">
                <AccordionTrigger className="text-base">{t('pages.docs.labels.watchFor')}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                    {watchFor.map(item => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="states">
                <AccordionTrigger className="text-base">{t('pages.docs.labels.states')}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {states.map(state => (
                      <div key={state} className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                        {state}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle>{t('pages.docs.labels.relatedTopics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedTopics.map(relatedTopic => (
                  <Button key={relatedTopic.slug} asChild variant="outline" className="w-full justify-start">
                    <Link to="/docs/$topic" params={{ topic: relatedTopic.slug }}>
                      {t(`pages.docs.topics.${relatedTopic.slug}.navLabel`)}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-primary/[0.05]">
              <CardHeader>
                <CardTitle>{t('pages.docs.labels.userPerspective')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{t(`${baseKey}.perspective`)}</p>
                <Separator />
                <p>{t(`${baseKey}.outcome`)}</p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">{t('pages.docs.labels.exploreMore')}</h2>
            <p className="text-muted-foreground">{t('pages.docs.overview.libraryDescription')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedTopics.map(relatedTopic => (
              <DocsTopicCard key={`card-${relatedTopic.slug}`} topic={relatedTopic} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}