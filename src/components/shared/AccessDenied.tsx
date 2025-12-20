'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export function AccessDenied() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">
            {t('errors.accessDenied.title', 'Access Denied')}
          </CardTitle>
          <CardDescription className="text-base">
            {t(
              'errors.accessDenied.description',
              'You do not have permission to view this page or perform this action.'
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
              {t('errors.accessDenied.helpText', 'Believe this is a mistake?')}
            </p>
            <Button variant="ghost" size="sm" className="text-xs">
              <Search className="mr-2 h-3 w-3" />
              {t('common.contactSupport', 'Contact Support')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
