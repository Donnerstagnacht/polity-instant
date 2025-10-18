'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/instant/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * AuthGuard component for protecting routes based on authentication status
 */
export function AuthGuard({ children, requireAuth = true, redirectTo, fallback }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      const destination = redirectTo || `/auth?redirect=${encodeURIComponent(pathname)}`;
      router.push(destination);
    } else if (!requireAuth && isAuthenticated) {
      // User should not be authenticated but is (e.g., on login page while logged in)
      const destination = redirectTo || '/dashboard';
      router.push(destination);
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname, redirectTo]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback if auth requirement not met
  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  if (!requireAuth && isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * HOC for protecting pages that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string; fallback?: ReactNode }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requireAuth={true} {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * HOC for protecting pages that should only be accessible when NOT authenticated (like login page)
 */
export function withoutAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string; fallback?: ReactNode }
) {
  return function UnauthenticatedComponent(props: P) {
    return (
      <AuthGuard requireAuth={false} {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
