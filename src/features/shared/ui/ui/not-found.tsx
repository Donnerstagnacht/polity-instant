import { Link, useRouter } from '@tanstack/react-router'
import { Button } from '@/features/shared/ui/ui/button.tsx'
import { useTranslation } from '@/features/shared/hooks/use-translation.ts'

const GITHUB_ISSUES_URL = 'https://github.com/Donnerstagnacht/polity-instant/issues'
const CONTACT_EMAIL = 'polity.live@gmail.com'

export function NotFound() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">{t('pages.notFound.title')}</h2>
        <p className="text-muted-foreground">{t('pages.notFound.description')}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.history.back()}>
          {t('pages.notFound.goBack')}
        </Button>
        <Button asChild>
          <Link to="/home">{t('pages.notFound.goHome')}</Link>
        </Button>
      </div>
      <div className="border-t pt-4 mt-2 max-w-md">
        <p className="text-sm text-muted-foreground">
          {t('errors.contactHint')}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">
            {CONTACT_EMAIL}
          </a>{' '}
          {t('errors.contactHintOr')}{' '}
          <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            {t('errors.contactHintFileIssue')}
          </a>.
        </p>
      </div>
    </div>
  )
}
