'use client';

import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/features/shared/ui/ui/loading-spinner';
import { useTranslation } from '@/features/shared/hooks/use-translation';

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const finalizeGoogleAuth = async () => {
      try {
        const supabase = createClient();
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
          try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.warn('Code exchange failed, falling back to session check:', error.message);
            }
          } catch (exchangeError) {
            // PKCE code verifier can be lost during cross-domain redirects.
            // Fall back to checking if the session was established via onAuthStateChange.
            console.warn('Code exchange threw, falling back to session check:', exchangeError);
          }
        }

        // Try getSession first — it may already be set via onAuthStateChange / auto-detection
        let user = (await supabase.auth.getUser()).data.user;

        if (!user?.id) {
          // Last resort: wait briefly for onAuthStateChange to propagate
          await new Promise(resolve => setTimeout(resolve, 500));
          user = (await supabase.auth.getUser()).data.user;
        }

        if (!user?.id) {
          throw new Error(t('auth.callback.failed'));
        }

        const createdAt = new Date(user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 300_000;

        if (isNewUser) {
          sessionStorage.setItem('polity_onboarding', 'true');
        }

        if (isActive) {
          navigate({ to: '/' });
        }
      } catch (error) {
        console.error('Failed to complete auth callback:', error);

        if (isActive) {
          toast.error(t('auth.callback.failed'));
          navigate({ to: '/auth/sign-in' });
        }
      }
    };

    void finalizeGoogleAuth();

    return () => {
      isActive = false;
    };
  }, [navigate, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <LoadingSpinner size="lg" text={t('auth.callback.loading')} />
      </div>
    </div>
  );
}