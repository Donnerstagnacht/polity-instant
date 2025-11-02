'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Free',
      price: '€0',
      description: 'Full access to all features - democratic tools should be free for everyone',
      features: [
        'Full user profile',
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
        'Custom profile themes',
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
      name: 'Champion',
      price: '€25',
      period: '/month',
      description: 'For those who can afford to contribute more - every bit helps!',
      features: [
        'Everything in Development',
        'Champion badge & recognition',
        'Direct line to founders',
        'Exclusive community access',
        'Monthly development updates',
        'Recognition on our website',
        'Invitation to quarterly strategy calls',
        'Free swag & merch',
      ],
      cta: 'Become a Champion',
      highlighted: false,
      helpText: 'If you can afford it, your extra support accelerates our mission tremendously.',
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
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
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
                <strong className="text-foreground">Champion (€25/month):</strong> For those who can
                afford to contribute more - if you have the means, your extra support accelerates
                our mission and helps us reach sustainability faster. Every bit helps!
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
