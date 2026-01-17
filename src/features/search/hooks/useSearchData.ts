import db from '../../../../db/db';

export function useSearchData() {
  const { user } = db.useAuth();
  const { data, isLoading } = db.useQuery({
    $users: {
      $: {
        where: {
          or: [
            { visibility: 'public' },
            { visibility: 'authenticated' },
          ],
        },
      },
      hashtags: {}, // Load hashtags for users
    },
    groups: {
      owner: {},
      hashtags: {},
      memberships: {
        user: {},
        role: {}, // Load role for displaying actual member role
      },
    },
    statements: {
      user: {},
    },
    blogs: {
      hashtags: {},
      votes: {
        user: {},
      },
      comments: {},
    },
    amendments: {
      hashtags: {},
      amendmentRoleCollaborators: {
        user: {},
        role: {},
      },
      votes: {
        user: {},
      },
      groupSupporters: {
        memberships: {},
      },
    },
    events: {
      organizer: {},
      group: {},
      participants: {
        user: {}, // Load user info to match current user
      },
      hashtags: {},
    },
  });

  return { data, isLoading, currentUserId: user?.id };
}
