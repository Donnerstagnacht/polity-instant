/**
 * Auth Verification Hook
 * Business logic for email verification and user initialization
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { db } from '../../../../db/db';
import { useAuthStore } from '../auth';
import { useTranslation } from '@/hooks/use-translation';
import {
  checkAriaKaiExists,
  buildAriaKaiConversationTransactions,
  hasAriaKaiConversation,
} from './aria-kai-helpers';
import { buildUserInitializationTransactions } from './user-initialization-helpers';

interface VerificationResult {
  success: boolean;
  isNewUser: boolean;
  error?: string;
}

interface UseAuthVerificationReturn {
  isVerifying: boolean;
  verifyAndInitialize: (
    email: string,
    code: string,
    firstName?: string,
    lastName?: string
  ) => Promise<VerificationResult>;
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
    async (
      email: string,
      code: string,
      firstName?: string,
      lastName?: string
    ): Promise<VerificationResult> => {
      setIsVerifying(true);
      console.log('🔐 Starting verification and initialization flow');

      try {
        // Step 1: Verify the magic code
        console.log('📧 Verifying magic code for:', email);
        const verifySuccess = await verifyMagicCode(email, code);

        if (!verifySuccess) {
          console.log('❌ Verification failed');
          return { success: false, isNewUser: false, error: t('features.auth.errors.invalidOrExpiredCode') };
        }

        console.log('✅ Magic code verified successfully');

        // Step 2: Get the authenticated user
        const { user } = useAuthStore.getState();
        if (!user?.id) {
          console.error('❌ No user after verification');
          return { success: false, isNewUser: false, error: t('features.auth.errors.authenticationFailed') };
        }

        // Step 3: Wait for InstantDB to sync
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 4: Check if user is new
        console.log('🔍 Checking if user is new:', user.id);
        let userRecord: any;
        for (let attempt = 0; attempt < 2; attempt++) {
          const { data } = await db.queryOnce({
            $users: {
              $: { where: { id: user.id } },
            },
          });
          userRecord = data?.$users?.[0];
          if (userRecord) break;
          // Retry once if record not found (InstantDB sync may be delayed)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const now = Date.now();
        // Only treat as new if createdAt is present and recent; missing createdAt = existing user
        const userCreatedAt = userRecord?.createdAt
          ? typeof userRecord.createdAt === 'number'
            ? userRecord.createdAt
            : new Date(userRecord.createdAt).getTime()
          : 0;
        const isNewUser = userCreatedAt > 0 && (now - userCreatedAt < 2 * 60 * 1000);
        const hasNoName = userRecord ? (!userRecord.name || userRecord.name.trim() === '') : false;

        console.log('🔍 User check:', {
          userId: user.id,
          hasName: !!userRecord?.name,
          name: userRecord?.name,
          createdAt: userRecord?.createdAt,
          isNewUser,
          hasNoName,
          willInitialize: isNewUser || hasNoName,
        });

        // Step 5: Initialize new users with Aria & Kai conversation
        if (isNewUser || hasNoName) {
          console.log('🎉 New user detected, checking initialization needs');

          try {
            // Check that Aria & Kai exists before proceeding
            await checkAriaKaiExists();

            // Check if Aria & Kai conversation already exists
            const conversationExists = await hasAriaKaiConversation(user.id);

            // Build all transactions
            const transactions: any[] = [];

            // Add user initialization transactions if we have name data
            if (firstName && lastName) {
              console.log('👤 Adding user initialization with name:', { firstName, lastName });
              transactions.push(
                ...buildUserInitializationTransactions(user.id, firstName, lastName)
              );
            }

            // Add Aria & Kai conversation transactions only if it doesn't exist
            if (!conversationExists) {
              console.log('💬 Adding Aria & Kai conversation transactions');
              transactions.push(...buildAriaKaiConversationTransactions(user.id));
            } else {
              console.log('⏭️  Skipping Aria & Kai conversation - already exists');
            }

            // Execute all transactions if we have any
            if (transactions.length > 0) {
              console.log('📤 Executing', transactions.length, 'transactions');
              await db.transact(transactions);
              console.log('✅ User initialization complete');
              toast.success(t('features.auth.success.welcome'));
            } else {
              console.log('⏭️  No initialization needed');
            }
          } catch (error) {
            console.error('❌ Failed to initialize user:', error);
            const errorMessage =
              error instanceof Error && error.message.startsWith('features.auth.errors.')
                ? t(error.message as any)
                : error instanceof Error
                ? error.message
                : t('features.auth.errors.userInitializationFailed');
            toast.error(errorMessage);
            return { success: false, isNewUser: true, error: errorMessage };
          }
        } else {
          console.log('✅ Existing user, skipping initialization');
        }

        return { success: true, isNewUser: isNewUser || hasNoName };
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
