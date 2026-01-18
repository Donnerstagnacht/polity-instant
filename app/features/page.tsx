'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useTranslation } from '@/hooks/use-translation';
import {
  Users,
  UsersRound,
  Calendar,
  FileText,
  Search,
  CheckSquare,
  MessageSquare,
  Bell,
  ListTodo,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  details: {
    overview: string;
    capabilities: string[];
    benefits: string[];
  };
}

export default function FeaturesPage() {
  const { t } = useTranslation();
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const features: Feature[] = [
    {
      icon: Users,
      title: t('pages.features.features.user.title'),
      description: t('pages.features.features.user.description'),
      details: {
        overview: t('pages.features.features.user.overview'),
        capabilities: t('pages.features.features.user.capabilities') as unknown as string[],
        benefits: t('pages.features.features.user.benefits') as unknown as string[],
      },
    },
    {
      icon: UsersRound,
      title: t('pages.features.features.groups.title'),
      description: t('pages.features.features.groups.description'),
      details: {
        overview: t('pages.features.features.groups.overview'),
        capabilities: t('pages.features.features.groups.capabilities') as unknown as string[],
        benefits: t('pages.features.features.groups.benefits') as unknown as string[],
      },
    },
    {
      icon: Calendar,
      title: t('pages.features.features.events.title'),
      description: t('pages.features.features.events.description'),
      details: {
        overview: t('pages.features.features.events.overview'),
        capabilities: t('pages.features.features.events.capabilities') as unknown as string[],
        benefits: t('pages.features.features.events.benefits') as unknown as string[],
      },
    },
    {
      icon: FileText,
      title: t('pages.features.features.amendments.title'),
      description: t('pages.features.features.amendments.description'),
      details: {
        overview: t('pages.features.features.amendments.overview'),
        capabilities: t('pages.features.features.amendments.capabilities') as unknown as string[],
        benefits: t('pages.features.features.amendments.benefits') as unknown as string[],
      },
    },
    {
      icon: ListTodo,
      title: t('pages.features.features.agendas.title'),
      description: t('pages.features.features.agendas.description'),
      details: {
        overview: t('pages.features.features.agendas.overview'),
        capabilities: t('pages.features.features.agendas.capabilities') as unknown as string[],
        benefits: t('pages.features.features.agendas.benefits') as unknown as string[],
      },
    },
    {
      icon: Search,
      title: t('pages.features.features.search.title'),
      description: t('pages.features.features.search.description'),
      details: {
        overview: t('pages.features.features.search.overview'),
        capabilities: t('pages.features.features.search.capabilities') as unknown as string[],
        benefits: t('pages.features.features.search.benefits') as unknown as string[],
      },
    },
    {
      icon: Calendar,
      title: t('pages.features.features.calendar.title'),
      description: t('pages.features.features.calendar.description'),
      details: {
        overview: t('pages.features.features.calendar.overview'),
        capabilities: t('pages.features.features.calendar.capabilities') as unknown as string[],
        benefits: t('pages.features.features.calendar.benefits') as unknown as string[],
      },
    },
    {
      icon: CheckSquare,
      title: t('pages.features.features.tasks.title'),
      description: t('pages.features.features.tasks.description'),
      details: {
        overview: t('pages.features.features.tasks.overview'),
        capabilities: t('pages.features.features.tasks.capabilities') as unknown as string[],
        benefits: t('pages.features.features.tasks.benefits') as unknown as string[],
      },
    },
    {
      icon: MessageSquare,
      title: t('pages.features.features.messages.title'),
      description: t('pages.features.features.messages.description'),
      details: {
        overview: t('pages.features.features.messages.overview'),
        capabilities: t('pages.features.features.messages.capabilities') as unknown as string[],
        benefits: t('pages.features.features.messages.benefits') as unknown as string[],
      },
    },
    {
      icon: Bell,
      title: t('pages.features.features.notifications.title'),
      description: t('pages.features.features.notifications.description'),
      details: {
        overview: t('pages.features.features.notifications.overview'),
        capabilities: t('pages.features.features.notifications.capabilities') as unknown as string[],
        benefits: t('pages.features.features.notifications.benefits') as unknown as string[],
      },
    },
  ];

  const toggleFeature = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  return (
    <PageWrapper className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.features.header.title')}</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          {t('pages.features.header.subtitle')}
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isExpanded = expandedFeature === index;
          return (
            <div
              key={index}
              className={`cursor-pointer transition-all ${isExpanded ? 'col-span-full' : ''}`}
              onClick={() => toggleFeature(index)}
            >
              <Card
                className={`h-full ${
                  isExpanded ? 'shadow-xl ring-2 ring-primary ring-offset-2' : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 space-y-6 border-t pt-6">
                      <div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {feature.details.overview}
                        </p>
                      </div>

                      <div>
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>
                          {t('pages.features.sections.capabilities')}
                        </h4>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {feature.details.capabilities.map((capability, capIndex) => (
                            <li
                              key={capIndex}
                              className="group flex items-start gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-border hover:bg-accent/50"
                            >
                              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              </div>
                              <span className="text-sm leading-relaxed">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/10">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          {t('pages.features.sections.benefits')}
                        </h4>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {feature.details.benefits.map((benefit, benIndex) => (
                            <li
                              key={benIndex}
                              className="group flex items-start gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-border hover:bg-accent/50"
                            >
                              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 group-hover:bg-amber-500/20">
                                <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              </div>
                              <span className="text-sm leading-relaxed text-muted-foreground">
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{t('pages.features.cta.title')}</h2>
        <p className="mb-6 text-muted-foreground">
          {t('pages.features.cta.subtitle')}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth">
            <Button size="lg">
              {t('pages.features.cta.getStarted')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              {t('pages.features.cta.viewPricing')}
            </Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
