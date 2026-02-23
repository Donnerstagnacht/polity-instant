import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouter } from '@tanstack/react-router'
import { AuthProvider } from '@/providers/auth-provider'
import { ZeroAppProvider } from '@/providers/zero-provider'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'
import appCss from '../styles.css?url'

function RootNotFound() {
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
          <Link to="/">{t('pages.notFound.goHome')}</Link>
        </Button>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  notFoundComponent: RootNotFound,
  head: () => ({
    meta: [
      { charSet: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'Polity' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Blocking script to apply dark class before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`
          }}
        />
        <AuthProvider>
          <ZeroAppProvider>
            <AppShell>
              <Outlet />
            </AppShell>
          </ZeroAppProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}
