import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/use-translation'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const featureIcons = ['👥', '📅', '📝', '💬'] as const
const featureKeys = ['groups', 'events', 'amendments', 'messages'] as const

function HomePage() {
  const { t } = useTranslation()

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
            <Link to="/auth/login">{t('pages.home.hero.getStarted')}</Link>
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
