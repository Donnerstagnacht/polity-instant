/**
 * Hook for searching and filtering memberships
 */

import { useMemo } from 'react';
import type { GroupMembershipWithUser } from '../types/group.types';

export function useMembershipSearch(memberships: GroupMembershipWithUser[], searchQuery: string) {
  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return memberships;

    const query = searchQuery.toLowerCase();
    return memberships.filter(membership => {
      const userName = [membership.user?.first_name, membership.user?.last_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const userHandle = membership.user?.handle?.toLowerCase() || '';
      const role = membership.role?.name?.toLowerCase() || '';
      const status = membership.status?.toLowerCase() || '';
      return (
        userName.includes(query) ||
        userHandle.includes(query) ||
        role.includes(query) ||
        status.includes(query)
      );
    });
  }, [memberships, searchQuery]);

  const pendingRequests = useMemo(
    () => filteredMemberships.filter(m => m.status === 'pending' || m.status === 'requested'),
    [filteredMemberships]
  );

  const activeMembers = useMemo(
    () =>
      filteredMemberships.filter(
        m => m.status === 'active' || m.status === 'member' || m.role?.name === 'Board Member'
      ),
    [filteredMemberships]
  );

  const pendingInvitations = useMemo(
    () => filteredMemberships.filter(m => m.status === 'invited'),
    [filteredMemberships]
  );

  return {
    filteredMemberships,
    pendingRequests,
    activeMembers,
    pendingInvitations,
  };
}
