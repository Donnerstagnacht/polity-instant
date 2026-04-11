import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/features/shared/ui/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/features/shared/ui/ui/card'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { useAuth } from '@/providers/auth-provider'
import { useZeroReady } from '@/providers/zero-provider'
import { OnboardingWizard } from '@/features/auth/onboarding/OnboardingWizard'
import { useUserState } from '@/zero/users/useUserState'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const featureIcons = ['👥', '📅', '📝', '💬'] as const
const featureKeys = ['groups', 'events', 'amendments', 'messages'] as const

const ONBOARDING_KEY = 'polity_onboarding'

function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const zeroReady = useZeroReady()

  // Read onboarding flag from sessionStorage (set by VerifyForm before navigation)
  const [showOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false
    const val = sessionStorage.getItem(ONBOARDING_KEY) === 'true'
    console.log('[HomePage] Initial showOnboarding from sessionStorage:', val)
    return val
  })

  console.log('[HomePage] Render — user:', !!user, 'zeroReady:', zeroReady, 'showOnboarding:', showOnboarding)

  // When authenticated and Zero is ready, delegate to a child that can safely use Zero hooks
  if (user && zeroReady) {
    return <AuthenticatedHome user={user} showOnboarding={showOnboarding} />
  }

  const quickLinks = [
    { to: '/solutions' as const, label: t('pages.home.quickLinks.solutions.title'), desc: t('pages.home.quickLinks.solutions.description') },
    { to: '/pricing' as const, label: t('pages.home.quickLinks.pricing.title'), desc: t('pages.home.quickLinks.pricing.description') },
    { to: '/features' as const, label: t('pages.home.quickLinks.features.title'), desc: t('pages.home.quickLinks.features.description') },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t('pages.home.hero.title')}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {t('pages.home.hero.subtitle')}
        </p>
        <div className="flex gap-4 mt-4">
          <Button asChild size="lg">
            <Link to="/auth">{t('pages.home.hero.getStarted')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/features">{t('pages.home.hero.exploreFeatures')}</Link>
          </Button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="flex justify-center gap-4 px-4 py-8 flex-wrap">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to} className="text-center p-4 rounded-lg border hover:bg-accent transition-colors w-56">
            <p className="font-semibold">{link.label}</p>
            <p className="text-sm text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-10">{t('landing.features.title')}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureKeys.map((key, i) => (
            <Card key={key}>
              <CardHeader>
                <div className="text-3xl mb-2">{featureIcons[i]}</div>
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
  )
}

/**
 * Rendered only when authenticated + ZeroProvider is available.
 * Safe to call Zero hooks here.
 */
function AuthenticatedHome({ user, showOnboarding }: { user: { id: string; email: string }; showOnboarding: boolean }) {
  const { currentUser } = useUserState()

  // Database-driven check: if user already has first_name, onboarding is done — regardless of sessionStorage.
  // sessionStorage flag is only trusted when Zero hasn't loaded the user yet or first_name is still null.
  const hasCompletedOnboarding = currentUser != null && !!currentUser.first_name
  const needsOnboarding = !hasCompletedOnboarding && (showOnboarding || (currentUser != null && !currentUser.first_name))

  const handleOnboardingComplete = () => {
    console.log('[HomePage] Onboarding complete — clearing sessionStorage flag')
    sessionStorage.removeItem(ONBOARDING_KEY)
  }

  if (needsOnboarding) {
    console.log('[HomePage] ✅ Showing OnboardingWizard')
    return (
      <OnboardingWizard
        userId={user.id}
        userEmail={user.email}
        onComplete={handleOnboardingComplete}
      />
    )
  }

  console.log('[HomePage] User ready, no onboarding — redirecting to /home')
  return <Navigate to="/home" />
}
