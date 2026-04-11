'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Loader2, KeyRound } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAccountActions } from '@/features/auth/hooks/useAccountActions';

export function AccountPasswordSection() {
  const { t } = useTranslation();
  const { isUpdating, updateAccountPassword } = useAccountActions();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValid = password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t('pages.user.accountPassword.tooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('pages.user.accountPassword.mismatch'));
      return;
    }

    const success = await updateAccountPassword(password);
    if (success) {
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          <CardTitle>{t('pages.user.accountPassword.title')}</CardTitle>
        </div>
        <CardDescription>{t('pages.user.accountPassword.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-password">{t('pages.user.accountPassword.newPassword')}</Label>
            <Input
              id="account-password"
              type="password"
              placeholder={t('pages.user.accountPassword.newPasswordPlaceholder')}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError(null);
              }}
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-password-confirm">
              {t('pages.user.accountPassword.confirmPassword')}
            </Label>
            <Input
              id="account-password-confirm"
              type="password"
              placeholder={t('pages.user.accountPassword.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={!isValid || isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUpdating
              ? t('pages.user.accountPassword.updating')
              : t('pages.user.accountPassword.update')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
