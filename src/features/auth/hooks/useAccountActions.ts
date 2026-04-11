/**
 * Account Actions Hook
 * Business logic for updating account password and email via Supabase Auth
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface UseAccountActionsReturn {
  isUpdating: boolean;
  updateAccountPassword: (newPassword: string) => Promise<boolean>;
  updateAccountEmail: (newEmail: string) => Promise<boolean>;
}

/**
 * Hook for updating account password and email
 * Uses Supabase session-based auth — no current password required
 */
export function useAccountActions(): UseAccountActionsReturn {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAccountPassword = useCallback(
    async (newPassword: string): Promise<boolean> => {
      setIsUpdating(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
          throw error;
        }

        toast.success(t('pages.user.accountPassword.success'));
        return true;
      } catch (error) {
        console.error('Failed to update password:', error);
        const errorMessage = error instanceof Error ? error.message : t('pages.user.accountPassword.failed');
        toast.error(errorMessage);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [t],
  );

  const updateAccountEmail = useCallback(
    async (newEmail: string): Promise<boolean> => {
      setIsUpdating(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ email: newEmail });

        if (error) {
          throw error;
        }

        toast.success(t('pages.user.accountEmail.confirmationSent'));
        return true;
      } catch (error) {
        console.error('Failed to update email:', error);
        const errorMessage = error instanceof Error ? error.message : t('pages.user.accountEmail.failed');
        toast.error(errorMessage);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [t],
  );

  return { isUpdating, updateAccountPassword, updateAccountEmail };
}
