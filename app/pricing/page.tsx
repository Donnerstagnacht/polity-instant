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

export default function PricingPage() {
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
      name: 'Free',
      price: '€0',
      description: 'Full access to all features - democratic tools should be free for everyone',
      features: [
        'Full user page',
        'Create unlimited groups',
        'Join public groups',
        'Organize events',
        'Participate in events',
        'Propose amendments',
        'View public amendments',
        'Advanced search',
        'Tasks & calendar',
        'Messages & notifications',
        'Community support',
      ],
      cta: 'Get Started',
      highlighted: false,
      helpText: 'All features are free. Paid tiers help us keep the platform running and growing.',
    },
    {
      name: 'Running Costs',
      price: '€2',
      period: '/month',
      description: 'Help us cover server costs, hosting, and infrastructure',
      features: [
        'Everything in Free',
        'Priority support',
        'No ads (when we add them)',
        'Custom user themes',
        'Supporter badge',
        'Our eternal gratitude ❤️',
      ],
      cta: 'Cover Running Costs',
      highlighted: false,
      helpText: 'Help us keep the servers running and the platform accessible to everyone.',
    },
    {
      name: 'Development',
      price: '€10',
      period: '/month',
      description: 'Fund new features, improvements, and platform growth',
      features: [
        'Everything in Running Costs',
        'Early access to new features',
        'Advanced analytics',
        'Custom group branding',
        'API access',
        'Dedicated support',
        'Vote on feature roadmap',
        'Contributor badge',
      ],
      cta: 'Support Development',
      highlighted: true,
      helpText: 'Help us build new features and improve the platform for everyone.',
    },
    {
      name: 'Your Choice',
      price: 'custom',
      period: '/month',
      description: 'Choose your own contribution - pay what feels right for you',
      features: [
        'Everything in Development',
        'Badge & recognition',
        'Direct line to founders',
        'Exclusive community access',
        'Monthly development updates',
        'Recognition on our website',
        'Invitation to quarterly strategy calls',
        'Free swag & merch (for €25+)',
      ],
      cta: 'Choose Your Amount',
      highlighted: false,
      helpText: 'Pick an amount that works for you. Every contribution helps us grow!',
      isCustom: true,
    },
  ];

  return (
    <PageWrapper className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Transparent pricing that grows with your needs. No hidden fees.
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
                    <Label className="text-sm font-medium">Your monthly contribution</Label>
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
            <CardTitle>Our Transparent Pricing Philosophy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Polity is built on transparency and community support. We believe democratic tools
              should be accessible to everyone, so{' '}
              <strong className="text-foreground">all features are free</strong>. Our paid tiers
              simply help us keep the platform running and growing:
            </p>
            <ul className="space-y-3 pl-6">
              <li>
                <strong className="text-foreground">Free tier:</strong> Full access to everything -
                no restrictions, no paywalls. Democracy shouldn't have a price tag.
              </li>
              <li>
                <strong className="text-foreground">Running Costs (€2/month):</strong> Helps us
                cover server infrastructure, database hosting, bandwidth, and basic operational
                expenses. This keeps the platform fast and reliable for everyone.
              </li>
              <li>
                <strong className="text-foreground">Development (€10/month):</strong> Funds new
                features, platform improvements, security updates, and dedicated support. This helps
                us develop the product further and faster.
              </li>
              <li>
                <strong className="text-foreground">Your Choice (custom amount):</strong> Choose
                your own monthly contribution - whether it's €1, €5, €15, or any amount that works
                for you. Every contribution, big or small, helps us achieve our mission. You get
                access to exclusive features and help us grow at your own pace.
              </li>
            </ul>
            <p className="rounded-lg border bg-accent/50 p-4">
              <strong className="text-foreground">Pay what you can:</strong> We rely on those who
              can afford to contribute to subsidize free access for everyone else. It's a solidarity
              model that makes democratic participation truly universal.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise & Custom Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Need custom features, dedicated hosting, or on-premise deployment? We offer tailored
              solutions for larger organizations.
            </p>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
