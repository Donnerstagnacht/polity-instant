import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/features/shared/ui/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/features/shared/ui/ui/card'
import { useTranslation } from '@/features/shared/hooks/use-translation'

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
})

const featureKeys = ['groups', 'events', 'amendments', 'agendas', 'search', 'messages'] as const
const featureIcons = ['👥', '📅', '📝', '✍️', '🗳️', '💬'] as const

function FeaturesPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 px-4 py-20 text-center bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.features.header.title')}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {t('pages.features.header.subtitle')}
        </p>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto w-full px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key, i) => (
            <Card key={key}>
              <CardHeader>
                <div className="text-3xl mb-2">{featureIcons[i]}</div>
                <CardTitle className="text-xl">{t(`pages.features.features.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(`pages.features.features.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-4 px-4 py-16 text-center bg-muted/50">
        <h2 className="text-2xl font-bold">{t('pages.features.cta.title')}</h2>
        <p className="max-w-xl text-muted-foreground">
          {t('pages.features.cta.subtitle')}
        </p>
        <div className="flex gap-4 mt-2">
          <Button asChild size="lg">
            <Link to="/auth/login">{t('pages.features.cta.getStarted')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/pricing">{t('pages.features.cta.viewPricing')}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
