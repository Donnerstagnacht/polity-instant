'use client';

import { ReactNode } from 'react';
import { usePermissions } from '../../../db/rbac/usePermissions';
import { AccessDenied } from '@/components/shared/AccessDenied';
import { Loader2 } from 'lucide-react';

interface CollaboratorGuardProps {
  children: ReactNode;
  amendment: any; // Amendment object with collaborators
  requireAuthor?: boolean;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * CollaboratorGuard
 * 
 * Protects content that requires amendment collaboration.
 * Optionally requires author rights if requireAuthor is true.
 */
export function CollaboratorGuard({
  children,
  amendment,
  requireAuthor = false,
  fallback = <AccessDenied />,
  loadingComponent,
}: CollaboratorGuardProps) {
  const { isCollaborator, isAuthor, isLoading } = usePermissions({ amendment });

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

  const hasAccess = requireAuthor ? isAuthor() : isCollaborator();

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
