/**
 * Auth Sign-In Hook
 * Business logic for email+password sign-in and magic link fallback
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '../auth';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface SignInResult {
  success: boolean;
  isNewUser: boolean;
  error?: string;
}

interface UseAuthSignInReturn {
  isSigningIn: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook for handling email+password sign-in
 * Also provides magic link fallback and password reset
 */
export function useAuthSignIn(): UseAuthSignInReturn {
  const { t } = useTranslation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signInWithPassword, requestMagicCode, resetPassword: storeResetPassword } = useAuthStore();

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      setIsSigningIn(true);

      try {
        const success = await signInWithPassword(email, password);

        if (!success) {
          return {
            success: false,
            isNewUser: false,
            error: t('auth.signIn.invalidCredentials'),
          };
        }

        // Check if new user (created_at within last 60 seconds)
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
          return { success: false, isNewUser: false, error: t('features.auth.errors.authenticationFailed') };
        }

        const createdAt = new Date(user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60_000;

        return { success: true, isNewUser };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('features.auth.errors.unexpectedError');
        toast.error(errorMessage);
        return { success: false, isNewUser: false, error: errorMessage };
      } finally {
        setIsSigningIn(false);
      }
    },
    [signInWithPassword, t],
  );

  const sendMagicLink = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setIsSigningIn(true);
      try {
        const success = await requestMagicCode(email);
        if (!success) {
          return { success: false, error: t('features.auth.errors.magicLinkFailed') };
        }
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('features.auth.errors.unexpectedError');
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsSigningIn(false);
      }
    },
    [requestMagicCode, t],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setIsSigningIn(true);
      try {
        const success = await storeResetPassword(email);
        if (!success) {
          return { success: false, error: t('auth.forgotPassword.sendFailed') };
        }
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('features.auth.errors.unexpectedError');
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsSigningIn(false);
      }
    },
    [storeResetPassword, t],
  );

  return { isSigningIn, signIn, sendMagicLink, resetPassword };
}
