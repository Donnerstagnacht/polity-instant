'use client';

import { redirect } from 'next/navigation';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { useAuthStore } from '@/features/auth/auth';
import { useEffect } from 'react';

/**
 * /user page - redirects to the authenticated user's profile
 * This ensures users always see their own profile at /user
 */
export default function UserPage() {
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect to the user's own profile page
    if (user?.id) {
      redirect(`/user/${user.id}`);
    }
  }, [user]);

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold">Loading your profile...</h1>
          <p className="text-muted-foreground">Please wait while we redirect you.</p>
        </div>
      </div>
    </AuthGuard>
  );
}
