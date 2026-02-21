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

export function useUserSearch(
  existingCollaboratorIds: string[],
  searchQuery: string = ''
): { users: SearchableUser[]; isLoading: boolean } {
  const { allUsers: usersData, isLoading } = useAmendmentState({
    includeAllUsers: true,
  });

  // Filter users for invite search
  const filteredUsers = useMemo(() => {
    const allUsers = usersData || [];
    
    return allUsers.filter(user => {
      if (!user?.id) return false;
      if (existingCollaboratorIds.includes(user.id)) return false;

      const query = searchQuery.toLowerCase();
      if (!query) return true;

      return (
        [user.first_name, user.last_name].filter(Boolean).join(' ').toLowerCase().includes(query) ||
        user.handle?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }) as SearchableUser[];
  }, [usersData, existingCollaboratorIds, searchQuery]);

  return {
    users: filteredUsers,
    isLoading,
  };
}
