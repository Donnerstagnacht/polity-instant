'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  BookOpen,
  Scale,
  CheckSquare,
  Calendar,
  UserCheck,
  Briefcase,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function CreateDashboard() {
  const { t } = useTranslation();
  
  const coreItems = [
    {
      href: '/create/group',
      icon: Users,
      title: t('pages.create.group.pageTitle'),
      description: t('pages.create.group.description'),
    },
    {
      href: '/create/event',
      icon: Calendar,
      title: t('pages.create.event.pageTitle'),
      description: t('pages.create.event.description'),
    },
    {
      href: '/create/amendment',
      icon: Scale,
      title: t('pages.create.amendment.pageTitle'),
      description: t('pages.create.amendment.description'),
    },
    {
      href: '/create/blog',
      icon: BookOpen,
      title: t('pages.create.blog.pageTitle'),
      description: t('pages.create.blog.description'),
    },
  ];

  const operationalItems = [
    {
      href: '/create/todo',
      icon: CheckSquare,
      title: t('pages.create.todo.pageTitle'),
      description: t('pages.create.todo.description'),
    },
    {
      href: '/create/statement',
      icon: FileText,
      title: t('pages.create.statement.pageTitle'),
      description: t('pages.create.statement.description'),
    },
  ];

  const eventOptionsItems = [
    {
      href: '/create/agenda-item',
      icon: Calendar,
      title: t('pages.create.agendaItem.pageTitle'),
      description: t('pages.create.agendaItem.description'),
    },
    {
      href: '/create/election-candidate',
      icon: UserCheck,
      title: t('pages.create.electionCandidate.pageTitle'),
      description: t('pages.create.electionCandidate.description'),
    },
    {
      href: '/create/position',
      icon: Briefcase,
      title: t('pages.create.position.pageTitle'),
      description: t('pages.create.position.description'),
    },
  ];

  return (
    <PageWrapper className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{t('pages.create.dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('pages.create.dashboard.subtitle')}</p>
      </div>

<Card>
        <CardHeader>
          <CardTitle>{t('pages.create.dashboard.cardTitle')}</CardTitle>
          <CardDescription>{t('pages.create.dashboard.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Core Set */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('pages.create.dashboard.core')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {coreItems.map(item => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  >
                    <Icon className="h-8 w-8" />
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Visual Separator */}
          <div className="border-t" />

          {/* Operational Set */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('pages.create.dashboard.operational')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {operationalItems.map(item => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  >
                    <Icon className="h-8 w-8" />
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Visual Separator */}
          <div className="border-t" />

          {/* Event Options Set */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('pages.create.dashboard.eventOptions')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {eventOptionsItems.map(item => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  >
                    <Icon className="h-8 w-8" />
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
