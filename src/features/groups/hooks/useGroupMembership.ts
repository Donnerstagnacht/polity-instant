import { useState } from 'react';
import db, { tx } from '../../../../db';
import { useAuthStore } from '@/features/auth/auth';

export type MembershipStatus = 'invited' | 'requested' | 'member' | 'admin';

export function useGroupMembership(groupId: string) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Query current user's membership status
  const { data, isLoading: queryLoading } = db.useQuery(
    user?.id
      ? {
          groupMemberships: {
            $: {
              where: {
                'user.id': user.id,
                'group.id': groupId,
              },
            },
            role: {},
          },
        }
      : { groupMemberships: {} }
  );

  // Query all memberships for member count (including both members and admins)
  const { data: allMembershipsData } = db.useQuery({
    groupMemberships: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
    },
  });

  // Handle multiple memberships - prioritize admin, then member, then invited, then requested
  const memberships = data?.groupMemberships || [];
  let membership = memberships[0];

  // If there are multiple memberships, prioritize by role/status
  if (memberships.length > 1) {
    const boardMemberMembership = memberships.find((m: any) => m.role?.name === 'Board Member');
    const memberMembership = memberships.find((m: any) => m.status === 'member');
    const invitedMembership = memberships.find((m: any) => m.status === 'invited');

    membership = boardMemberMembership || memberMembership || invitedMembership || membership;

    console.warn('Multiple memberships found for user in group:', {
      groupId,
      userId: user?.id,
      count: memberships.length,
      memberships: memberships.map((m: any) => ({
        id: m.id,
        status: m.status,
        role: m.role?.name,
      })),
      selected: { id: membership?.id, status: membership?.status, role: membership?.role?.name },
    });
  }

  // Filter to count only members and board members (excluding invited and requested)
  const memberCount =
    allMembershipsData?.groupMemberships?.filter(
      (m: any) => m.status === 'member' || m.role?.name === 'Board Member'
    ).length || 0;
  const status: MembershipStatus | null = (membership?.status as MembershipStatus) || null;
  const role = membership?.role?.name;
  const isMember = status === 'member' || role === 'Board Member' || role === 'Member';
  const isAdmin = role === 'Board Member';
  const hasRequested = status === 'requested';
  const isInvited = status === 'invited';

  // Request to join the group
  const requestJoin = async () => {
    if (!user?.id || membership) return;

    setIsLoading(true);
    try {
      const newMembershipId = crypto.randomUUID();
      await db.transact([
        tx.groupMemberships[newMembershipId]
          .update({
            createdAt: new Date().toISOString(),
            status: 'requested',
          })
          .link({
            user: user.id,
            group: groupId,
          }),
      ]);
    } catch (error) {
      console.error('Failed to request membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the group
  const leaveGroup = async () => {
    if (!membership?.id) return;

    setIsLoading(true);
    try {
      await db.transact([tx.groupMemberships[membership.id].delete()]);
    } catch (error) {
      console.error('Failed to leave group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Accept invitation
  const acceptInvitation = async () => {
    if (!membership?.id || status !== 'invited') return;

    setIsLoading(true);
    try {
      await db.transact([
        tx.groupMemberships[membership.id].update({
          status: 'member',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    membership,
    status,
    isMember,
    isAdmin,
    hasRequested,
    isInvited,
    memberCount,
    isLoading: queryLoading || isLoading,
    requestJoin,
    leaveGroup,
    acceptInvitation,
  };
}
