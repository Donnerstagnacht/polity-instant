import './globals.css';
import { ClientLayout } from './client-layout';

export const metadata = {
  title: 'Polity',
  description: 'A modern political platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
