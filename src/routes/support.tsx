import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/features/shared/ui/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/features/shared/ui/ui/card'
import { useTranslation } from '@/features/shared/hooks/use-translation'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

const areaKeys = ['financial', 'design', 'development'] as const
const areaIcons = ['💰', '🎨', '💻'] as const
const areaCtaLinks: Record<number, { href: string; external?: boolean }> = {
  0: { href: '/pricing' },
  1: { href: 'https://www.figma.com/proto/cAT8Aonu8P7ojwgnKcVlkz/Polity?node-id=51357-32189&starting-point-node-id=51098%3A4683', external: true },
  2: { href: 'https://github.com/Donnerstagnacht/polity-instant', external: true },
}

function SupportPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="flex flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('pages.support.header.title')}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {t('pages.support.header.subtitle')}
        </p>
      </section>

      {/* Support Areas */}
      <section className="max-w-6xl mx-auto w-full px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t('pages.support.howCanHelp')}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {areaKeys.map((key, i) => {
            const details = t(`pages.support.areas.${key}.details`) as unknown as string[]
            return (
              <Card key={key}>
                <CardHeader>
                  <div className="text-3xl mb-2">{areaIcons[i]}</div>
                  <CardTitle className="text-xl">{t(`pages.support.areas.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`pages.support.areas.${key}.description`)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {Array.isArray(details) && details.map((detail: string) => (
                      <li key={detail} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {areaCtaLinks[i]?.external ? (
                    <Button asChild variant="outline" className="w-full">
                      <a href={areaCtaLinks[i].href} target="_blank" rel="noopener noreferrer">
                        {t(`pages.support.areas.${key}.cta`)}
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link to={areaCtaLinks[i]?.href ?? '/'}>{t(`pages.support.areas.${key}.cta`)}</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Community */}
      <section className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t('pages.support.community.title')}</h2>
        <p className="max-w-2xl text-muted-foreground">
          {t('pages.support.community.description')}
        </p>
        <Button asChild size="lg">
          <Link to="/auth/login">{t('pages.home.hero.getStarted')}</Link>
        </Button>
      </section>
    </div>
  )
}
