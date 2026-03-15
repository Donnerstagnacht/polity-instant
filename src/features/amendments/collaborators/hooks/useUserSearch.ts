/**
 * Hook for searching users to invite as collaborators
 */

import { useMemo } from 'react';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';

export interface SearchableUser {
  id: string;
  name?: string;
  avatar?: string;
  handle?: string;
  contactEmail?: string;
}

function buildDisplayName(user: {
  first_name?: string | null;
  last_name?: string | null;
  handle?: string | null;
}): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.handle || 'Unnamed User';
}

export function useUserSearch(existingCollaboratorIds: string[]): {
  users: SearchableUser[];
  isLoading: boolean;
} {
  const { allUsers: usersData, isLoading } = useAmendmentState({
    includeAllUsers: true,
  });

  const filteredUsers = useMemo(() => {
    const allUsers = usersData || [];

    return allUsers
      .filter(user => {
        if (!user?.id) return false;
        if (existingCollaboratorIds.includes(user.id)) return false;
        return true;
      })
      .map(user => ({
        id: user.id,
        name: buildDisplayName(user),
        avatar: user.avatar ?? undefined,
        handle: user.handle ?? undefined,
        contactEmail: user.email ?? undefined,
      }));
  }, [usersData, existingCollaboratorIds]);

  return {
    users: filteredUsers,
    isLoading,
  };
}
