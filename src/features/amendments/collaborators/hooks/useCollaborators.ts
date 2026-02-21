/**
 * Hook for managing amendment collaborators data and permissions
 */

import { useMemo } from 'react';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';

export interface Collaborator {
  id: string;
  role_id: string;
  status: string;
  created_at: number;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    handle?: string;
    email?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  scope: string;
  action_rights?: Array<{
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
  const {
    amendment: amendmentData,
    collaborators: collabData,
    roles: rolesData,
    isLoading,
  } = useAmendmentState({
    amendmentId,
    includeRoles: true,
  });

  const collaborators = (collabData || []) as unknown as Collaborator[];
  const roles = (rolesData || []) as unknown as Role[];

  // Check if current user is admin (has 'manage' action right for 'amendments')
  const currentUserCollaboration = collaborators.find(c => c.user?.id === currentUserId);
  const currentUserRole = roles.find(r => r.id === currentUserCollaboration?.role_id);
  const isAdmin = currentUserRole?.action_rights?.some(
    right => right.resource === 'amendments' && right.action === 'manage'
  ) || false;

  // Filter collaborators based on search query
  const filteredCollaborators = useMemo(() => {
    if (!searchQuery.trim()) return collaborators;

    const query = searchQuery.toLowerCase();
    return collaborators.filter(collaboration => {
      const firstName = collaboration.user?.first_name?.toLowerCase() || '';
      const lastName = collaboration.user?.last_name?.toLowerCase() || '';
      const userHandle = collaboration.user?.handle?.toLowerCase() || '';
      const matchedRole = roles.find(r => r.id === collaboration.role_id);
      const roleName = matchedRole?.name?.toLowerCase() || '';
      const status = collaboration.status?.toLowerCase() || '';
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        userHandle.includes(query) ||
        roleName.includes(query) ||
        status.includes(query)
      );
    });
  }, [collaborators, roles, searchQuery]);

  // Separate by status
  const pendingRequests = useMemo(
    () => filteredCollaborators.filter(c => c.status === 'requested'),
    [filteredCollaborators]
  );

  const activeCollaborators = useMemo(
    () => filteredCollaborators.filter(c => {
      const matchedRole = roles.find(r => r.id === c.role_id);
      return (
        c.status === 'member' ||
        c.status === 'admin' ||
        matchedRole?.name === 'Author'
      );
    }),
    [filteredCollaborators, roles]
  );

  const pendingInvitations = useMemo(
    () => filteredCollaborators.filter(c => c.status === 'invited'),
    [filteredCollaborators]
  );

  return {
    collaborators: filteredCollaborators,
    roles: roles as unknown as Role[],
    pendingRequests,
    activeCollaborators,
    pendingInvitations,
    isAdmin,
    currentUserCollaboration,
    isLoading,
  };
}
