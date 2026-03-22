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
import { Loader2, Mail, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useAuthLogin } from '@/features/auth/hooks/useAuthLogin';

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error } = useAuthStore();
  const { isSending, sendMagicLink } = useAuthLogin();

  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    const result = await sendMagicLink(email);

    if (result.success) {
      navigate({ to: '/auth/verify', search: { email } });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Mail className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSending}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSending || !email}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.login.sending')}
                </>
              ) : (
                <>
                  {t('auth.login.sendCode')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-muted-foreground mt-6 text-center text-sm">
            <p>{t('auth.login.footer.noPassword')}</p>
            <p>{t('auth.login.footer.checkEmail')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
