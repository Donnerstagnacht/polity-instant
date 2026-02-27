import { useMemo } from 'react';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useEventState } from '@/zero/events/useEventState';
import { useEventActions } from '@/zero/events/useEventActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { sendNotificationFn } from '@/server/notifications';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

const LOG_PREFIX = '[UserMemberships]';

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

  // Resolve a safe sender name — mirrors the group page pattern (useGroupMembership.ts)
  const safeSenderName = userName || 'A user';

  /**
   * Leave a group (remove membership)
   */
  const leaveGroup = async (membershipId: string, groupId: string) => {
    try {
      // Snapshot group data before mutation (Zero reactivity may invalidate after delete)
      const membership = memberships.find((m: any) => m.id === membershipId);
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      console.log(LOG_PREFIX, 'leaveGroup — snapshot:', { membershipId, groupId, groupSnapshot, userId, safeSenderName });

      await groupActions.leaveGroup({ id: membershipId });

      // Use groupId param as primary source, snapshot as fallback for name
      const resolvedGroupId = groupId || groupSnapshot?.id;
      const resolvedGroupName = groupSnapshot?.name || 'Group';

      if (resolvedGroupId && userId) {
        console.log(LOG_PREFIX, 'leaveGroup — sending notifyMembershipWithdrawn', { resolvedGroupId, resolvedGroupName });
        sendNotificationFn({ data: { helper: 'notifyMembershipWithdrawn', params: { senderId: userId, senderName: safeSenderName, groupId: resolvedGroupId, groupName: resolvedGroupName } } })
          .then(result => console.log(LOG_PREFIX, 'leaveGroup — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'leaveGroup — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'leaveGroup — skipped notification:', { resolvedGroupId, userId });
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
      const participation = participations.find((p: any) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      console.log(LOG_PREFIX, 'withdrawFromEvent — snapshot:', { participationId, eventId, eventSnapshot, userId, safeSenderName });

      await eventActions.leaveEvent({ id: participationId });

      const resolvedEventId = eventId || eventSnapshot?.id;
      const resolvedEventTitle = eventSnapshot?.title || 'Event';

      if (resolvedEventId && userId) {
        console.log(LOG_PREFIX, 'withdrawFromEvent — sending notifyParticipationWithdrawn');
        sendNotificationFn({ data: { helper: 'notifyParticipationWithdrawn', params: { senderId: userId, senderName: safeSenderName, eventId: resolvedEventId, eventTitle: resolvedEventTitle } } })
          .then(result => console.log(LOG_PREFIX, 'withdrawFromEvent — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'withdrawFromEvent — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'withdrawFromEvent — skipped notification:', { resolvedEventId, userId });
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
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);
      const amendmentSnapshot = collaboration?.amendment ? { id: collaboration.amendment.id, title: collaboration.amendment.title } : null;

      console.log(LOG_PREFIX, 'leaveCollaboration — snapshot:', { collaborationId, amendmentId, amendmentSnapshot, userId, safeSenderName });

      await amendmentActions.leaveCollaboration(collaborationId);

      const resolvedAmendmentId = amendmentId || amendmentSnapshot?.id;
      const resolvedAmendmentTitle = amendmentSnapshot?.title || 'Amendment';

      if (resolvedAmendmentId && userId) {
        console.log(LOG_PREFIX, 'leaveCollaboration — sending notifyCollaborationWithdrawn');
        sendNotificationFn({ data: { helper: 'notifyCollaborationWithdrawn', params: { senderId: userId, senderName: safeSenderName, amendmentId: resolvedAmendmentId, amendmentTitle: resolvedAmendmentTitle } } })
          .then(result => console.log(LOG_PREFIX, 'leaveCollaboration — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'leaveCollaboration — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'leaveCollaboration — skipped notification:', { resolvedAmendmentId, userId });
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
      const blogRelation = blogRelations.find((r: any) => r.id === relationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      console.log(LOG_PREFIX, 'leaveBlog — snapshot:', { relationId, blogSnapshot, userId, safeSenderName });

      await blogActions.deleteEntry(relationId);

      if (blogSnapshot && userId) {
        console.log(LOG_PREFIX, 'leaveBlog — sending notifyBlogWriterLeft');
        sendNotificationFn({ data: { helper: 'notifyBlogWriterLeft', params: { senderId: userId, senderName: safeSenderName, blogId: blogSnapshot.id, blogTitle: blogSnapshot.title || 'Blog' } } })
          .then(result => console.log(LOG_PREFIX, 'leaveBlog — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'leaveBlog — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'leaveBlog — skipped notification:', { blogSnapshot, userId });
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
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      await groupActions.updateMemberRole({
        id: membershipId,
        status: 'member',
      });

      // Add timeline event for member joining (if group is public)
      if (groupSnapshot && userId) {
        await createTimelineEvent({ data: {
            eventType: 'member_added',
            entityType: 'group',
            entityId: groupSnapshot.id,
            actorId: userId,
            title: `${safeSenderName} joined ${groupSnapshot.name || 'the group'}`,
            description: 'A new member has joined the group',
          } });
      }

      if (groupSnapshot && userId) {
        console.log(LOG_PREFIX, 'acceptGroupInvitation — sending notifyGroupInvitationAccepted');
        sendNotificationFn({ data: { helper: 'notifyGroupInvitationAccepted', params: { senderId: userId, senderName: safeSenderName, groupId: groupSnapshot.id, groupName: groupSnapshot.name || 'Group' } } })
          .then(result => console.log(LOG_PREFIX, 'acceptGroupInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'acceptGroupInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'acceptGroupInvitation — skipped notification:', { groupSnapshot, userId });
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
      const membership = memberships.find((m: any) => m.id === membershipId);
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      console.log(LOG_PREFIX, 'declineGroupInvitation — snapshot:', { membershipId, groupSnapshot, userId, safeSenderName });

      await groupActions.leaveGroup({ id: membershipId });

      if (groupSnapshot && userId) {
        console.log(LOG_PREFIX, 'declineGroupInvitation — sending notifyGroupInvitationDeclined');
        sendNotificationFn({ data: { helper: 'notifyGroupInvitationDeclined', params: { senderId: userId, senderName: safeSenderName, groupId: groupSnapshot.id, groupName: groupSnapshot.name || 'Group' } } })
          .then(result => console.log(LOG_PREFIX, 'declineGroupInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'declineGroupInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'declineGroupInvitation — skipped notification:', { groupSnapshot, userId });
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
      const membership = memberships.find((m: any) => m.id === membershipId);
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      console.log(LOG_PREFIX, 'withdrawGroupRequest — snapshot:', { membershipId, groupSnapshot, userId, safeSenderName });

      await groupActions.leaveGroup({ id: membershipId });

      if (groupSnapshot && userId) {
        console.log(LOG_PREFIX, 'withdrawGroupRequest — sending notifyGroupRequestWithdrawn');
        sendNotificationFn({ data: { helper: 'notifyGroupRequestWithdrawn', params: { senderId: userId, senderName: safeSenderName, groupId: groupSnapshot.id, groupName: groupSnapshot.name || 'Group' } } })
          .then(result => console.log(LOG_PREFIX, 'withdrawGroupRequest — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'withdrawGroupRequest — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'withdrawGroupRequest — skipped notification:', { groupSnapshot, userId });
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
      const participation = participations.find((p: any) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      await eventActions.updateParticipant({
        id: participationId,
        status: 'member',
      });

      if (eventSnapshot && userId) {
        console.log(LOG_PREFIX, 'acceptEventInvitation — sending notifyEventInvitationAccepted');
        sendNotificationFn({ data: { helper: 'notifyEventInvitationAccepted', params: { senderId: userId, senderName: safeSenderName, eventId: eventSnapshot.id, eventTitle: eventSnapshot.title || 'Event' } } })
          .then(result => console.log(LOG_PREFIX, 'acceptEventInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'acceptEventInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'acceptEventInvitation — skipped notification:', { eventSnapshot, userId });
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
      const participation = participations.find((p: any) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      console.log(LOG_PREFIX, 'declineEventInvitation — snapshot:', { participationId, eventSnapshot, userId, safeSenderName });

      await eventActions.leaveEvent({ id: participationId });

      if (eventSnapshot && userId) {
        console.log(LOG_PREFIX, 'declineEventInvitation — sending notifyEventInvitationDeclined');
        sendNotificationFn({ data: { helper: 'notifyEventInvitationDeclined', params: { senderId: userId, senderName: safeSenderName, eventId: eventSnapshot.id, eventTitle: eventSnapshot.title || 'Event' } } })
          .then(result => console.log(LOG_PREFIX, 'declineEventInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'declineEventInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'declineEventInvitation — skipped notification:', { eventSnapshot, userId });
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
      const participation = participations.find((p: any) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      console.log(LOG_PREFIX, 'withdrawEventRequest — snapshot:', { participationId, eventSnapshot, userId, safeSenderName });

      await eventActions.leaveEvent({ id: participationId });

      if (eventSnapshot && userId) {
        console.log(LOG_PREFIX, 'withdrawEventRequest — sending notifyEventRequestWithdrawn');
        sendNotificationFn({ data: { helper: 'notifyEventRequestWithdrawn', params: { senderId: userId, senderName: safeSenderName, eventId: eventSnapshot.id, eventTitle: eventSnapshot.title || 'Event' } } })
          .then(result => console.log(LOG_PREFIX, 'withdrawEventRequest — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'withdrawEventRequest — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'withdrawEventRequest — skipped notification:', { eventSnapshot, userId });
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
      const amendmentSnapshot = collaboration?.amendment ? { id: collaboration.amendment.id, title: collaboration.amendment.title, visibility: collaboration.amendment.visibility } : null;

      await amendmentActions.updateCollaborator({
        id: collaborationId,
        status: 'member',
      });

      // Add timeline event for public amendments
      if (amendmentSnapshot && amendmentSnapshot.visibility === 'public' && userId) {
        await createTimelineEvent({ data: {
            eventType: 'member_added',
            entityType: 'amendment',
            entityId: amendmentSnapshot.id,
            actorId: userId,
            title: safeSenderName,
            description: amendmentSnapshot.title || 'Amendment',
            contentType: 'amendment',
          } });
      }

      if (amendmentSnapshot && userId) {
        console.log(LOG_PREFIX, 'acceptCollaborationInvitation — sending notifyCollaborationInvitationAccepted');
        sendNotificationFn({ data: { helper: 'notifyCollaborationInvitationAccepted', params: { senderId: userId, senderName: safeSenderName, amendmentId: amendmentSnapshot.id, amendmentTitle: amendmentSnapshot.title || 'Amendment' } } })
          .then(result => console.log(LOG_PREFIX, 'acceptCollaborationInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'acceptCollaborationInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'acceptCollaborationInvitation — skipped notification:', { amendmentSnapshot, userId });
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
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);
      const amendmentSnapshot = collaboration?.amendment ? { id: collaboration.amendment.id, title: collaboration.amendment.title } : null;

      console.log(LOG_PREFIX, 'declineCollaborationInvitation — snapshot:', { collaborationId, amendmentSnapshot, userId, safeSenderName });

      await amendmentActions.leaveCollaboration(collaborationId);

      if (amendmentSnapshot && userId) {
        console.log(LOG_PREFIX, 'declineCollaborationInvitation — sending notifyCollaborationInvitationDeclined');
        sendNotificationFn({ data: { helper: 'notifyCollaborationInvitationDeclined', params: { senderId: userId, senderName: safeSenderName, amendmentId: amendmentSnapshot.id, amendmentTitle: amendmentSnapshot.title || 'Amendment' } } })
          .then(result => console.log(LOG_PREFIX, 'declineCollaborationInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'declineCollaborationInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'declineCollaborationInvitation — skipped notification:', { amendmentSnapshot, userId });
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
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);
      const amendmentSnapshot = collaboration?.amendment ? { id: collaboration.amendment.id, title: collaboration.amendment.title } : null;

      console.log(LOG_PREFIX, 'withdrawCollaborationRequest — snapshot:', { collaborationId, amendmentSnapshot, userId, safeSenderName });

      await amendmentActions.leaveCollaboration(collaborationId);

      if (amendmentSnapshot && userId) {
        console.log(LOG_PREFIX, 'withdrawCollaborationRequest — sending notifyCollaborationRequestWithdrawn');
        sendNotificationFn({ data: { helper: 'notifyCollaborationRequestWithdrawn', params: { senderId: userId, senderName: safeSenderName, amendmentId: amendmentSnapshot.id, amendmentTitle: amendmentSnapshot.title || 'Amendment' } } })
          .then(result => console.log(LOG_PREFIX, 'withdrawCollaborationRequest — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'withdrawCollaborationRequest — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'withdrawCollaborationRequest — skipped notification:', { amendmentSnapshot, userId });
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
      const blogRelation = blogRelations.find((r: any) => r.id === blogRelationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      await blogActions.updateEntry({
        id: blogRelationId,
        status: 'writer',
      });

      if (blogSnapshot && userId) {
        console.log(LOG_PREFIX, 'acceptBlogInvitation — sending notifyBlogInvitationAccepted');
        sendNotificationFn({ data: { helper: 'notifyBlogInvitationAccepted', params: { senderId: userId, senderName: safeSenderName, blogId: blogSnapshot.id, blogTitle: blogSnapshot.title || 'Blog' } } })
          .then(result => console.log(LOG_PREFIX, 'acceptBlogInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'acceptBlogInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'acceptBlogInvitation — skipped notification:', { blogSnapshot, userId });
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
      const blogRelation = blogRelations.find((r: any) => r.id === blogRelationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      console.log(LOG_PREFIX, 'declineBlogInvitation — snapshot:', { blogRelationId, blogSnapshot, userId, safeSenderName });

      await blogActions.deleteEntry(blogRelationId);

      if (blogSnapshot && userId) {
        console.log(LOG_PREFIX, 'declineBlogInvitation — sending notifyBlogInvitationDeclined');
        sendNotificationFn({ data: { helper: 'notifyBlogInvitationDeclined', params: { senderId: userId, senderName: safeSenderName, blogId: blogSnapshot.id, blogTitle: blogSnapshot.title || 'Blog' } } })
          .then(result => console.log(LOG_PREFIX, 'declineBlogInvitation — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'declineBlogInvitation — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'declineBlogInvitation — skipped notification:', { blogSnapshot, userId });
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
      const blogRelation = blogRelations.find((r: any) => r.id === blogRelationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      console.log(LOG_PREFIX, 'withdrawBlogRequest — snapshot:', { blogRelationId, blogSnapshot, userId, safeSenderName });

      await blogActions.deleteEntry(blogRelationId);

      if (blogSnapshot && userId) {
        console.log(LOG_PREFIX, 'withdrawBlogRequest — sending notifyBlogRequestWithdrawn');
        sendNotificationFn({ data: { helper: 'notifyBlogRequestWithdrawn', params: { senderId: userId, senderName: safeSenderName, blogId: blogSnapshot.id, blogTitle: blogSnapshot.title || 'Blog' } } })
          .then(result => console.log(LOG_PREFIX, 'withdrawBlogRequest — notification result:', result))
          .catch(err => console.error(LOG_PREFIX, 'withdrawBlogRequest — notification failed:', err));
      } else {
        console.warn(LOG_PREFIX, 'withdrawBlogRequest — skipped notification:', { blogSnapshot, userId });
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
