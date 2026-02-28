import { useState } from 'react';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { toast } from 'sonner';
import { addUserToGroupConversation } from '@/features/shared/utils/groupConversationSync';

/**
 * Hook for group membership mutations
 */
export function useGroupMutations(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    inviteMember,
    updateMemberRole,
    leaveGroup: leaveGroupAction,
    createRole: createRoleAction,
    deleteRole: deleteRoleAction,
    assignActionRight,
  } = useGroupActions();

  /**
   * Invite users to the group
   */
  const inviteUsers = async (
    userIds: string[],
    roleId?: string,
    senderId?: string,
    senderName?: string,
    groupName?: string
  ) => {
    if (userIds.length === 0) return { success: false, error: 'No users selected' };

    setIsLoading(true);
    try {
      for (const userId of userIds) {
        const membershipId = crypto.randomUUID();
        await inviteMember({
          id: membershipId,
          user_id: userId,
          group_id: groupId,
          role_id: roleId ?? null,
          visibility: '',
          status: 'invited',
        });
      }

      userIds.forEach(uid => {
      })
      toast.success(`Successfully invited ${userIds.length} user(s)`);
      return { success: true };
    } catch (error) {
      console.error('Failed to invite users:', error);
      toast.error('Failed to invite users');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Approve a membership request
   */
  const approveMembership = async (
    membershipId: string,
    userId: string,
    conversationId?: string,
    senderId?: string,
    senderName?: string,
    groupName?: string
  ) => {
    setIsLoading(true);
    try {
      await updateMemberRole({
        id: membershipId,
        status: 'member',
      });

      // Add user to group conversation if it exists
      if (conversationId) {
        await addUserToGroupConversation(conversationId, userId);
      }

      toast.success('Membership approved');
      return { success: true };
    } catch (error) {
      console.error('Failed to approve membership:', error);
      toast.error('Failed to approve membership');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reject a membership request
   */
  const rejectMembership = async (
    membershipId: string,
    userId: string,
    senderId?: string,
    senderName?: string,
    groupName?: string
  ) => {
    setIsLoading(true);
    try {
      const transactions = [leaveGroupAction({ id: membershipId })];

      await Promise.all(transactions);

      toast.success('Membership request rejected');
      return { success: true };
    } catch (error) {
      console.error('Failed to reject membership:', error);
      toast.error('Failed to reject membership');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove a member from the group
   */
  const removeMember = async (
    membershipId: string,
    userId: string,
    conversationId?: string,
    senderId?: string,
    senderName?: string,
    groupName?: string
  ) => {
    setIsLoading(true);
    try {
      await leaveGroupAction({ id: membershipId });

      toast.success('Member removed successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change a member's role
   */
  const changeMemberRole = async (
    membershipId: string,
    roleId: string,
    userId: string,
    senderId?: string,
    senderName?: string,
    groupName?: string,
    roleName?: string
  ) => {
    setIsLoading(true);
    try {
      await updateMemberRole({
        id: membershipId,
        role_id: roleId,
      });

      toast.success('Member role updated');
      return { success: true };
    } catch (error) {
      console.error('Failed to change member role:', error);
      toast.error('Failed to change member role');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new role
   */
  const createRole = async (
    name: string,
    description: string,
    actionRights: any[],
    senderId?: string,
    groupName?: string,
    adminUserIds?: string[],
    sortOrder: number = 0
  ) => {
    setIsLoading(true);
    try {
      const roleId = crypto.randomUUID();
      await createRoleAction({
        id: roleId,
        name,
        description,
        scope: 'group',
        group_id: groupId,
        event_id: null,
        amendment_id: null,
        blog_id: null,
        sort_order: sortOrder,
      });

      // Add action rights
      for (const right of actionRights) {
        const actionRightId = crypto.randomUUID();
        await assignActionRight({
          id: actionRightId,
          resource: right.resource,
          action: right.action,
          role_id: roleId,
          group_id: groupId,
          event_id: null,
          amendment_id: null,
          blog_id: null,
        });
      }

      toast.success('Role created successfully');
      return { success: true, roleId };
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error('Failed to create role');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a role
   */
  const deleteRole = async (
    roleId: string,
    roleName?: string,
    senderId?: string,
    groupName?: string,
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      await deleteRoleAction({ id: roleId });

      toast.success('Role deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Promote member to admin
   */
  const promoteToAdmin = async (
    membershipId: string,
    userId: string,
    senderId?: string,
    groupName?: string
  ) => {
    setIsLoading(true);
    try {
      await updateMemberRole({
        id: membershipId,
        status: 'admin',
      });

      toast.success('Member promoted to admin');
      return { success: true };
    } catch (error) {
      console.error('Failed to promote member:', error);
      toast.error('Failed to promote member');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Demote admin to member
   */
  const demoteToMember = async (
    membershipId: string,
    userId?: string,
    senderId?: string,
    groupName?: string
  ) => {
    setIsLoading(true);
    try {
      await updateMemberRole({
        id: membershipId,
        status: 'member',
      });

      toast.success('Admin demoted to member');
      return { success: true };
    } catch (error) {
      console.error('Failed to demote admin:', error);
      toast.error('Failed to demote admin');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inviteUsers,
    approveMembership,
    rejectMembership,
    removeMember,
    changeMemberRole,
    createRole,
    deleteRole,
    promoteToAdmin,
    demoteToMember,
    isLoading,
  };
}
