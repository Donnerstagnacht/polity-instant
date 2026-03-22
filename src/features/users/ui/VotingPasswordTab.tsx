'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useVotingPasswordActions } from '@/zero/voting-password/useVotingPasswordActions';
import { useVotingPasswordState } from '@/zero/voting-password/useVotingPasswordState';

interface VotingPasswordTabProps {
  userId: string;
}

export function VotingPasswordTab({ userId }: VotingPasswordTabProps) {
  const { t } = useTranslation();
  const { setVotingPassword, verifyVotingPassword } = useVotingPasswordActions();
  const { hasVotingPassword, isLoading: stateLoading } = useVotingPasswordState({ userId });

  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOldPasswordValid = !hasVotingPassword || (oldPassword.length === 4 && /^\d{4}$/.test(oldPassword));
  const isValid =
    isOldPasswordValid && password.length === 4 && /^\d{4}$/.test(password) && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (hasVotingPassword && !/^\d{4}$/.test(oldPassword)) {
      setError(t('pages.user.votingPassword.invalidFormat', 'Must be exactly 4 digits'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('pages.user.votingPassword.mismatch', 'Passwords do not match'));
      return;
    }

    if (!/^\d{4}$/.test(password)) {
      setError(t('pages.user.votingPassword.invalidFormat', 'Must be exactly 4 digits'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (hasVotingPassword) {
        await verifyVotingPassword(oldPassword);
      }
      await setVotingPassword(password);
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError(
        hasVotingPassword
          ? t('pages.user.votingPassword.verifyOrSaveFailed', 'Old password incorrect or failed to save')
          : t('pages.user.votingPassword.saveFailed', 'Failed to save voting password'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              <CardTitle>{t('pages.user.votingPassword.title', 'Voting Password')}</CardTitle>
            </div>
            {!stateLoading && (
              <Badge variant={hasVotingPassword ? 'default' : 'secondary'}>
                {hasVotingPassword ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('pages.user.votingPassword.set', 'Set')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t('pages.user.votingPassword.notSet', 'Not Set')}
                  </span>
                )}
              </Badge>
            )}
          </div>
          <CardDescription>
            {t(
              'pages.user.votingPassword.description',
              'Your 4-digit voting password is required to confirm votes during elections and ballot votes. Keep it secure.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {hasVotingPassword && (
              <div className="space-y-2">
                <Label htmlFor="old-voting-password">
                  {t('pages.user.votingPassword.oldPassword', 'Current Voting Password')}
                </Label>
                <Input
                  id="old-voting-password"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="••••"
                  value={oldPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setOldPassword(val);
                    setError(null);
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="voting-password">
                {hasVotingPassword
                  ? t('pages.user.votingPassword.newPassword', 'New Voting Password')
                  : t('pages.user.votingPassword.setPassword', 'Set Voting Password')}
              </Label>
              <Input
                id="voting-password"
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••"
                value={password}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPassword(val);
                  setError(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-voting-password">
                {t('pages.user.votingPassword.confirmPassword', 'Confirm Voting Password')}
              </Label>
              <Input
                id="confirm-voting-password"
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setConfirmPassword(val);
                  setError(null);
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {hasVotingPassword
                ? t('pages.user.votingPassword.update', 'Update Password')
                : t('pages.user.votingPassword.save', 'Save Password')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
