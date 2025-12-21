/**
 * Hook for searching users to invite as collaborators
 */

import { useMemo } from 'react';
import db from '../../../../../db/db';

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
  // Query all users for user search
  const { data, isLoading } = db.useQuery({
    $users: {},
  });

  // Filter users for invite search
  const filteredUsers = useMemo(() => {
    const allUsers = data?.$users || [];
    
    return allUsers.filter(user => {
      if (!user?.id) return false;
      if (existingCollaboratorIds.includes(user.id)) return false;

      const query = searchQuery.toLowerCase();
      if (!query) return true;

      return (
        user.name?.toLowerCase().includes(query) ||
        user.handle?.toLowerCase().includes(query) ||
        user.contactEmail?.toLowerCase().includes(query)
      );
    }) as SearchableUser[];
  }, [data?.$users, existingCollaboratorIds, searchQuery]);

  return {
    users: filteredUsers,
    isLoading,
  };
}
