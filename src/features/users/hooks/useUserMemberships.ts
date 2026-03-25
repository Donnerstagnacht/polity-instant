import { useMemo } from 'react';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useEventState } from '@/zero/events/useEventState';
import { useEventActions } from '@/zero/events/useEventActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
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
      const membership = memberships.find((m) => m.id === membershipId);
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      console.log(LOG_PREFIX, 'leaveGroup — snapshot:', { membershipId, groupId, groupSnapshot, userId, safeSenderName });

      await groupActions.leaveGroup({ id: membershipId });

      // Use groupId param as primary source, snapshot as fallback for name


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
      const participation = participations.find((p) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      console.log(LOG_PREFIX, 'withdrawFromEvent — snapshot:', { participationId, eventId, eventSnapshot, userId, safeSenderName });

      await eventActions.leaveEvent({ id: participationId });



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
      const collaboration = collaborations.find((c) => c.id === collaborationId);
      const amendmentSnapshot = collaboration?.amendment ? { id: collaboration.amendment.id, title: collaboration.amendment.title } : null;

      console.log(LOG_PREFIX, 'leaveCollaboration — snapshot:', { collaborationId, amendmentId, amendmentSnapshot, userId, safeSenderName });

      await amendmentActions.leaveCollaboration(collaborationId);



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
      const blogRelation = blogRelations.find((r) => r.id === relationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      console.log(LOG_PREFIX, 'leaveBlog — snapshot:', { relationId, blogSnapshot, userId, safeSenderName });

      await blogActions.deleteEntry(relationId);


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
      const membership = memberships.find((m) => m.id === membershipId);
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      await groupActions.updateMemberRole({
        id: membershipId,
        status: 'active',
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
      const membership = memberships.find((m) => m.id === membershipId);
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      console.log(LOG_PREFIX, 'declineGroupInvitation — snapshot:', { membershipId, groupSnapshot, userId, safeSenderName });

      await groupActions.leaveGroup({ id: membershipId });


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
      const membership = memberships.find((m) => m.id === membershipId);
      const groupSnapshot = membership?.group ? { id: membership.group.id, name: membership.group.name } : null;

      console.log(LOG_PREFIX, 'withdrawGroupRequest — snapshot:', { membershipId, groupSnapshot, userId, safeSenderName });

      await groupActions.leaveGroup({ id: membershipId });


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
      const participation = participations.find((p) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      await eventActions.updateParticipant({
        id: participationId,
        status: 'member',
      });


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
      const participation = participations.find((p) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      console.log(LOG_PREFIX, 'declineEventInvitation — snapshot:', { participationId, eventSnapshot, userId, safeSenderName });

      await eventActions.leaveEvent({ id: participationId });


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
      const participation = participations.find((p) => p.id === participationId);
      const eventSnapshot = participation?.event ? { id: participation.event.id, title: participation.event.title } : null;

      console.log(LOG_PREFIX, 'withdrawEventRequest — snapshot:', { participationId, eventSnapshot, userId, safeSenderName });

      await eventActions.leaveEvent({ id: participationId });


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
      const collaboration = collaborations.find((c) => c.id === collaborationId);
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
      const collaboration = collaborations.find((c) => c.id === collaborationId);
      const amendmentSnapshot = collaboration?.amendment ? { id: collaboration.amendment.id, title: collaboration.amendment.title } : null;

      console.log(LOG_PREFIX, 'declineCollaborationInvitation — snapshot:', { collaborationId, amendmentSnapshot, userId, safeSenderName });

      await amendmentActions.leaveCollaboration(collaborationId);


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
      const collaboration = collaborations.find((c) => c.id === collaborationId);
      const amendmentSnapshot = collaboration?.amendment ? { id: collaboration.amendment.id, title: collaboration.amendment.title } : null;

      console.log(LOG_PREFIX, 'withdrawCollaborationRequest — snapshot:', { collaborationId, amendmentSnapshot, userId, safeSenderName });

      await amendmentActions.leaveCollaboration(collaborationId);


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
      const blogRelation = blogRelations.find((r) => r.id === blogRelationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      await blogActions.updateEntry({
        id: blogRelationId,
        status: 'writer',
      });


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
      const blogRelation = blogRelations.find((r) => r.id === blogRelationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      console.log(LOG_PREFIX, 'declineBlogInvitation — snapshot:', { blogRelationId, blogSnapshot, userId, safeSenderName });

      await blogActions.deleteEntry(blogRelationId);


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
      const blogRelation = blogRelations.find((r) => r.id === blogRelationId);
      const blogSnapshot = blogRelation?.blog ? { id: blogRelation.blog.id, title: blogRelation.blog.title } : null;

      console.log(LOG_PREFIX, 'withdrawBlogRequest — snapshot:', { blogRelationId, blogSnapshot, userId, safeSenderName });

      await blogActions.deleteEntry(blogRelationId);


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
