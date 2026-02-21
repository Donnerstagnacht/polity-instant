import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useTranslation } from '@/hooks/use-translation'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

const tierKeys = ['free', 'runningCosts', 'development'] as const

function PricingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="flex flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.pricing.title')}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {t('pages.pricing.subtitle')}
        </p>
      </section>

      {/* Tiers */}
      <section className="max-w-6xl mx-auto w-full px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          {tierKeys.map((key) => {
            const highlighted = key === 'runningCosts'
            const features = t(`pages.pricing.tiers.${key}.features`) as unknown as string[]
            const period = t(`pages.pricing.tiers.${key}.period`)
            return (
              <Card key={key} className={highlighted ? 'border-primary shadow-md' : ''}>
                <CardHeader>
                  <CardTitle className="text-2xl">{t(`pages.pricing.tiers.${key}.name`)}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{t(`pages.pricing.tiers.${key}.price`)}</span>
                    {period && period !== `pages.pricing.tiers.${key}.period` && (
                      <span className="text-muted-foreground">{period}</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">{t(`pages.pricing.tiers.${key}.description`)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {Array.isArray(features) && features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={highlighted ? 'default' : 'outline'}>
                    <Link to="/auth/login">{t(`pages.pricing.tiers.${key}.cta`)}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">{t('pages.pricing.philosophy.title')}</h2>
          <p className="text-muted-foreground">
            {t('pages.pricing.philosophy.intro')}{' '}
            <strong>{t('pages.pricing.philosophy.allFeaturesFreeBold')}</strong>
            {t('pages.pricing.philosophy.afterBold')}
          </p>
        </div>
      </section>

      {/* Enterprise */}
      <section className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t('pages.pricing.enterprise.title')}</h2>
        <p className="max-w-xl text-muted-foreground">
          {t('pages.pricing.enterprise.description')}
        </p>
        <Button asChild variant="outline" size="lg">
          <Link to="/support">{t('pages.pricing.enterprise.cta')}</Link>
        </Button>
      </section>
    </div>
  )
}
