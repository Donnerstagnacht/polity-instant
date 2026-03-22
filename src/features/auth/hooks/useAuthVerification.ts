/**
 * Auth Verification Hook
 * Business logic for email verification and user initialization
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '../auth';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface VerificationResult {
  success: boolean;
  isNewUser: boolean;
  error?: string;
}

interface UseAuthVerificationReturn {
  isVerifying: boolean;
  verifyAndInitialize: (email: string, code: string) => Promise<VerificationResult>;
}

/**
 * Hook for handling email verification and new user initialization
 * Orchestrates the verification flow including Aria & Kai conversation setup
 */
export function useAuthVerification(): UseAuthVerificationReturn {
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyMagicCode } = useAuthStore();

  const verifyAndInitialize = useCallback(
    async (email: string, code: string): Promise<VerificationResult> => {
      setIsVerifying(true);
      console.log('🔐 Starting verification and initialization flow');

      try {
        // Step 1: Verify the magic code via Supabase
        console.log('📧 Verifying magic code for:', email);
        const verifySuccess = await verifyMagicCode(email, code);

        if (!verifySuccess) {
          console.log('❌ Verification failed');
          return {
            success: false,
            isNewUser: false,
            error: t('features.auth.errors.invalidOrExpiredCode'),
          };
        }

        console.log('✅ Magic code verified successfully');

        // Step 2: Get the authenticated user from Supabase session
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          console.error('❌ No user after verification');
          return {
            success: false,
            isNewUser: false,
            error: t('features.auth.errors.authenticationFailed'),
          };
        }

        console.log('✅ User verified:', user.id);

        // Detect new user: created_at within the last 60 seconds means first-time signup
        const createdAt = new Date(user.created_at).getTime();
        const now = Date.now();
        const isNewUser = now - createdAt < 60_000;

        return { success: true, isNewUser };
      } catch (error) {
        console.error('❌ Verification flow failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : t('features.auth.errors.unexpectedError');
        toast.error(errorMessage);
        return { success: false, isNewUser: false, error: errorMessage };
      } finally {
        setIsVerifying(false);
      }
    },
    [verifyMagicCode]
  );

  return {
    isVerifying,
    verifyAndInitialize,
  };
}
