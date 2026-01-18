'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useTranslation } from '@/hooks/use-translation';
import {
  Euro,
  Palette,
  Code,
  ArrowRight,
  Heart,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function SupportPage() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const supportAreas = [
    {
      icon: Euro,
      title: t('pages.support.areas.financial.title'),
      description: t('pages.support.areas.financial.description'),
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-500/10',
      content: {
        intro: t('pages.support.areas.financial.intro'),
        details: t('pages.support.areas.financial.details') as unknown as string[],
        cta: t('pages.support.areas.financial.cta'),
        link: '/pricing',
        external: false,
      },
    },
    {
      icon: Palette,
      title: t('pages.support.areas.design.title'),
      description: t('pages.support.areas.design.description'),
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10',
      content: {
        intro: t('pages.support.areas.design.intro'),
        details: t('pages.support.areas.design.details') as unknown as string[],
        cta: t('pages.support.areas.design.cta'),
        link: 'https://www.figma.com/proto/cAT8Aonu8P7ojwgnKcVlkz/Polity?node-id=51098-4683&starting-point-node-id=51098%3A4683',
        external: true,
      },
    },
    {
      icon: Code,
      title: t('pages.support.areas.development.title'),
      description: t('pages.support.areas.development.description'),
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10',
      content: {
        intro: t('pages.support.areas.development.intro'),
        details: t('pages.support.areas.development.details') as unknown as string[],
        cta: t('pages.support.areas.development.cta'),
        link: 'https://github.com/Donnerstagnacht/polity-instant',
        external: true,
      },
    },
  ];

  return (
    <PageWrapper className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.support.header.title')}</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          {t('pages.support.header.subtitle')}
        </p>
      </div>

      {/* Support Areas */}
      <div className="mb-16">
        {/* Desktop: Grid Layout */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {supportAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <Card
                key={index}
                className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`mb-4 flex h-16 w-16 items-center justify-center rounded-lg ${area.iconBg}`}
                    >
                      <Icon className={`h-8 w-8 ${area.iconColor}`} />
                    </div>
                    <CardTitle className="text-2xl">{area.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">{area.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {area.content.intro}
                  </p>

                  <div className="flex-1">
                    <h4 className="mb-3 text-sm font-semibold">{t('pages.support.howCanHelp')}</h4>
                    <ul className="space-y-2">
                      {area.content.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${area.iconBg}`}
                          >
                            <div className={`h-1.5 w-1.5 rounded-full ${area.iconColor}`} />
                          </div>
                          <span className="text-sm leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    {area.content.external ? (
                      <a
                        href={area.content.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button size="lg" className="w-full">
                          {area.content.cta}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <Link href={area.content.link} className="block">
                        <Button size="lg" className="w-full">
                          {area.content.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mobile/Tablet: Carousel */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Carousel Content */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {supportAreas.map((area, index) => {
                  const Icon = area.icon;
                  return (
                    <div key={index} className="w-full flex-shrink-0 px-2">
                      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                        <CardHeader>
                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-lg ${area.iconBg}`}
                            >
                              <Icon className={`h-8 w-8 ${area.iconColor}`} />
                            </div>
                            <CardTitle className="text-2xl">{area.title}</CardTitle>
                            <CardDescription className="mt-2 text-base">
                              {area.description}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {area.content.intro}
                          </p>

                          <div>
                            <h4 className="mb-3 text-sm font-semibold">{t('pages.support.howCanHelp')}</h4>
                            <ul className="space-y-2">
                              {area.content.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start gap-3">
                                  <div
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${area.iconBg}`}
                                  >
                                    <div className={`h-1.5 w-1.5 rounded-full ${area.iconColor}`} />
                                  </div>
                                  <span className="text-sm leading-relaxed">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4">
                            {area.content.external ? (
                              <a
                                href={area.content.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <Button size="lg" className="w-full">
                                  {area.content.cta}
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                              </a>
                            ) : (
                              <Link href={area.content.link} className="block">
                                <Button size="lg" className="w-full">
                                  {area.content.cta}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-opacity disabled:opacity-30"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(supportAreas.length - 1, prev + 1))}
              disabled={currentSlide === supportAreas.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-opacity disabled:opacity-30"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {supportAreas.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  currentSlide === index ? 'w-8 bg-primary' : 'bg-muted-foreground/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Community Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">{t('pages.support.community.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('pages.support.community.description')}
          </p>
          <p className="rounded-lg border bg-background/50 p-4 text-sm">
            <strong>{t('pages.support.community.openSource.title')}</strong> {t('pages.support.community.openSource.text')}
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
