'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/ui/ui/card';
import { Alert, AlertDescription } from '@/features/shared/ui/ui/alert';
import { Loader2, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useAuthSignIn } from '@/features/auth/hooks/useAuthSignIn';
import { Link, useSearch } from '@tanstack/react-router';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const searchParams = useSearch({ strict: false }) as Record<string, string>;
  const { error, clearError } = useAuthStore();
  const { isSigningIn, resetPassword } = useAuthSignIn();

  const [email, setEmail] = useState(searchParams.email || '');
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email) return;

    const result = await resetPassword(email);

    if (result.success) {
      setSent(true);
    } else {
      setLocalError(result.error ?? null);
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            {sent ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <KeyRound className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {sent ? t('auth.forgotPassword.successTitle') : t('auth.forgotPassword.title')}
          </CardTitle>
          <CardDescription>
            {sent ? (
              <>
                {t('auth.forgotPassword.successDescription')} <strong>{email}</strong>
              </>
            ) : (
              t('auth.forgotPassword.description')
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <Link to="/auth/sign-in">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('auth.forgotPassword.backToSignIn')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.forgotPassword.emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setLocalError(null);
                    }}
                    required
                    disabled={isSigningIn}
                    autoComplete="email"
                  />
                </div>

                {displayError && (
                  <Alert variant="destructive">
                    <AlertDescription>{displayError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSigningIn || !email}>
                  {isSigningIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.forgotPassword.submitting')}
                    </>
                  ) : (
                    t('auth.forgotPassword.submit')
                  )}
                </Button>
              </form>

              <div className="text-muted-foreground mt-6 text-center text-sm">
                <Link
                  to="/auth/sign-in"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="mr-1 inline h-3 w-3" />
                  {t('auth.forgotPassword.backToSignIn')}
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
