'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Check, ArrowRight, Euro } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function PricingPage() {
  const { t } = useTranslation();
  const [customAmount, setCustomAmount] = useState(['', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAmountChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newAmount = [...customAmount];
    newAmount[index] = value;
    setCustomAmount(newAmount);

    // Auto-focus next input
    if (value && index < 2 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !customAmount[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 2) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedText.length <= 3) {
      const newAmount = pastedText.padEnd(3, '').split('').slice(0, 3);
      setCustomAmount(newAmount);
    }
  };

  const getCustomAmountValue = () => {
    const value = customAmount.join('').replace(/^0+/, '') || '0';
    return value;
  };

  const tiers = [
    {
      name: t('pages.pricing.tiers.free.name'),
      price: t('pages.pricing.tiers.free.price'),
      description: t('pages.pricing.tiers.free.description'),
      features: t('pages.pricing.tiers.free.features'),
      cta: t('pages.pricing.tiers.free.cta'),
      highlighted: false,
      helpText: t('pages.pricing.tiers.free.helpText'),
    },
    {
      name: t('pages.pricing.tiers.runningCosts.name'),
      price: t('pages.pricing.tiers.runningCosts.price'),
      period: t('pages.pricing.tiers.runningCosts.period'),
      description: t('pages.pricing.tiers.runningCosts.description'),
      features: t('pages.pricing.tiers.runningCosts.features'),
      cta: t('pages.pricing.tiers.runningCosts.cta'),
      highlighted: false,
      helpText: t('pages.pricing.tiers.runningCosts.helpText'),
    },
    {
      name: t('pages.pricing.tiers.development.name'),
      price: t('pages.pricing.tiers.development.price'),
      period: t('pages.pricing.tiers.development.period'),
      description: t('pages.pricing.tiers.development.description'),
      features: t('pages.pricing.tiers.development.features'),
      cta: t('pages.pricing.tiers.development.cta'),
      highlighted: true,
      helpText: t('pages.pricing.tiers.development.helpText'),
    },
    {
      name: t('pages.pricing.tiers.custom.name'),
      price: 'custom',
      period: t('pages.pricing.tiers.custom.period'),
      description: t('pages.pricing.tiers.custom.description'),
      features: t('pages.pricing.tiers.custom.features'),
      cta: t('pages.pricing.tiers.custom.cta'),
      highlighted: false,
      helpText: t('pages.pricing.tiers.custom.helpText'),
      isCustom: true,
    },
  ];

  return (
    <PageWrapper className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.pricing.title')}</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          {t('pages.pricing.subtitle')}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier, index) => (
          <Card
            key={index}
            className={`flex flex-col transition-shadow ${
              tier.highlighted
                ? 'border-primary shadow-lg ring-2 ring-primary ring-offset-2'
                : 'hover:shadow-lg'
            }`}
          >
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription className="text-base">{tier.description}</CardDescription>
              <div className="mt-4">
                {tier.isCustom ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{t('pages.pricing.customContribution.label')}</Label>
                    <div className="flex items-center justify-center gap-2">
                      <Euro className="h-6 w-6 text-muted-foreground" />
                      {customAmount.map((digit, idx) => (
                        <Input
                          key={idx}
                          ref={el => {
                            inputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className="h-12 w-12 text-center text-lg font-semibold"
                          value={digit}
                          onChange={e => handleAmountChange(idx, e.target.value)}
                          onKeyDown={e => handleKeyDown(idx, e)}
                          onPaste={idx === 0 ? handlePaste : undefined}
                          placeholder="0"
                        />
                      ))}
                    </div>
                    {getCustomAmountValue() !== '0' && (
                      <p className="text-center text-sm text-muted-foreground">
                        €{getCustomAmountValue()}/month
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </>
                )}
              </div>
              {tier.helpText && (
                <p className="mt-3 text-xs italic text-muted-foreground">{tier.helpText}</p>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth" className="w-full">
                <Button
                  className="w-full"
                  variant={tier.highlighted ? 'default' : 'outline'}
                  size="lg"
                  disabled={tier.isCustom && getCustomAmountValue() === '0'}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.pricing.philosophy.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {t('pages.pricing.philosophy.intro')}{' '}
              <strong className="text-foreground">{t('pages.pricing.philosophy.allFeaturesFreeBold')}</strong>
              {t('pages.pricing.philosophy.afterBold')}
            </p>
            <ul className="space-y-3 pl-6">
              <li>
                <strong className="text-foreground">{t('pages.pricing.philosophy.tiers.free.label')}</strong>{' '}
                {t('pages.pricing.philosophy.tiers.free.description')}
              </li>
              <li>
                <strong className="text-foreground">{t('pages.pricing.philosophy.tiers.runningCosts.label')}</strong>{' '}
                {t('pages.pricing.philosophy.tiers.runningCosts.description')}
              </li>
              <li>
                <strong className="text-foreground">{t('pages.pricing.philosophy.tiers.development.label')}</strong>{' '}
                {t('pages.pricing.philosophy.tiers.development.description')}
              </li>
              <li>
                <strong className="text-foreground">{t('pages.pricing.philosophy.tiers.custom.label')}</strong>{' '}
                {t('pages.pricing.philosophy.tiers.custom.description')}
              </li>
            </ul>
            <p className="rounded-lg border bg-accent/50 p-4">
              <strong className="text-foreground">{t('pages.pricing.philosophy.solidarity.label')}</strong>{' '}
              {t('pages.pricing.philosophy.solidarity.description')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pages.pricing.enterprise.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              {t('pages.pricing.enterprise.description')}
            </p>
            <Button variant="outline">{t('pages.pricing.enterprise.cta')}</Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
