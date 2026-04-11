'use client';

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
import { Loader2, LogIn, ArrowRight, Mail } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useAuthSignIn } from '@/features/auth/hooks/useAuthSignIn';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { GoogleIcon } from './GoogleIcon';
import { Link } from '@tanstack/react-router';

export function SignInForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error, clearError } = useAuthStore();
  const { isSigningIn, signIn, sendMagicLink } = useAuthSignIn();
  const { isRedirecting, continueWithGoogle } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) return;

    const result = await signIn(email, password);

    if (result.success) {
      if (result.isNewUser) {
        sessionStorage.setItem('polity_onboarding', 'true');
      }
      navigate({ to: '/' });
    } else {
      setLocalError(result.error ?? null);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setLocalError(t('auth.signIn.emailLabel'));
      return;
    }
    setLocalError(null);
    clearError();
    setMagicLinkSent(false);

    const result = await sendMagicLink(email);

    if (result.success) {
      setMagicLinkSent(true);
      navigate({ to: '/auth/verify', search: { email } });
    } else {
      setLocalError(result.error ?? null);
    }
  };

  const handleGoogleAuth = async () => {
    setLocalError(null);
    clearError();
    await continueWithGoogle('sign-in');
  };

  const displayError = localError || error;
  const isLoading = isSigningIn || isRedirecting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <LogIn className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.signIn.title')}</CardTitle>
          <CardDescription>{t('auth.signIn.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.signIn.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.signIn.emailPlaceholder')}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setLocalError(null);
                }}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.signIn.passwordLabel')}</Label>
                <Link
                  to="/auth/forgot-password"
                  search={{ email: email || undefined }}
                  className="text-muted-foreground hover:text-primary text-xs underline-offset-4 hover:underline"
                >
                  {t('auth.signIn.forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.signIn.passwordPlaceholder')}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setLocalError(null);
                }}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {displayError && (
              <Alert variant="destructive">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            {magicLinkSent && (
              <Alert>
                <AlertDescription>{t('auth.signIn.magicLinkSent')}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.signIn.submitting')}
                </>
              ) : (
                <>
                  {t('auth.signIn.submit')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <Button
            type="button"
            className="mt-4 w-full border border-[#dadce0] bg-white text-[#3c4043] hover:bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-[#202124] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            {isRedirecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-5 w-5" />
            )}
            {isRedirecting ? t('auth.signIn.googleLoading') : t('auth.signIn.googleButton')}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card text-muted-foreground px-2">
                {t('auth.signIn.magicLinkAlt')}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
            disabled={isLoading || !email}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isSigningIn ? t('auth.signIn.magicLinkSending') : t('auth.signIn.sendCode')}
          </Button>

          <div className="text-muted-foreground mt-6 text-center text-sm">
            <p>
              {t('auth.signIn.noAccount')}{' '}
              <Link
                to="/auth/sign-up"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t('auth.signIn.signUpLink')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
