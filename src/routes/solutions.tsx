import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/features/shared/ui/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/features/shared/ui/ui/card'
import { useTranslation } from '@/features/shared/hooks/use-translation'

export const Route = createFileRoute('/solutions')({
  component: SolutionsPage,
})

const solutionKeys = ['parties', 'ngos', 'corporations', 'government'] as const
const solutionIcons = ['🏛️', '🤝', '🏢', '⚖️'] as const

function SolutionsPage() {
  const { t, tArray } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="flex flex-col items-center gap-4 px-4 py-20 text-center bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.solutions.title')}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {t('pages.solutions.subtitle')}
        </p>
      </section>

      {/* Solutions Grid */}
      <section className="max-w-6xl mx-auto w-full px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {solutionKeys.map((key, i) => {
            const features = tArray(`pages.solutions.solutions.${key}.features`)
            return (
              <Card key={key}>
                <CardHeader>
                  <div className="text-3xl mb-2">{solutionIcons[i]}</div>
                  <CardTitle className="text-xl">{t(`pages.solutions.solutions.${key}.title`)}</CardTitle>
                  <p className="text-sm font-medium text-primary">{t(`pages.solutions.solutions.${key}.tagline`)}</p>
                  <CardDescription className="mt-2">{t(`pages.solutions.solutions.${key}.description`)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-semibold mb-2">{t('pages.solutions.sections.keyFeatures')}</h4>
                  <ul className="space-y-1">
                    {Array.isArray(features) && features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-4 px-4 py-16 text-center bg-muted/50">
        <h2 className="text-2xl font-bold">{t('pages.solutions.cta.title')}</h2>
        <p className="max-w-xl text-muted-foreground">
          {t('pages.solutions.cta.subtitle')}
        </p>
        <div className="flex gap-4 mt-2">
          <Button asChild size="lg">
            <Link to="/auth">{t('pages.solutions.cta.getStarted')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/features">{t('pages.solutions.cta.exploreFeatures')}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
