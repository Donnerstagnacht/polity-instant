/**
 * Auth Login Hook
 * Business logic for sending magic link emails
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../auth';
import { useTranslation } from '@/hooks/use-translation';

interface LoginResult {
  success: boolean;
  error?: string;
}

export interface UseAuthLoginOptions {
  /**
   * Optional callback to execute before sending the magic link
   * Can be used for analytics, validation, etc.
   */
  beforeSend?: (email: string) => void | Promise<void>;

  /**
   * Optional callback to execute after successfully sending the magic link
   * Can be used for analytics, tracking, etc.
   */
  afterSend?: (email: string) => void | Promise<void>;

  /**
   * Optional callback to execute if sending fails
   * Can be used for error tracking, analytics, etc.
   */
  onError?: (email: string, error: Error) => void | Promise<void>;
}

interface UseAuthLoginReturn {
  isSending: boolean;
  sendMagicLink: (email: string) => Promise<LoginResult>;
}

/**
 * Hook for handling magic link email sending
 * Provides extension points for additional business logic
 */
export function useAuthLogin(options: UseAuthLoginOptions = {}): UseAuthLoginReturn {
  const { t } = useTranslation();
  const { beforeSend, afterSend, onError } = options;
  const [isSending, setIsSending] = useState(false);
  const { requestMagicCode } = useAuthStore();

  const sendMagicLink = useCallback(
    async (email: string): Promise<LoginResult> => {
      setIsSending(true);
      console.log('📧 Starting magic link send flow for:', email);

      try {
        // Execute pre-send hook if provided
        if (beforeSend) {
          console.log('⚡ Executing beforeSend hook');
          await beforeSend(email);
        }

        // Send the magic link
        console.log('📤 Requesting magic code');
        const success = await requestMagicCode(email);

        if (!success) {
          console.log('❌ Failed to send magic link');
          const errorMsg = t('features.auth.errors.magicLinkFailed');
          const error = new Error(errorMsg);
          if (onError) {
            await onError(email, error);
          }
          return { success: false, error: errorMsg };
        }

        console.log('✅ Magic link sent successfully');

        // Execute post-send hook if provided
        if (afterSend) {
          console.log('⚡ Executing afterSend hook');
          await afterSend(email);
        }

        return { success: true };
      } catch (error) {
        console.error('❌ Magic link send flow failed:', error);
        const errorMessage = error instanceof Error ? error.message : t('features.auth.errors.unexpectedError');
        
        if (onError && error instanceof Error) {
          await onError(email, error);
        }
        
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsSending(false);
      }
    },
    [requestMagicCode, beforeSend, afterSend, onError]
  );

  return {
    isSending,
    sendMagicLink,
  };
}
