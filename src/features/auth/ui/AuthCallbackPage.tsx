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
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          throw new Error(t('auth.callback.failed'));
        }

        const createdAt = new Date(user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60_000;

        if (isNewUser) {
          sessionStorage.setItem('polity_onboarding', 'true');
        }

        if (isActive) {
          navigate({ to: '/' });
        }
      } catch (error) {
        console.error('Failed to complete Google auth:', error);

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