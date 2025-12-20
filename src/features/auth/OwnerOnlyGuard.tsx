'use client';

import { ReactNode } from 'react';
import { db } from '../../../db/db';
import { AccessDenied } from '@/components/shared/AccessDenied';
import { Loader2 } from 'lucide-react';

interface OwnerOnlyGuardProps {
  children: ReactNode;
  targetUserId: string;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * OwnerOnlyGuard
 * 
 * Protects content that should only be accessible to the user viewing their own profile/data.
 * Ensures that authUser.id matches targetUserId.
 */
export function OwnerOnlyGuard({
  children,
  targetUserId,
  fallback = <AccessDenied />,
  loadingComponent,
}: OwnerOnlyGuardProps) {
  const { user: authUser, isLoading } = db.useAuth();

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </>
    );
  }

  if (!authUser || authUser.id !== targetUserId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
