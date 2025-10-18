'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 text-6xl font-bold text-muted-foreground">404</div>
          <CardTitle className="text-2xl">
            {t('errors.pageNotFound.title', 'Page Not Found')}
          </CardTitle>
          <CardDescription className="text-base">
            {t(
              'errors.pageNotFound.description',
              'The page you are looking for does not exist or has been moved.'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.goBack', 'Go Back')}
            </Button>

            <Link href="/" className="block">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                {t('common.goHome', 'Go Home')}
              </Button>
            </Link>
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              {t('errors.pageNotFound.helpText', 'Need help finding something?')}
            </p>
            <Button variant="ghost" size="sm" className="text-xs">
              <Search className="mr-2 h-3 w-3" />
              {t('common.search', 'Search')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
