'use client';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { LoginForm } from '@/features/auth/ui/LoginForm';

export default function AuthPage() {
  return (
    <AuthGuard requireAuth={false}>
      <LoginForm />
    </AuthGuard>
  );
}
