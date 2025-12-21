import { useMemo } from 'react';
import db from '../../../../db/db';

/**
 * Hook to query amendment data with all related entities
 */
export function useAmendmentData(amendmentId?: string) {
  const { data, isLoading, error } = db.useQuery(
    amendmentId
      ? {
          amendments: {
            $: { where: { id: amendmentId } },
            owner: {},
            groups: {},
            amendmentRoleCollaborators: {
              user: {},
              role: {
                actionRights: {},
              },
            },
            roles: {
              $: {
                where: {
                  scope: 'amendment',
                },
              },
              actionRights: {},
            },
            changeRequests: {
              creator: {},
              votes: {},
            },
            threads: {
              creator: {},
              comments: {},
            },
          },
        }
      : null
  );

  const amendment = useMemo(() => data?.amendments?.[0] || null, [data]);
  const collaborators = useMemo(() => amendment?.amendmentRoleCollaborators || [], [amendment]);
  const changeRequests = useMemo(() => amendment?.changeRequests || [], [amendment]);
  const discussions = useMemo(() => amendment?.threads || [], [amendment]);

  const collaboratorStats = useMemo(() => {
    const stats = {
      total: collaborators.length,
      admins: 0,
      members: 0,
      invited: 0,
    };

    collaborators.forEach((collab: any) => {
      if (collab.status === 'admin') stats.admins++;
      if (collab.status === 'member') stats.members++;
      if (collab.status === 'invited') stats.invited++;
    });

    return stats;
  }, [collaborators]);

  return {
    amendment,
    collaborators,
    changeRequests,
    discussions,
    collaboratorStats,
    isLoading,
    error,
  };
}

/**
 * Hook to query amendment collaborators
 */
export function useAmendmentCollaborators(amendmentId?: string) {
  const { data, isLoading } = db.useQuery(
    amendmentId
      ? {
          amendmentCollaborators: {
            $: {
              where: {
                'amendment.id': amendmentId,
              },
            },
            user: {},
            role: {},
          },
        }
      : null
  );

  const collaborators = useMemo(() => data?.amendmentCollaborators || [], [data]);

  return {
    collaborators,
    isLoading,
  };
}
