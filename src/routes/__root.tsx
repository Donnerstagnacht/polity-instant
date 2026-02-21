import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { AuthProvider } from '@/providers/auth-provider'
import { ZeroAppProvider } from '@/providers/zero-provider'
import { AppShell } from '@/components/layout/app-shell'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
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
