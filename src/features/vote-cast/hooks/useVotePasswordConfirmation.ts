/**
 * useVotePasswordConfirmation Hook
 *
 * Manages the voting password confirmation dialog state.
 * On submit: calls verifyPassword server mutator, on success triggers
 * the pending vote callback.
 */

import { useState, useCallback } from 'react';
import { useZero } from '@rocicorp/zero/react';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { mutators } from '@/zero/mutators';

export function useVotePasswordConfirmation() {
  const zero = useZero();
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => Promise<void>) | null>(null);

  /**
   * Open the password dialog and store the callback to invoke on success.
   */
  const requestConfirmation = useCallback((callback: () => Promise<void>) => {
    setPendingCallback(() => callback);
    setError(null);
    setIsOpen(true);
  }, []);

  /**
   * Verify the entered password. On success run the pending callback and close.
   */
  const submitPassword = useCallback(
    async (password: string) => {
      setIsVerifying(true);
      setError(null);

      try {
        await zero.mutate(mutators.votingPassword.verifyVotingPassword({ password }));

        // Password verified — run the pending vote callback
        if (pendingCallback) {
          await pendingCallback();
        }

        setIsOpen(false);
        setPendingCallback(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t('common.votingPassword.verifyFailed');
        setError(message);
        toast.error(message);
      } finally {
        setIsVerifying(false);
      }
    },
    [zero, t, pendingCallback],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setPendingCallback(null);
    setError(null);
  }, []);

  return {
    isOpen,
    isVerifying,
    error,
    requestConfirmation,
    submitPassword,
    close,
  };
}
