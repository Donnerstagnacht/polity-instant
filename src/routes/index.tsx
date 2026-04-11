import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/features/shared/ui/ui/card';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuth } from '@/providers/auth-provider';
import { useZeroReady } from '@/providers/zero-provider';
import { OnboardingWizard } from '@/features/auth/onboarding/OnboardingWizard';
import { useUserState } from '@/zero/users/useUserState';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const featureIcons = ['👥', '📅', '📝', '💬'] as const;
const featureKeys = ['groups', 'events', 'amendments', 'messages'] as const;

const ONBOARDING_KEY = 'polity_onboarding';

function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const zeroReady = useZeroReady();

  // Read onboarding flag from sessionStorage (set by VerifyForm before navigation)
  const [showOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    const val = sessionStorage.getItem(ONBOARDING_KEY) === 'true';
    console.log('[HomePage] Initial showOnboarding from sessionStorage:', val);
    return val;
  });

  console.log(
    '[HomePage] Render — user:',
    !!user,
    'zeroReady:',
    zeroReady,
    'showOnboarding:',
    showOnboarding
  );

  // When authenticated and Zero is ready, delegate to a child that can safely use Zero hooks
  if (user && zeroReady) {
    return <AuthenticatedHome user={user} showOnboarding={showOnboarding} />;
  }

  const quickLinks = [
    {
      to: '/solutions' as const,
      label: t('pages.home.quickLinks.solutions.title'),
      desc: t('pages.home.quickLinks.solutions.description'),
    },
    {
      to: '/pricing' as const,
      label: t('pages.home.quickLinks.pricing.title'),
      desc: t('pages.home.quickLinks.pricing.description'),
    },
    {
      to: '/features' as const,
      label: t('pages.home.quickLinks.features.title'),
      desc: t('pages.home.quickLinks.features.description'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="from-primary/5 to-background flex flex-col items-center justify-center gap-6 bg-gradient-to-b px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t('pages.home.hero.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{t('pages.home.hero.subtitle')}</p>
        <div className="mt-4 flex gap-4">
          <Button asChild size="lg">
            <Link to="/auth">{t('pages.home.hero.getStarted')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/features">{t('pages.home.hero.exploreFeatures')}</Link>
          </Button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="flex flex-wrap justify-center gap-4 px-4 py-8">
        {quickLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:bg-accent w-56 rounded-lg border p-4 text-center transition-colors"
          >
            <p className="font-semibold">{link.label}</p>
            <p className="text-muted-foreground text-sm">{link.desc}</p>
          </Link>
        ))}
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">{t('landing.features.title')}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureKeys.map((key, i) => (
            <Card key={key}>
              <CardHeader>
                <div className="mb-2 text-3xl">{featureIcons[i]}</div>
                <CardTitle className="text-xl">{t(`landing.features.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(`landing.features.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Rendered only when authenticated + ZeroProvider is available.
 * Safe to call Zero hooks here.
 */
function AuthenticatedHome({
  user,
  showOnboarding,
}: {
  user: { id: string; email: string };
  showOnboarding: boolean;
}) {
  const { currentUser } = useUserState();
  // Once we decide to show the wizard, lock it so DB changes during the flow don't navigate away.
  const [onboardingLocked, setOnboardingLocked] = useState(false);

  // Wait for Zero to load the user record before deciding.
  // Without this, we'd immediately navigate to /home while the DB check is still pending.
  if (currentUser == null && !showOnboarding) {
    return null;
  }

  // Database-driven check: if user already has first_name, onboarding is done — regardless of sessionStorage.
  const hasCompletedOnboarding = currentUser != null && !!currentUser.first_name;
  const needsOnboarding =
    onboardingLocked ||
    (!hasCompletedOnboarding &&
      (showOnboarding || (currentUser != null && !currentUser.first_name)));

  // Lock the wizard on first render so mid-flow DB writes (e.g. saving first_name) don't abort it.
  if (needsOnboarding && !onboardingLocked) {
    setOnboardingLocked(true);
  }

  const handleOnboardingComplete = () => {
    console.log('[HomePage] Onboarding complete — clearing sessionStorage flag');
    sessionStorage.removeItem(ONBOARDING_KEY);
    setOnboardingLocked(false);
  };

  if (needsOnboarding) {
    console.log('[HomePage] ✅ Showing OnboardingWizard');
    return (
      <OnboardingWizard
        userId={user.id}
        userEmail={user.email}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  console.log('[HomePage] User ready, no onboarding — redirecting to /home');
  return <Navigate to="/home" />;
}
