'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguageStore } from '@/global-state/language.store';
import { solutionsPageTranslations } from '@/i18n/locales/en/pages/solutions';
import { solutionsPageTranslations as solutionsPageTranslationsDe } from '@/i18n/locales/de/pages/solutions';
import {
  Users,
  Building2,
  Landmark,
  Heart,
  Building,
  Newspaper,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function SolutionsPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [selectedSolution, setSelectedSolution] = useState('humans');

  const translations = language === 'de' ? solutionsPageTranslationsDe : solutionsPageTranslations;

  const iconMap: Record<string, typeof Users> = {
    humans: Users,
    'political-parties': Building2,
    government: Landmark,
    ngos: Heart,
    corporations: Building,
    media: Newspaper,
  };

  const solutionKeys = ['humans', 'parties', 'government', 'ngos', 'corporations', 'media'] as const;

  const solutions = solutionKeys.map((key) => {
    const solution = translations.solutions[key];
    return {
      id: solution.id,
      icon: iconMap[solution.id] || Users,
      title: solution.title,
      tagline: solution.tagline,
      description: solution.description,
      features: [...solution.features],
      useCases: [...solution.useCases],
    };
  });

  const currentSolution = solutions.find(s => s.id === selectedSolution) || solutions[0];
  const Icon = currentSolution.icon;

  return (
    <PageWrapper className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.solutions.title')}</h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          {t('pages.solutions.subtitle')}
        </p>
      </div>

      {/* Solution Selector */}
      <div className="mx-auto mb-12 max-w-4xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => {
            const SolutionIcon = solution.icon;
            const isSelected = selectedSolution === solution.id;
            return (
              <button key={solution.id}
                onClick={() => setSelectedSolution(solution.id)}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'bg-background hover:border-primary hover:shadow-md'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                  }`}
                >
                  <SolutionIcon className={`h-6 w-6 ${isSelected ? '' : 'text-primary'}`} />
                </div>
                <span className="font-medium">{solution.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Solution Card */}
      <div className="mx-auto mb-16 max-w-4xl">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <CardTitle className="text-3xl">{currentSolution.title}</CardTitle>
                <p className="text-lg font-medium text-primary">{currentSolution.tagline}</p>
                <CardDescription className="text-base leading-relaxed">
                  {currentSolution.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Features */}
            {currentSolution.features && currentSolution.features.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('pages.solutions.sections.keyFeatures')}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {currentSolution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Use Cases */}
            {currentSolution.useCases && currentSolution.useCases.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('pages.solutions.sections.useCases')}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {currentSolution.useCases.map((useCase, useCaseIndex) => (
                    <li key={useCaseIndex} className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{t('pages.solutions.cta.title')}</h2>
        <p className="mb-6 text-muted-foreground">
          {t('pages.solutions.cta.subtitle')}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth">
            <Button size="lg">
              {t('pages.solutions.cta.getStarted')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/features">
            <Button size="lg" variant="outline">
              {t('pages.solutions.cta.exploreFeatures')}
            </Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
