/**
 * Hook for managing amendment collaborators data and permissions
 */

import { useMemo } from 'react';
import db from '../../../../../db/db';

export interface Collaborator {
  id: string;
  role?: Role;
  status: string;
  createdAt: number;
  user: {
    id: string;
    name?: string;
    avatar?: string;
    handle?: string;
    contactEmail?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  scope: string;
  actionRights?: Array<{
    id: string;
    resource: string;
    action: string;
  }>;
}

export interface CollaboratorsData {
  collaborators: Collaborator[];
  roles: Role[];
  pendingRequests: Collaborator[];
  activeCollaborators: Collaborator[];
  pendingInvitations: Collaborator[];
  isAdmin: boolean;
  currentUserCollaboration: Collaborator | undefined;
  isLoading: boolean;
}

export function useCollaborators(
  amendmentId: string,
  currentUserId: string | undefined,
  searchQuery: string = ''
): CollaboratorsData {
  // Query amendment with collaborators and roles
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: {
        where: {
          id: amendmentId,
        },
      },
      amendmentRoleCollaborators: {
        user: {},
        role: {},
      },
      roles: {
        $: {
          where: {
            scope: 'amendment',
          },
        },
        actionRights: {},
      },
    },
  });

  const amendmentData = data?.amendments?.[0];
  const collaborators = (amendmentData?.amendmentRoleCollaborators || []) as Collaborator[];
  const roles = (amendmentData?.roles || []) as Role[];

  // Check if current user is admin (has 'manage' action right for 'amendments')
  const currentUserCollaboration = collaborators.find(c => c.user?.id === currentUserId);
  const isAdmin = currentUserCollaboration?.role?.actionRights?.some(
    right => right.resource === 'amendments' && right.action === 'manage'
  ) || false;

  // Filter collaborators based on search query
  const filteredCollaborators = useMemo(() => {
    if (!searchQuery.trim()) return collaborators;

    const query = searchQuery.toLowerCase();
    return collaborators.filter(collaboration => {
      const userName = collaboration.user?.name?.toLowerCase() || '';
      const userHandle = collaboration.user?.handle?.toLowerCase() || '';
      const roleName = collaboration.role?.name?.toLowerCase() || '';
      const status = collaboration.status?.toLowerCase() || '';
      return (
        userName.includes(query) ||
        userHandle.includes(query) ||
        roleName.includes(query) ||
        status.includes(query)
      );
    });
  }, [collaborators, searchQuery]);

  // Separate by status
  const pendingRequests = useMemo(
    () => filteredCollaborators.filter(c => c.status === 'requested'),
    [filteredCollaborators]
  );

  const activeCollaborators = useMemo(
    () => filteredCollaborators.filter(c => 
      c.status === 'member' || 
      c.status === 'admin' || 
      c.role?.name === 'Author'
    ),
    [filteredCollaborators]
  );

  const pendingInvitations = useMemo(
    () => filteredCollaborators.filter(c => c.status === 'invited'),
    [filteredCollaborators]
  );

  return {
    collaborators: filteredCollaborators,
    roles,
    pendingRequests,
    activeCollaborators,
    pendingInvitations,
    isAdmin,
    currentUserCollaboration,
    isLoading,
  };
}
