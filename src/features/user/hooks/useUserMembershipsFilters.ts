import { useState, useMemo } from 'react';

// Co-located types
export interface UseUserMembershipsFiltersOptions {
  memberships: any[];
  participations: any[];
  collaborations: any[];
  blogRelations: any[];
}

export interface MembershipsByStatus {
  invited: any[];
  active: any[];
  requested: any[];
}

export interface UseUserMembershipsFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Filtered results
  filteredMemberships: any[];
  filteredParticipations: any[];
  filteredCollaborations: any[];
  filteredBlogRelations: any[];
  
  // Separated by status
  membershipsByStatus: MembershipsByStatus;
  participationsByStatus: MembershipsByStatus;
  collaborationsByStatus: MembershipsByStatus;
  blogRelationsByStatus: MembershipsByStatus;
}

export function useUserMembershipsFilters({
  memberships,
  participations,
  collaborations,
  blogRelations,
}: UseUserMembershipsFiltersOptions): UseUserMembershipsFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter memberships based on search query
  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return memberships;

    const query = searchQuery.toLowerCase();
    return memberships.filter((membership: any) => {
      const groupName = membership.group?.name?.toLowerCase() || '';
      const groupDescription = membership.group?.description?.toLowerCase() || '';
      const role = membership.role?.name?.toLowerCase() || '';
      const status = membership.status?.toLowerCase() || '';
      return (
        groupName.includes(query) ||
        groupDescription.includes(query) ||
        role.includes(query) ||
        status.includes(query)
      );
    });
  }, [memberships, searchQuery]);

  // Filter participations
  const filteredParticipations = useMemo(() => {
    if (!searchQuery.trim()) return participations;

    const query = searchQuery.toLowerCase();
    return participations.filter((participation: any) => {
      const eventTitle = participation.event?.title?.toLowerCase() || '';
      const status = participation.status?.toLowerCase() || '';
      return eventTitle.includes(query) || status.includes(query);
    });
  }, [participations, searchQuery]);

  // Filter collaborations
  const filteredCollaborations = useMemo(() => {
    if (!searchQuery.trim()) return collaborations;

    const query = searchQuery.toLowerCase();
    return collaborations.filter((collaboration: any) => {
      const amendmentTitle = collaboration.amendment?.title?.toLowerCase() || '';
      const status = collaboration.status?.toLowerCase() || '';
      return amendmentTitle.includes(query) || status.includes(query);
    });
  }, [collaborations, searchQuery]);

  // Filter blog relations
  const filteredBlogRelations = useMemo(() => {
    if (!searchQuery.trim()) return blogRelations;

    const query = searchQuery.toLowerCase();
    return blogRelations.filter((relation: any) => {
      const blogTitle = relation.blog?.title?.toLowerCase() || '';
      const role = relation.role?.name?.toLowerCase() || '';
      const status = relation.status?.toLowerCase() || '';
      return blogTitle.includes(query) || role.includes(query) || status.includes(query);
    });
  }, [blogRelations, searchQuery]);

  // Separate memberships by status
  const membershipsByStatus: MembershipsByStatus = useMemo(
    () => ({
      invited: filteredMemberships.filter((m: any) => m.status === 'invited'),
      active: filteredMemberships.filter(
        (m: any) => m.status === 'member' || m.status === 'admin'
      ),
      requested: filteredMemberships.filter((m: any) => m.status === 'requested'),
    }),
    [filteredMemberships]
  );

  // Separate participations by status
  const participationsByStatus: MembershipsByStatus = useMemo(
    () => ({
      invited: filteredParticipations.filter((p: any) => p.status === 'invited'),
      active: filteredParticipations.filter(
        (p: any) => p.status === 'member' || p.status === 'admin'
      ),
      requested: filteredParticipations.filter((p: any) => p.status === 'requested'),
    }),
    [filteredParticipations]
  );

  // Separate collaborations by status
  const collaborationsByStatus: MembershipsByStatus = useMemo(
    () => ({
      invited: filteredCollaborations.filter((c: any) => c.status === 'invited'),
      active: filteredCollaborations.filter(
        (c: any) => c.status === 'member' || c.status === 'admin' || c.role?.name === 'Author'
      ),
      requested: filteredCollaborations.filter((c: any) => c.status === 'requested'),
    }),
    [filteredCollaborations]
  );

  // Separate blog relations by status
  const blogRelationsByStatus: MembershipsByStatus = useMemo(
    () => ({
      invited: filteredBlogRelations.filter((b: any) => b.status === 'invited'),
      active: filteredBlogRelations.filter(
        (b: any) => b.status === 'writer' || b.status === 'owner' || b.status === 'member'
      ),
      requested: filteredBlogRelations.filter((b: any) => b.status === 'requested'),
    }),
    [filteredBlogRelations]
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredMemberships,
    filteredParticipations,
    filteredCollaborations,
    filteredBlogRelations,
    membershipsByStatus,
    participationsByStatus,
    collaborationsByStatus,
    blogRelationsByStatus,
  };
}
