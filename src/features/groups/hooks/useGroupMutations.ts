import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import {
  notifyGroupInvite,
  notifyMembershipApproved,
  notifyMembershipRejected,
  notifyMembershipRoleChanged,
  notifyMembershipRemoved,
  notifyAdminPromoted,
  notifyAdminDemoted,
  notifyRoleCreated,
  notifyRoleDeleted,
} from '@/utils/notification-helpers';
import { addUserToGroupConversation } from '@/utils/groupConversationSync';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

/**
 * Hook for group membership mutations
 */
export function useGroupMutations(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);

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
      const transactions: any[] = [];

      userIds.forEach(userId => {
        const membershipId = id();
        const membershipTx = tx.groupMemberships[membershipId].update({
          status: 'invited',
          createdAt: new Date().toISOString(),
        });

        // Link user and group
        membershipTx.link({
          user: userId,
          group: groupId,
        });

        // Link role if provided
        if (roleId) {
          membershipTx.link({ role: roleId });
        }

        transactions.push(membershipTx);
      });

      await db.transact(transactions);

      // Notifications are server-only — send separately
      try {
        if (senderId && groupName) {
          const notifTxs: any[] = [];
          userIds.forEach(userId => {
            notifTxs.push(...notifyGroupInvite({
              senderId,
              recipientUserId: userId,
              groupId,
              groupName,
            }));
          });
          if (notifTxs.length > 0) await db.transact(notifTxs);
        }
      } catch { /* notification delivery is best-effort */ }
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
      const transactions: any[] = [
        tx.groupMemberships[membershipId].update({
          status: 'member',
        }),
      ];

      // Add user to group conversation if it exists
      if (conversationId) {
        await addUserToGroupConversation(conversationId, userId);
      }

      await db.transact(transactions);

      // Timeline and notifications are server-only — send separately
      try {
        const sideEffects: any[] = [
          createTimelineEvent({
            eventType: 'member_added',
            entityType: 'group',
            entityId: groupId,
            actorId: userId,
            title: `New member joined ${groupName || 'the group'}`,
            description: 'A new member has joined the group',
          }),
        ];

        if (senderId) {
          sideEffects.push(...notifyMembershipApproved({
            senderId,
            recipientUserId: userId,
            groupId,
            groupName: groupName || '',
          }));
        }

        await db.transact(sideEffects);
      } catch { /* timeline/notification delivery is best-effort */ }
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
    senderName?: string
  ) => {
    setIsLoading(true);
    try {
      const transactions = [tx.groupMemberships[membershipId].delete()];

      await db.transact(transactions);

      // Notification is server-only — send separately
      try {
        if (senderId) {
          const notificationTxs = notifyMembershipRejected({
            senderId,
            recipientUserId: userId,
            groupId,
            groupName: '',
          });
          if (notificationTxs.length > 0) await db.transact(notificationTxs);
        }
      } catch { /* notification delivery is best-effort */ }

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
    senderName?: string
  ) => {
    setIsLoading(true);
    try {
      const transactions = [tx.groupMemberships[membershipId].delete()];

      // Remove from conversation if exists
      if (conversationId) {
        const participantQuery = await db.queryOnce({
          conversationParticipants: {
            $: {
              where: {
                'conversation.id': conversationId,
                'user.id': userId,
              },
            },
          },
        });

        const participant = participantQuery?.data?.conversationParticipants?.[0];
        if (participant) {
          transactions.push(tx.conversationParticipants[participant.id].delete());
        }
      }

      await db.transact(transactions);

      // Notification is server-only — send separately
      try {
        if (senderId) {
          const notificationTxs = notifyMembershipRemoved({
            senderId,
            recipientUserId: userId,
            groupId,
            groupName: '',
          });
          if (notificationTxs.length > 0) await db.transact(notificationTxs);
        }
      } catch { /* notification delivery is best-effort */ }
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
    senderName?: string
  ) => {
    setIsLoading(true);
    try {
      const transactions = [tx.groupMemberships[membershipId].link({ role: roleId })];

      await db.transact(transactions);

      // Notification is server-only — send separately
      try {
        if (senderId) {
          const notificationTxs = notifyMembershipRoleChanged({
            senderId,
            recipientUserId: userId,
            groupId,
            groupName: '',
            newRole: '',
          });
          if (notificationTxs.length > 0) await db.transact(notificationTxs);
        }
      } catch { /* notification delivery is best-effort */ }
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
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      const roleId = id();
      const transactions: any[] = [
        tx.roles[roleId].update({
          name,
          description,
          scope: 'group',
          createdAt: new Date().toISOString(),
        }),
        tx.roles[roleId].link({ group: groupId }),
      ];

      // Add action rights
      actionRights.forEach(right => {
        const actionRightId = id();
        transactions.push(
          tx.actionRights[actionRightId].update({
            resource: right.resource,
            action: right.action,
            createdAt: new Date().toISOString(),
          }),
          tx.actionRights[actionRightId].link({ role: roleId })
        );
      });

      await db.transact(transactions);

      // Notifications are server-only — send separately
      try {
        if (senderId && groupName && adminUserIds) {
          const notifTxs: any[] = [];
          adminUserIds.forEach(adminId => {
            if (adminId !== senderId) {
              notifTxs.push(...notifyRoleCreated({
                senderId,
                recipientUserId: adminId,
                groupId,
                groupName,
                roleName: name,
              }));
            }
          });
          if (notifTxs.length > 0) await db.transact(notifTxs);
        }
      } catch { /* notification delivery is best-effort */ }
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
      const transactions: any[] = [tx.roles[roleId].delete()];

      await db.transact(transactions);

      // Notifications are server-only — send separately
      try {
        if (senderId && roleName && groupName && adminUserIds) {
          const notifTxs: any[] = [];
          adminUserIds.forEach(adminId => {
            if (adminId !== senderId) {
              notifTxs.push(...notifyRoleDeleted({
                senderId,
                recipientUserId: adminId,
                groupId,
                groupName,
                roleName,
              }));
            }
          });
          if (notifTxs.length > 0) await db.transact(notifTxs);
        }
      } catch { /* notification delivery is best-effort */ }
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
      const transactions: any[] = [
        tx.groupMemberships[membershipId].update({
          status: 'admin',
        }),
      ];

      await db.transact(transactions);

      // Notification is server-only — send separately
      try {
        if (senderId && groupName) {
          const notificationTxs = notifyAdminPromoted({
            senderId,
            recipientUserId: userId,
            groupId,
            groupName,
          });
          if (notificationTxs.length > 0) await db.transact(notificationTxs);
        }
      } catch { /* notification delivery is best-effort */ }
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
      const transactions: any[] = [
        tx.groupMemberships[membershipId].update({
          status: 'member',
        }),
      ];

      await db.transact(transactions);

      // Notification is server-only — send separately
      try {
        if (senderId && userId && groupName) {
          const notificationTxs = notifyAdminDemoted({
            senderId,
            recipientUserId: userId,
            groupId,
            groupName,
          });
          if (notificationTxs.length > 0) await db.transact(notificationTxs);
        }
      } catch { /* notification delivery is best-effort */ }
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
