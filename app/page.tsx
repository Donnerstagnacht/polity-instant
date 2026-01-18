'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ArrowRight } from 'lucide-react';
import { SubscriptionTimeline } from '@/features/timeline';
import { AriaKaiWelcomeDialog } from '@/components/dialogs/AriaKaiWelcomeDialog';
import { OnboardingWizard } from '@/features/auth/ui/onboarding/OnboardingWizard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { db } from '../db/db';
import { useTranslation } from '@/hooks/use-translation';

export default function HomePage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const showAriaKaiParam = searchParams.get('showAriaKai');
  const onboardingParam = searchParams.get('onboarding');
  
  // Use InstantDB's native auth hook for consistency with client-layout
  const { user } = db.useAuth();
  const isAuthenticated = !!user;
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showAlphaWarning, setShowAlphaWarning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
  
  console.log('🏠 HomePage render:', {
    isAuthenticated,
    userId: user?.id,
    showAriaKaiParam,
    onboardingParam,
    shouldShowDialog,
    showOnboarding,
    userData: userData ? { id: userData.id, name: userData.name, assistantIntroduction: userData.assistantIntroduction } : null
  });

  // Check if user should see onboarding
  useEffect(() => {
    if (onboardingParam === 'true' && isAuthenticated && userData) {
      const hasNoName = !userData.name || userData.name.trim() === '';
      console.log('🔍 Onboarding check:', { hasNoName, userData });
      if (hasNoName) {
        console.log('✅ Showing onboarding wizard');
        setShowOnboarding(true);
      } else {
        console.log('❌ User has name, skipping onboarding');
        // Remove onboarding parameter
        router.replace('/');
      }
    }
  }, [onboardingParam, isAuthenticated, userData, router]);

  useEffect(() => {
    // Show dialog if user is authenticated and hasn't dismissed it
    // Don't show if user is in onboarding flow
    console.log('🏠 HomePage useEffect check:', {
      isAuthenticated,
      shouldShowDialog,
      onboardingParam,
      willShow: isAuthenticated && shouldShowDialog && !onboardingParam
    });
    
    if (isAuthenticated && shouldShowDialog && !onboardingParam) {
      console.log('🎉 Setting showWelcomeDialog to true');
      setShowWelcomeDialog(true);
    }
  }, [isAuthenticated, shouldShowDialog, onboardingParam]);

  // Show alpha warning for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const hasSeenWarning = localStorage.getItem('alpha-warning-dismissed');
      if (!hasSeenWarning) {
        setShowAlphaWarning(true);
      }
    }
  }, [isAuthenticated]);

  const handleDismissWarning = () => {
    localStorage.setItem('alpha-warning-dismissed', 'true');
    setShowAlphaWarning(false);
  };

  const handleOnboardingComplete = () => {
    console.log('🏁 Onboarding completed');
    setShowOnboarding(false);
    // Navigation is handled within OnboardingWizard
  };

  // Show onboarding wizard if needed
  if (isAuthenticated && showOnboarding && user?.id) {
    console.log('📋 Rendering OnboardingWizard');
    return (
      <OnboardingWizard
        userId={user.id}
        userEmail={user.email || ''}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // If authenticated, show the timeline
  if (isAuthenticated) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <AriaKaiWelcomeDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog} />
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">{t('pages.home.welcomeBack', { email: user?.email })}</h1>
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
      <AlertDialog open={showAlphaWarning} onOpenChange={setShowAlphaWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pages.home.alphaWarning.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages.home.alphaWarning.description')}{' '}
              <a
                href="mailto:tobias.hassebrock@gmail.com"
                className="font-medium text-primary underline hover:text-primary/80"
              >
                tobias.hassebrock@gmail.com
              </a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDismissWarning}>{t('pages.home.alphaWarning.dismiss')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Section */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {t('pages.home.hero.title')}
          </h1>
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            {t('pages.home.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                {t('pages.home.hero.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('pages.home.hero.exploreFeatures')}
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-16 grid gap-4 text-sm sm:grid-cols-3">
            <Link
              href="/solutions"
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">{t('pages.home.quickLinks.solutions.title')}</h3>
              <p className="mt-1 text-muted-foreground">{t('pages.home.quickLinks.solutions.description')}</p>
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">{t('pages.home.quickLinks.pricing.title')}</h3>
              <p className="mt-1 text-muted-foreground">
                {t('pages.home.quickLinks.pricing.description')}
              </p>
            </Link>
            <Link
              href="/features"
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">{t('pages.home.quickLinks.features.title')}</h3>
              <p className="mt-1 text-muted-foreground">{t('pages.home.quickLinks.features.description')}</p>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
