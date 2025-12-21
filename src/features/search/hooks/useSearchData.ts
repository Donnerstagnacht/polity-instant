import db from '../../../../db/db';

export function useSearchData() {
  const { data, isLoading } = db.useQuery({
    $users: {
      $: {
        where: {
          visibility: 'public',
        },
      },
      hashtags: {}, // Load hashtags for users
    },
    groups: {
      owner: {},
      hashtags: {},
    },
    statements: {
      user: {},
    },
    blogs: {
      hashtags: {},
    },
    amendments: {
      hashtags: {},
    },
    events: {
      organizer: {},
      group: {},
      participants: {},
      hashtags: {},
    },
  });

  return { data, isLoading };
}
