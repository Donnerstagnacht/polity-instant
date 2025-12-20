'use client';

import { ReactNode } from 'react';
import { usePermissions } from '../../../db/rbac/usePermissions';
import { AccessDenied } from '@/components/shared/AccessDenied';
import { Loader2 } from 'lucide-react';

interface ParticipationGuardProps {
  children: ReactNode;
  eventId: string;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * ParticipationGuard
 * 
 * Protects content that requires event participation.
 * Optionally requires admin rights if requireAdmin is true.
 */
export function ParticipationGuard({
  children,
  eventId,
  requireAdmin = false,
  fallback = <AccessDenied />,
  loadingComponent,
}: ParticipationGuardProps) {
  const { isParticipant, canManage, isLoading } = usePermissions({ eventId });

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

  const hasAccess = requireAdmin ? canManage('events') : isParticipant();

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
