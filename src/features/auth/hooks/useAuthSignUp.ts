/**
 * Auth Sign-Up Hook
 * Business logic for email+password registration
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '../auth';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface SignUpResult {
  success: boolean;
  error?: string;
}

interface UseAuthSignUpReturn {
  isSigningUp: boolean;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
}

/**
 * Hook for handling email+password sign-up
 */
export function useAuthSignUp(): UseAuthSignUpReturn {
  const { t } = useTranslation();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { signUpWithPassword } = useAuthStore();

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      setIsSigningUp(true);

      try {
        const success = await signUpWithPassword(email, password);

        if (!success) {
          return { success: false, error: t('auth.signUp.signUpFailed') };
        }

        // After sign-up, Supabase auto-signs in (when confirmations are disabled).
        // Verify we have a session.
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
          return { success: false, error: t('features.auth.errors.authenticationFailed') };
        }

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('features.auth.errors.unexpectedError');
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsSigningUp(false);
      }
    },
    [signUpWithPassword, t],
  );

  return { isSigningUp, signUp };
}
