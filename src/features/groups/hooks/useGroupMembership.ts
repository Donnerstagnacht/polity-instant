import { useState } from 'react';
import db, { tx } from '../../../../db/db';
import { useAuthStore } from '@/features/auth/auth';
import { toast } from 'sonner';

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
      toast.success('Membership request sent successfully');
    } catch (error) {
      console.error('Failed to request membership:', error);
      toast.error('Failed to request membership. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the group
  const leaveGroup = async () => {
    if (!membership?.id) return;

    setIsLoading(true);
    try {
      // Query to get the group's conversation and user's participant record
      const conversationQuery = await db.queryOnce({
        conversations: {
          $: {
            where: {
              'group.id': groupId,
              type: 'group',
            },
          },
          participants: {
            $: {
              where: {
                'user.id': user?.id,
              },
            },
          },
        },
      });

      const groupConversation = conversationQuery?.data?.conversations?.[0];
      const participant = groupConversation?.participants?.[0];

      const transactions = [tx.groupMemberships[membership.id].delete()];

      // Remove user from group conversation if participant exists
      if (participant) {
        transactions.push(tx.conversationParticipants[participant.id].delete());
      }

      await db.transact(transactions);
      toast.success('Successfully left the group');
    } catch (error) {
      console.error('Failed to leave group:', error);
      toast.error('Failed to leave group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Accept invitation
  const acceptInvitation = async () => {
    if (!membership?.id || status !== 'invited' || !user?.id) return;

    setIsLoading(true);
    try {
      // Query to get the group's conversation
      const conversationQuery = await db.queryOnce({
        conversations: {
          $: {
            where: {
              'group.id': groupId,
              type: 'group',
            },
          },
        },
      });

      const groupConversation = conversationQuery?.data?.conversations?.[0];
      const conversationParticipantId = crypto.randomUUID();

      const transactions = [
        tx.groupMemberships[membership.id].update({
          status: 'member',
        }),
      ];

      // Add user to group conversation if it exists
      if (groupConversation) {
        transactions.push(
          tx.conversationParticipants[conversationParticipantId]
            .update({
              joinedAt: new Date().toISOString(),
            })
            .link({
              conversation: groupConversation.id,
              user: user.id,
            })
        );
      }

      await db.transact(transactions);
      toast.success('Successfully joined the group');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation. Please try again.');
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
