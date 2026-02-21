import { useMemo } from 'react';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useEventState } from '@/zero/events/useEventState';
import { useEventActions } from '@/zero/events/useEventActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import {
  notifyMembershipWithdrawn,
  notifyParticipationWithdrawn,
  notifyCollaborationWithdrawn,
  notifyGroupInvitationAccepted,
  notifyGroupInvitationDeclined,
  notifyGroupRequestWithdrawn,
  notifyEventInvitationAccepted,
  notifyEventInvitationDeclined,
  notifyEventRequestWithdrawn,
  notifyCollaborationInvitationAccepted,
  notifyCollaborationInvitationDeclined,
  notifyCollaborationRequestWithdrawn,
  notifyBlogInvitationAccepted,
  notifyBlogInvitationDeclined,
  notifyBlogRequestWithdrawn,
  notifyBlogWriterLeft,
} from '@/utils/notification-helpers';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

/**
 * Hook to query and manage user memberships, participations, and collaborations
 * @param userId - The user ID to query memberships for
 * @param userName - The user's name for notifications
 */
export function useUserMemberships(userId?: string, userName?: string) {
  // Facade hooks for queries
  const { userMemberships: membershipRows } = useGroupState({ userId });
  const { participantsByUser: participantRows } = useEventState({ userId });
  const { collaboratorsByUser: collaboratorRows } = useAmendmentState({ userId, includeCollaboratorsByUser: true });
  const { bloggersByUser: bloggerRows } = useBlogState({ userId });

  // Facade hooks for actions
  const groupActions = useGroupActions();
  const eventActions = useEventActions();
  const amendmentActions = useAmendmentActions();
  const blogActions = useBlogActions();

  const isLoading = false;
  const error = null;

  const memberships = useMemo(() => membershipRows || [], [membershipRows]);
  const participations = useMemo(() => participantRows || [], [participantRows]);
  const collaborations = useMemo(() => collaboratorRows || [], [collaboratorRows]);
  const blogRelations = useMemo(() => bloggerRows || [], [bloggerRows]);

  /**
   * Leave a group (remove membership)
   */
  const leaveGroup = async (membershipId: string, groupId: string) => {
    try {
      await groupActions.leaveGroup({ id: membershipId });

      // Notify the group (entity notification)
      const membership = memberships.find((m: any) => m.id === membershipId);
      if (membership?.group && userId && userName) {
        await notifyMembershipWithdrawn({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name ?? '',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to leave group:', error);
      return { success: false, error };
    }
  };

  /**
   * Withdraw from an event (remove participation)
   */
  const withdrawFromEvent = async (participationId: string, eventId: string) => {
    try {
      await eventActions.leaveEvent({ id: participationId });

      // Notify the event (entity notification)
      const participation = participations.find((p: any) => p.id === participationId);
      if (participation?.event && userId && userName) {
        await notifyParticipationWithdrawn({
          senderId: userId,
          senderName: userName,
          eventId: participation.event.id,
          eventTitle: participation.event.title ?? '',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw from event:', error);
      return { success: false, error };
    }
  };

  /**
   * Leave an amendment collaboration
   */
  const leaveCollaboration = async (collaborationId: string, amendmentId: string) => {
    try {
      await amendmentActions.leaveCollaboration(collaborationId);

      // Notify the amendment (entity notification)
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationWithdrawn({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title ?? '',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to leave collaboration:', error);
      return { success: false, error };
    }
  };

  /**
   * Leave a blog
   */
  const leaveBlog = async (relationId: string) => {
    try {
      await blogActions.deleteEntry(relationId);

      // Notify the blog (entity notification)
      const blogRelation = blogRelations.find((r: any) => r.id === relationId);
      if (blogRelation?.blog && userId && userName) {
        await notifyBlogWriterLeft({
          senderId: userId,
          senderName: userName,
          blogId: blogRelation.blog.id,
          blogTitle: blogRelation.blog.title || 'Blog',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to leave blog:', error);
      return { success: false, error };
    }
  };

  /**
   * Accept a group invitation
   */
  const acceptGroupInvitation = async (membershipId: string) => {
    try {
      const membership = memberships.find((m: any) => m.id === membershipId);

      await groupActions.updateMemberRole({
        id: membershipId,
        status: 'member',
      });

      // Add timeline event for member joining (if group is public)
      if (membership?.group && userId) {
        await createTimelineEvent({ data: {
            eventType: 'member_added',
            entityType: 'group',
            entityId: membership.group.id,
            actorId: userId,
            title: `${userName || 'New member'} joined ${membership.group.name || 'the group'}`,
            description: 'A new member has joined the group',
          } });
      }

      // Notify the group (entity notification)
      if (membership?.group && userId && userName) {
        await notifyGroupInvitationAccepted({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name || 'Group',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Decline a group invitation
   */
  const declineGroupInvitation = async (membershipId: string) => {
    try {
      // Get membership info before deleting
      const membership = memberships.find((m: any) => m.id === membershipId);

      await groupActions.leaveGroup({ id: membershipId });

      // Notify the group (entity notification)
      if (membership?.group && userId && userName) {
        await notifyGroupInvitationDeclined({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name || 'Group',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Withdraw a group membership request
   */
  const withdrawGroupRequest = async (membershipId: string) => {
    try {
      // Get membership info before deleting
      const membership = memberships.find((m: any) => m.id === membershipId);

      await groupActions.leaveGroup({ id: membershipId });

      // Notify the group (entity notification)
      if (membership?.group && userId && userName) {
        await notifyGroupRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name || 'Group',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw request:', error);
      return { success: false, error };
    }
  };

  /**
   * Accept an event invitation
   */
  const acceptEventInvitation = async (participationId: string) => {
    try {
      await eventActions.updateParticipant({
        id: participationId,
        status: 'member',
      });

      // Notify the event (entity notification)
      const participation = participations.find((p: any) => p.id === participationId);
      if (participation?.event && userId && userName) {
        await notifyEventInvitationAccepted({
          senderId: userId,
          senderName: userName,
          eventId: participation.event.id,
          eventTitle: participation.event.title || 'Event',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to accept event invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Decline an event invitation
   */
  const declineEventInvitation = async (participationId: string) => {
    try {
      // Get participation info before deleting
      const participation = participations.find((p: any) => p.id === participationId);

      await eventActions.leaveEvent({ id: participationId });

      // Notify the event (entity notification)
      if (participation?.event && userId && userName) {
        await notifyEventInvitationDeclined({
          senderId: userId,
          senderName: userName,
          eventId: participation.event.id,
          eventTitle: participation.event.title || 'Event',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to decline event invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Withdraw an event participation request
   */
  const withdrawEventRequest = async (participationId: string) => {
    try {
      // Get participation info before deleting
      const participation = participations.find((p: any) => p.id === participationId);

      await eventActions.leaveEvent({ id: participationId });

      // Notify the event (entity notification)
      if (participation?.event && userId && userName) {
        await notifyEventRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          eventId: participation.event.id,
          eventTitle: participation.event.title || 'Event',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw event request:', error);
      return { success: false, error };
    }
  };

  /**
   * Accept a collaboration invitation
   */
  const acceptCollaborationInvitation = async (collaborationId: string) => {
    try {
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);

      await amendmentActions.updateCollaborator({
        id: collaborationId,
        status: 'member',
      });

      // Add timeline event for public amendments
      if (collaboration?.amendment && collaboration.amendment.visibility === 'public' && userId) {
        await createTimelineEvent({ data: {
            eventType: 'member_added',
            entityType: 'amendment',
            entityId: collaboration.amendment.id,
            actorId: userId,
            title: userName || 'User',
            description: collaboration.amendment.title || 'Amendment',
            contentType: 'amendment',
          } });
      }

      // Notify the amendment (entity notification)
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationInvitationAccepted({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title || 'Amendment',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to accept collaboration invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Decline a collaboration invitation
   */
  const declineCollaborationInvitation = async (collaborationId: string) => {
    try {
      // Get collaboration info before deleting
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);

      await amendmentActions.leaveCollaboration(collaborationId);

      // Notify the amendment (entity notification)
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationInvitationDeclined({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title || 'Amendment',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to decline collaboration invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Withdraw a collaboration request
   */
  const withdrawCollaborationRequest = async (collaborationId: string) => {
    try {
      // Get collaboration info before deleting
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);

      await amendmentActions.leaveCollaboration(collaborationId);

      // Notify the amendment (entity notification)
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title || 'Amendment',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw collaboration request:', error);
      return { success: false, error };
    }
  };

  /**
   * Accept a blog invitation
   */
  const acceptBlogInvitation = async (blogRelationId: string) => {
    try {
      await blogActions.updateEntry({
        id: blogRelationId,
        status: 'writer',
      });

      // Notify the blog (entity notification)
      const blogRelation = blogRelations.find((r: any) => r.id === blogRelationId);
      if (blogRelation?.blog && userId && userName) {
        await notifyBlogInvitationAccepted({
          senderId: userId,
          senderName: userName,
          blogId: blogRelation.blog.id,
          blogTitle: blogRelation.blog.title || 'Blog',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to accept blog invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Decline a blog invitation
   */
  const declineBlogInvitation = async (blogRelationId: string) => {
    try {
      // Get blog relation info before deleting
      const blogRelation = blogRelations.find((r: any) => r.id === blogRelationId);

      await blogActions.deleteEntry(blogRelationId);

      // Notify the blog (entity notification)
      if (blogRelation?.blog && userId && userName) {
        await notifyBlogInvitationDeclined({
          senderId: userId,
          senderName: userName,
          blogId: blogRelation.blog.id,
          blogTitle: blogRelation.blog.title || 'Blog',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to decline blog invitation:', error);
      return { success: false, error };
    }
  };

  /**
   * Withdraw a blog request
   */
  const withdrawBlogRequest = async (blogRelationId: string) => {
    try {
      // Get blog relation info before deleting
      const blogRelation = blogRelations.find((r: any) => r.id === blogRelationId);

      await blogActions.deleteEntry(blogRelationId);

      // Notify the blog (entity notification)
      if (blogRelation?.blog && userId && userName) {
        await notifyBlogRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          blogId: blogRelation.blog.id,
          blogTitle: blogRelation.blog.title || 'Blog',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw blog request:', error);
      return { success: false, error };
    }
  };

  return {
    memberships,
    participations,
    collaborations,
    blogRelations,
    isLoading,
    error,
    // Group membership actions
    leaveGroup,
    acceptGroupInvitation,
    declineGroupInvitation,
    withdrawGroupRequest,
    // Event participation actions
    withdrawFromEvent,
    acceptEventInvitation,
    declineEventInvitation,
    withdrawEventRequest,
    // Amendment collaboration actions
    leaveCollaboration,
    acceptCollaborationInvitation,
    declineCollaborationInvitation,
    withdrawCollaborationRequest,
    // Blog relation actions
    leaveBlog,
    acceptBlogInvitation,
    declineBlogInvitation,
    withdrawBlogRequest,
  };
}
