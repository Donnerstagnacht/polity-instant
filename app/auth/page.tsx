'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/lib/instant/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AuthPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { requestMagicCode, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const success = await requestMagicCode(email);
    if (success) {
      setIsCodeSent(true);
      // Redirect to verification page with email parameter
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
  };

  const handleBackToEmail = () => {
    setIsCodeSent(false);
    setEmail('');
  };

  if (isCodeSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
              {t('auth.codeSent.title')}
            </CardTitle>
            <CardDescription>
              {t('auth.codeSent.description').replace('{{email}}', email)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.codeSent.instructions')}
            </p>
            <Button variant="outline" className="w-full" onClick={handleBackToEmail}>
              {t('auth.codeSent.backToEmail')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={false}>
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
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !email}>
                {isLoading ? (
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

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>{t('auth.login.footer.noPassword')}</p>
              <p>{t('auth.login.footer.checkEmail')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
