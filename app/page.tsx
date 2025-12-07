'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ArrowRight } from 'lucide-react';
import { SubscriptionTimeline } from '@/features/timeline';
import { AriaKaiWelcomeDialog } from '@/components/dialogs/AriaKaiWelcomeDialog';
import { db } from '../db';
// import { useTranslation } from 'react-i18next'; // Temporarily disabled

export default function HomePage() {
  // const { t } = useTranslation(); // Temporarily disabled
  // Use InstantDB's native auth hook for consistency with client-layout
  const { user } = db.useAuth();
  const isAuthenticated = !!user;
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  // Query user data to check assistantIntroduction flag
  const { data } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: {
              where: {
                id: user.id,
              },
            },
          },
        }
      : null
  );

  const userData = data?.$users?.[0];
  const shouldShowDialog = userData?.assistantIntroduction !== false;

  useEffect(() => {
    if (isAuthenticated && shouldShowDialog) {
      setShowWelcomeDialog(true);
    }
  }, [isAuthenticated, shouldShowDialog]);

  // If authenticated, show the timeline
  if (isAuthenticated) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <AriaKaiWelcomeDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog} />
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">Welcome back, {user?.email}!</h1>
        </div>
        <div className="mb-8">
          <SubscriptionTimeline />
        </div>
      </PageWrapper>
    );
  }

  // Landing page for unauthenticated users
  return (
    <PageWrapper className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Section */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Democracy Reimagined for the Digital Age
          </h1>
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            Empowering communities, organizations, and governments with collaborative
            decision-making tools
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-16 grid gap-4 text-sm sm:grid-cols-3">
            <Link
              href="/solutions"
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">Solutions</h3>
              <p className="mt-1 text-muted-foreground">For parties, governments, NGOs & more</p>
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">Pricing</h3>
              <p className="mt-1 text-muted-foreground">
                Transparent pricing from free to enterprise
              </p>
            </Link>
            <Link
              href="/features"
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">Features</h3>
              <p className="mt-1 text-muted-foreground">Full feature overview</p>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
