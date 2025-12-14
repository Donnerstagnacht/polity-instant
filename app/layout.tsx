import './globals.css';
import { ClientLayout } from './client-layout';

export const metadata = {
  title: 'Polity',
  description: 'A modern political platform',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Polity',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logo192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
