import { useState } from 'react';
import { useUserMembershipInGroup } from '@/zero/groups/useGroupState';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export type MembershipStatus = 'invited' | 'requested' | 'member' | 'admin';

function isAdminRole(roleName: string | null | undefined) {
  return roleName === 'Admin' || roleName === 'Board Member';
}

function isMemberRole(roleName: string | null | undefined) {
  return roleName === 'Member' || isAdminRole(roleName);
}

function normalizeMembershipStatus(
  status: string | null | undefined,
  roleName: string | null | undefined
): MembershipStatus | null {
  if (status === 'requested' || status === 'invited') {
    return status;
  }

  if (status === 'admin' || isAdminRole(roleName)) {
    return 'admin';
  }

  if (status === 'active' || status === 'member' || isMemberRole(roleName)) {
    return 'member';
  }

  return null;
}

export function useGroupMembership(groupId: string) {
  const { user } = useAuth();
  const {
    memberships: membershipsData,
    allMemberships: allMembershipsData,
    isLoading: queryLoading,
  } = useUserMembershipInGroup(user?.id, groupId);
  const { joinGroup, leaveGroup: leaveGroupAction, updateMemberRole } = useGroupActions();
  const [isLoading, setIsLoading] = useState(false);

  const data = { groupMemberships: membershipsData || [] };

  // Handle multiple memberships - prioritize admin, then member, then invited, then requested
  const memberships = data?.groupMemberships || [];
  let membership = memberships[0];

  // If there are multiple memberships, prioritize by role/status
  if (memberships.length > 1) {
    const adminMembership = memberships.find(
      m => m.status === 'admin' || isAdminRole(m.role?.name)
    );
    const memberMembership = memberships.find(
      m => m.status === 'active' || m.status === 'member' || isMemberRole(m.role?.name)
    );
    const invitedMembership = memberships.find(m => m.status === 'invited');
    const requestedMembership = memberships.find(m => m.status === 'requested');

    membership =
      adminMembership || memberMembership || invitedMembership || requestedMembership || membership;

    console.warn('Multiple memberships found for user in group:', {
      groupId,
      userId: user?.id,
      count: memberships.length,
      memberships: memberships.map(m => ({
        id: m.id,
        status: m.status,
        role: m.role?.name,
      })),
      selected: { id: membership?.id, status: membership?.status, role: membership?.role?.name },
    });
  }

  // Filter to count only members and board members (excluding invited and requested)
  const memberCount =
    (allMembershipsData || []).filter(
      m =>
        m.status === 'active' ||
        m.status === 'member' ||
        m.status === 'admin' ||
        isMemberRole(m.role?.name)
    ).length || 0;
  const status = normalizeMembershipStatus(membership?.status, membership?.role?.name);
  const isMember = status === 'member' || status === 'admin';
  const isAdmin = status === 'admin';
  const hasRequested = status === 'requested';
  const isInvited = status === 'invited';

  // Request to join the group
  const requestJoin = async () => {
    if (!user?.id || membership) return;

    setIsLoading(true);
    try {
      const newMembershipId = crypto.randomUUID();

      await joinGroup({
        id: newMembershipId,
        status: 'requested',
        user_id: user.id,
        group_id: groupId,
        visibility: '',
        role_id: null,
      });

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
      // Conversation cleanup handled separately if needed
      await leaveGroupAction({ id: membership.id });
      // Conversation membership: Requires conversation_participant record cleanup. Deferred until conversation-group linking is implemented.

      // Show different message based on membership status
      if (status === 'requested') {
        toast.success('Request successfully withdrawn.');
      } else {
        toast.success('Successfully left the group');
      }
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
      // Conversation membership handled separately if needed
      await updateMemberRole({
        id: membership.id,
        status: 'active',
      });
      // Conversation membership: Requires conversation_participant record creation. Deferred until conversation-group linking is implemented.
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
