'use client';

import { Button } from '@/features/shared/ui/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/ui/ui/card.tsx';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';

const GITHUB_ISSUES_URL = 'https://github.com/Donnerstagnacht/polity-instant/issues';
const CONTACT_EMAIL = 'polity.live@gmail.com';

export function AccessDenied() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">{t('errors.accessDenied.title')}</CardTitle>
          <CardDescription className="text-base">
            {t('errors.accessDenied.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button onClick={() => window.history.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.goBack')}
            </Button>

            <Link to="/" className="block">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                {t('common.goHome')}
              </Button>
            </Link>
          </div>

          <div className="border-t pt-4">
            <p className="text-muted-foreground mb-3 text-sm">
              {t('errors.contactHint')}{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground underline">
                {CONTACT_EMAIL}
              </a>{' '}
              {t('errors.contactHintOr')}{' '}
              <a
                href={GITHUB_ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground underline"
              >
                {t('errors.contactHintFileIssue')}
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
