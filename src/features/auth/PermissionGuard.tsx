'use client';

import { ReactNode } from 'react';
import { usePermissions } from '../../../db/rbac/usePermissions';
import { ActionType, ResourceType, PermissionContext } from '../../../db/rbac/types';
import { AccessDenied } from '@/components/shared/AccessDenied';
import { Loader2 } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  action: ActionType;
  resource: ResourceType;
  context: PermissionContext;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * PermissionGuard
 * 
 * A wrapper component that protects its children based on RBAC permissions.
 * If the user has the required permission, the children are rendered.
 * Otherwise, a fallback (defaulting to AccessDenied) is shown.
 */
export function PermissionGuard({
  children,
  action,
  resource,
  context,
  fallback = <AccessDenied />,
  loadingComponent,
}: PermissionGuardProps) {
  const { can, isLoading } = usePermissions(context);

  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  if (!can(action, resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
