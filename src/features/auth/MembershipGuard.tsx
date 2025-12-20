'use client';

import { ReactNode } from 'react';
import { usePermissions } from '../../../db/rbac/usePermissions';
import { AccessDenied } from '@/components/shared/AccessDenied';
import { Loader2 } from 'lucide-react';

interface MembershipGuardProps {
  children: ReactNode;
  groupId: string;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * MembershipGuard
 * 
 * Protects content that requires group membership.
 * Optionally requires admin rights if requireAdmin is true.
 */
export function MembershipGuard({
  children,
  groupId,
  requireAdmin = false,
  fallback = <AccessDenied />,
  loadingComponent,
}: MembershipGuardProps) {
  const { isMember, canManage, isLoading } = usePermissions({ groupId });

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

  const hasAccess = requireAdmin ? canManage('groups') : isMember();

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
