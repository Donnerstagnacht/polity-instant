import { useMemo } from 'react';
import { db, tx } from '../../../../db/db';
import { toast } from 'sonner';
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

/**
 * Hook to query and manage user memberships, participations, and collaborations
 * @param userId - The user ID to query memberships for
 * @param userName - The user's name for notifications
 */
export function useUserMemberships(userId?: string, userName?: string) {
  // Query for all memberships, participations, and collaborations
  const { data, isLoading, error } = db.useQuery(
    userId
      ? {
          groupMemberships: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            group: {
              owner: {},
            },
            role: {},
          },
          eventParticipants: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            event: {
              organizer: {},
            },
            role: {},
          },
          amendmentCollaborators: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            amendment: {
              owner: {},
            },
            role: {},
          },
          blogBloggers: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            blog: {},
            role: {},
          },
        }
      : null
  );

  const memberships = useMemo(() => data?.groupMemberships || [], [data]);
  const participations = useMemo(() => data?.eventParticipants || [], [data]);
  const collaborations = useMemo(() => data?.amendmentCollaborators || [], [data]);
  const blogRelations = useMemo(() => data?.blogBloggers || [], [data]);

  /**
   * Leave a group (remove membership)
   */
  const leaveGroup = async (membershipId: string, groupId: string) => {
    try {
      await db.transact([tx.groupMemberships[membershipId].delete()]);

      // Notify the group (entity notification)
      const membership = memberships.find((m: any) => m.id === membershipId);
      if (membership?.group && userId && userName) {
        await notifyMembershipWithdrawn({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name,
        });
      }

      toast.success('Left group successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to leave group:', error);
      toast.error('Failed to leave group');
      return { success: false, error };
    }
  };

  /**
   * Withdraw from an event (remove participation)
   */
  const withdrawFromEvent = async (participationId: string, eventId: string) => {
    try {
      await db.transact([tx.eventParticipants[participationId].delete()]);

      // Notify the event (entity notification)
      const participation = participations.find((p: any) => p.id === participationId);
      if (participation?.event && userId && userName) {
        await notifyParticipationWithdrawn({
          senderId: userId,
          senderName: userName,
          eventId: participation.event.id,
          eventTitle: participation.event.title,
        });
      }

      toast.success('Withdrawn from event successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw from event:', error);
      toast.error('Failed to withdraw from event');
      return { success: false, error };
    }
  };

  /**
   * Leave an amendment collaboration
   */
  const leaveCollaboration = async (collaborationId: string, amendmentId: string) => {
    try {
      await db.transact([tx.amendmentCollaborators[collaborationId].delete()]);

      // Notify the amendment (entity notification)
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationWithdrawn({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title,
        });
      }

      toast.success('Left collaboration successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to leave collaboration:', error);
      toast.error('Failed to leave collaboration');
      return { success: false, error };
    }
  };

  /**
   * Leave a blog
   */
  const leaveBlog = async (relationId: string) => {
    try {
      await db.transact([tx.blogBloggers[relationId].delete()]);

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

      toast.success('Left blog successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to leave blog:', error);
      toast.error('Failed to leave blog');
      return { success: false, error };
    }
  };

  /**
   * Accept a group invitation
   */
  const acceptGroupInvitation = async (membershipId: string) => {
    try {
      await db.transact([
        tx.groupMemberships[membershipId].update({
          status: 'member',
        }),
      ]);

      // Notify the group (entity notification)
      const membership = memberships.find((m: any) => m.id === membershipId);
      if (membership?.group && userId && userName) {
        await notifyGroupInvitationAccepted({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name || 'Group',
        });
      }

      toast.success('Invitation accepted');
      return { success: true };
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation');
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

      await db.transact([tx.groupMemberships[membershipId].delete()]);

      // Notify the group (entity notification)
      if (membership?.group && userId && userName) {
        await notifyGroupInvitationDeclined({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name || 'Group',
        });
      }

      toast.success('Invitation declined');
      return { success: true };
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      toast.error('Failed to decline invitation');
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

      await db.transact([tx.groupMemberships[membershipId].delete()]);

      // Notify the group (entity notification)
      if (membership?.group && userId && userName) {
        await notifyGroupRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          groupId: membership.group.id,
          groupName: membership.group.name || 'Group',
        });
      }

      toast.success('Request withdrawn');
      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw request:', error);
      toast.error('Failed to withdraw request');
      return { success: false, error };
    }
  };

  /**
   * Accept an event invitation
   */
  const acceptEventInvitation = async (participationId: string) => {
    try {
      await db.transact([
        tx.eventParticipants[participationId].update({
          status: 'member',
        }),
      ]);

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

      toast.success('Event invitation accepted');
      return { success: true };
    } catch (error) {
      console.error('Failed to accept event invitation:', error);
      toast.error('Failed to accept event invitation');
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

      await db.transact([tx.eventParticipants[participationId].delete()]);

      // Notify the event (entity notification)
      if (participation?.event && userId && userName) {
        await notifyEventInvitationDeclined({
          senderId: userId,
          senderName: userName,
          eventId: participation.event.id,
          eventTitle: participation.event.title || 'Event',
        });
      }

      toast.success('Event invitation declined');
      return { success: true };
    } catch (error) {
      console.error('Failed to decline event invitation:', error);
      toast.error('Failed to decline event invitation');
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

      await db.transact([tx.eventParticipants[participationId].delete()]);

      // Notify the event (entity notification)
      if (participation?.event && userId && userName) {
        await notifyEventRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          eventId: participation.event.id,
          eventTitle: participation.event.title || 'Event',
        });
      }

      toast.success('Event request withdrawn');
      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw event request:', error);
      toast.error('Failed to withdraw event request');
      return { success: false, error };
    }
  };

  /**
   * Accept a collaboration invitation
   */
  const acceptCollaborationInvitation = async (collaborationId: string) => {
    try {
      await db.transact([
        tx.amendmentCollaborators[collaborationId].update({
          status: 'member',
        }),
      ]);

      // Notify the amendment (entity notification)
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationInvitationAccepted({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title || 'Amendment',
        });
      }

      toast.success('Collaboration invitation accepted');
      return { success: true };
    } catch (error) {
      console.error('Failed to accept collaboration invitation:', error);
      toast.error('Failed to accept collaboration invitation');
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

      await db.transact([tx.amendmentCollaborators[collaborationId].delete()]);

      // Notify the amendment (entity notification)
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationInvitationDeclined({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title || 'Amendment',
        });
      }

      toast.success('Collaboration invitation declined');
      return { success: true };
    } catch (error) {
      console.error('Failed to decline collaboration invitation:', error);
      toast.error('Failed to decline collaboration invitation');
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

      await db.transact([tx.amendmentCollaborators[collaborationId].delete()]);

      // Notify the amendment (entity notification)
      if (collaboration?.amendment && userId && userName) {
        await notifyCollaborationRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title || 'Amendment',
        });
      }

      toast.success('Collaboration request withdrawn');
      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw collaboration request:', error);
      toast.error('Failed to withdraw collaboration request');
      return { success: false, error };
    }
  };

  /**
   * Accept a blog invitation
   */
  const acceptBlogInvitation = async (blogRelationId: string) => {
    try {
      await db.transact([
        tx.blogBloggers[blogRelationId].update({
          status: 'writer',
        }),
      ]);

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

      toast.success('Blog invitation accepted');
      return { success: true };
    } catch (error) {
      console.error('Failed to accept blog invitation:', error);
      toast.error('Failed to accept blog invitation');
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

      await db.transact([tx.blogBloggers[blogRelationId].delete()]);

      // Notify the blog (entity notification)
      if (blogRelation?.blog && userId && userName) {
        await notifyBlogInvitationDeclined({
          senderId: userId,
          senderName: userName,
          blogId: blogRelation.blog.id,
          blogTitle: blogRelation.blog.title || 'Blog',
        });
      }

      toast.success('Blog invitation declined');
      return { success: true };
    } catch (error) {
      console.error('Failed to decline blog invitation:', error);
      toast.error('Failed to decline blog invitation');
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

      await db.transact([tx.blogBloggers[blogRelationId].delete()]);

      // Notify the blog (entity notification)
      if (blogRelation?.blog && userId && userName) {
        await notifyBlogRequestWithdrawn({
          senderId: userId,
          senderName: userName,
          blogId: blogRelation.blog.id,
          blogTitle: blogRelation.blog.title || 'Blog',
        });
      }

      toast.success('Blog request withdrawn');
      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw blog request:', error);
      toast.error('Failed to withdraw blog request');
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
