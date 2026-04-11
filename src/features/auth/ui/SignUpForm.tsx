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
import { Loader2, UserPlus, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useAuthSignUp } from '@/features/auth/hooks/useAuthSignUp';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { GoogleIcon } from './GoogleIcon';
import { Link } from '@tanstack/react-router';

export function SignUpForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error, clearError } = useAuthStore();
  const { isSigningUp, signUp } = useAuthSignUp();
  const { isRedirecting, continueWithGoogle } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password || !confirmPassword) return;

    if (password.length < 6) {
      setLocalError(t('auth.signUp.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.signUp.passwordMismatch'));
      return;
    }

    const result = await signUp(email, password);

    if (result.success) {
      sessionStorage.setItem('polity_onboarding', 'true');
      navigate({ to: '/' });
    } else {
      setLocalError(result.error ?? null);
    }
  };

  const handleGoogleAuth = async () => {
    setLocalError(null);
    clearError();
    await continueWithGoogle('sign-up');
  };

  const displayError = localError || error;
  const isLoading = isSigningUp || isRedirecting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <UserPlus className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.signUp.title')}</CardTitle>
          <CardDescription>{t('auth.signUp.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.signUp.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.signUp.emailPlaceholder')}
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
              <Label htmlFor="password">{t('auth.signUp.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.signUp.passwordPlaceholder')}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setLocalError(null);
                }}
                required
                minLength={6}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('auth.signUp.confirmPasswordLabel')}</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  setLocalError(null);
                }}
                required
                minLength={6}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {displayError && (
              <Alert variant="destructive">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password || !confirmPassword}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.signUp.submitting')}
                </>
              ) : (
                <>
                  {t('auth.signUp.submit')}
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
            {isRedirecting ? t('auth.signUp.googleLoading') : t('auth.signUp.googleButton')}
          </Button>

          <div className="text-muted-foreground mt-6 text-center text-sm">
            <p>
              {t('auth.signUp.hasAccount')}{' '}
              <Link
                to="/auth/sign-in"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t('auth.signUp.signInLink')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
