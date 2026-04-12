import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { AuthProvider } from '@/providers/auth-provider'
import { ZeroAppProvider } from '@/providers/zero-provider'
import { AppShell } from '@/layout/app-shell'
import { NotFound } from '@/features/shared/ui/ui/not-found'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#ffffff' },
      { title: 'Polity' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
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
