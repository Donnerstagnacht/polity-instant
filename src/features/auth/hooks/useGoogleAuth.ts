import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuthStore } from '../auth';

type GoogleAuthMode = 'sign-in' | 'sign-up';

interface UseGoogleAuthReturn {
  isRedirecting: boolean;
  continueWithGoogle: (mode: GoogleAuthMode) => Promise<boolean>;
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const { t } = useTranslation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { signInWithGoogle } = useAuthStore();

  const continueWithGoogle = useCallback(
    async (_mode: GoogleAuthMode): Promise<boolean> => {
      setIsRedirecting(true);

      try {
        const success = await signInWithGoogle();

        if (!success) {
          return false;
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('features.auth.errors.unexpectedError');
        toast.error(errorMessage);
        return false;
      } finally {
        setIsRedirecting(false);
      }
    },
    [signInWithGoogle, t],
  );

  return { isRedirecting, continueWithGoogle };
}