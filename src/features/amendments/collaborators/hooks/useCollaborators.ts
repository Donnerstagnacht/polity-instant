/**
 * Hook for managing amendment collaborators data and permissions
 */

import { useMemo } from 'react';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import type { AmendmentCollaboratorRow, AmendmentRoleRow } from '@/zero/amendments/queries';

export type Collaborator = AmendmentCollaboratorRow;
export type Role = AmendmentRoleRow;

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

  const collaborators = collabData || [];
  const roles = rolesData || [];

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
    roles,
    pendingRequests,
    activeCollaborators,
    pendingInvitations,
    isAdmin,
    currentUserCollaboration,
    isLoading,
  };
}
