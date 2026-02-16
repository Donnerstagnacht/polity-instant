'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { LoginForm } from '@/features/auth/ui/LoginForm';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  // Validate redirect path to prevent open redirect attacks
  const redirectTo =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';

  return (
    <AuthGuard requireAuth={false} redirectTo={redirectTo}>
      <LoginForm />
    </AuthGuard>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  );
}
