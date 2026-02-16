'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '../../../db/db';
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
  const { user, isLoading } = db.useAuth();
  const isAuthenticated = !!user;
  const [isMounted, setIsMounted] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Track when component has mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track auth initialization to avoid acting on transient states.
  // db.useAuth() can briefly return {isLoading: false, user: null} before
  // the IndexedDB token read completes, especially during re-render cascades
  // triggered by other state updates (e.g., mobile screen detection).
  useEffect(() => {
    if (authInitialized) return;

    if (isLoading) {
      // Auth is actively loading — wait for it to finish
      return;
    }

    if (user) {
      // User is present — auth is definitely initialized
      setAuthInitialized(true);
      return;
    }

    // isLoading=false, user=null: could be transient or genuine.
    // Wait briefly to let auth state settle before acting.
    const timer = setTimeout(() => {
      setAuthInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoading, user, authInitialized]);

  useEffect(() => {
    // Don't redirect before auth is fully initialized and component is mounted
    if (!authInitialized || !isMounted) return;

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      const destination = redirectTo || `/auth?redirect=${encodeURIComponent(pathname)}`;
      router.push(destination);
    } else if (!requireAuth && isAuthenticated) {
      // User should not be authenticated but is (e.g., on login page while logged in)
      const destination = redirectTo || '/';
      router.push(destination);
    }
  }, [isAuthenticated, authInitialized, requireAuth, router, pathname, redirectTo, isMounted]);

  // Show loading spinner while checking auth status or before mount
  if (!authInitialized || !isMounted) {
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
