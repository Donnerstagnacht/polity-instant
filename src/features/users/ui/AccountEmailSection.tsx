'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Loader2, Mail } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuth } from '@/providers/auth-provider';
import { useAccountActions } from '@/features/auth/hooks/useAccountActions';

export function AccountEmailSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isUpdating, updateAccountEmail } = useAccountActions();

  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValid = newEmail.length > 0 && newEmail !== user?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newEmail) return;

    const success = await updateAccountEmail(newEmail);
    if (success) {
      setNewEmail('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle>{t('pages.user.accountEmail.title')}</CardTitle>
        </div>
        <CardDescription>{t('pages.user.accountEmail.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('pages.user.accountEmail.currentEmail')}</Label>
            <Input value={user?.email ?? ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email">{t('pages.user.accountEmail.newEmail')}</Label>
            <Input
              id="new-email"
              type="email"
              placeholder={t('pages.user.accountEmail.newEmailPlaceholder')}
              value={newEmail}
              onChange={e => {
                setNewEmail(e.target.value);
                setError(null);
              }}
              autoComplete="email"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={!isValid || isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUpdating
              ? t('pages.user.accountEmail.updating')
              : t('pages.user.accountEmail.update')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
