export const groupPageTranslations = {
  settings: 'Group Settings',
  loading: 'Loading amendments...',
  notFound: {
    title: 'Group Not Found',
    description: "The group you're looking for doesn't exist or has been removed.",
  },
  childGroups: {
    title: 'Child Groups',
    description: 'Groups that are subordinate to this group',
  },
  memberships: {
    title: 'Members',
    searchPlaceholder: 'Search members by name, role, or status...',
    noMembers: 'No members found',
    inviteMember: 'Invite Member',
    manageMemberships: 'Manage Memberships',
  },
  events: {
    title: 'Events',
    searchPlaceholder: 'Search events...',
    hashtagPlaceholder: 'Enter hashtag to filter...',
    noEvents: 'No events found',
    createEvent: 'Create Event',
  },
  network: {
    title: 'Network',
    searchPlaceholder: 'Search relationships by group name...',
    direction: 'Direction',
    filterAll: 'All',
    filterParent: 'Parent',
    filterChild: 'Child',
    noRelationships: 'No relationships found',
  },
  amendments: {
    title: 'Amendments',
    titleWithGroup: '{{groupName}} - Amendments',
    searchPlaceholder: 'Search amendments...',
    noAmendments: 'No amendments found for this group.',
    noMatchingAmendments: 'No amendments match your search criteria.',
    createAmendment: 'New Amendment',
    count: '{{count}} amendment found',
    countPlural: '{{count}} amendments found',
    statusBreakdown: {
      passed: 'Passed',
      underReview: 'Under Review',
      drafting: 'Drafting',
      rejected: 'Rejected',
      allStatuses: 'All statuses',
    },
  },
  editor: {
    title: 'Documents',
    searchPlaceholder: 'Search documents...',
    noDocuments: 'No documents found',
    createDocument: 'Create Document',
    inviteCollaborator: {
      title: 'Invite Collaborator',
      searchPlaceholder: 'Search by name, handle, or email...',
      noResults: 'No users found',
      invite: 'Invite',
      cancel: 'Cancel',
    },
  },
  operation: {
    title: 'Operation',
  },
  notifications: {
    title: 'Notifications',
    
  },
  edit: {
    title: 'Edit Group',
    save: 'Save Changes',
    cancel: 'Cancel',
  },
  relationships: {
    title: 'Relationships',
    manage: 'Manage',
    remove: 'Remove',
  },
} as const;
