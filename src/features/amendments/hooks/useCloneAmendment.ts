import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { findShortestPath } from '@/features/shared/utils/path-finding';
import { notifyAmendmentCloned } from '@/features/shared/utils/notification-helpers';

interface CloneSelection {
  groupId: string;
  groupData: any;
  eventId: string;
  eventData: any;
  collaboratorUserId: string;
}

export function useCloneAmendment(
  amendmentId: string,
  amendment: any,
  networkData: any,
  userId: string | undefined,
  userEmail: string | undefined,
) {
  const navigate = useNavigate();
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [selectedTargetGroupId, setSelectedTargetGroupId] = useState<string>('');

  const {
    createAmendment,
    requestCollaboration: addAmendmentCollaborator,
    castAmendmentVote,
    createPath,
    createPathSegment,
  } = useAmendmentActions();
  const { createDocument } = useDocumentActions();
  const { createAgendaItem } = useAgendaActions();

  const handleClone = () => {
    if (!userId) {
      toast.error('Please log in to clone this amendment');
      return;
    }
    setCloneDialogOpen(true);
  };

  const handleConfirmClone = async (selection: CloneSelection) => {
    if (!userId) {
      toast.error('Please log in to clone this amendment');
      return;
    }

    const {
      groupId: targetGroupId,
      eventId: selectedEventId,
      collaboratorUserId,
    } = selection;

    setIsCloning(true);
    try {
      const cloneId = crypto.randomUUID();
      const cloneDocumentId = crypto.randomUUID();
      const collaboratorId = crypto.randomUUID();
      const pathId = crypto.randomUUID();

      const originalDocument = amendment.documents?.[0];

      // Calculate path
      const targetUserId = collaboratorUserId || userId;
      const userMemberships =
        networkData?.groupMemberships?.filter(
          (m: any) => (m.status === 'member' || m.status === 'admin') && m.user?.id === targetUserId,
        ) || [];
      const userGroupIds = userMemberships.map((m: any) => m.group.id);
      const allGroups = networkData?.groups || [];
      const relationships = networkData?.groupRelationships || [];
      const events = networkData?.events || [];

      const amendmentRelationships = relationships.filter(
        (r: any) => r.withRight === 'amendmentRight',
      );

      const groupsMap = new Map();
      allGroups.forEach((g: any) => {
        groupsMap.set(g.id, { id: g.id, name: g.name, description: g.description });
      });

      const path = findShortestPath(
        userGroupIds,
        targetGroupId,
        amendmentRelationships,
        groupsMap,
      );

      if (!path || path.length === 0) {
        toast.error('No valid path found to target group');
        setIsCloning(false);
        return;
      }

      // For each group in path, find the closest upcoming event
      const now = new Date();
      const pathWithEvents = path.map((segment: any) => {
        const groupId = segment.group.id;
        const groupName = segment.group.name;

        const groupEvents = events.filter(
          (e: any) => e.group?.id === groupId && new Date(e.startDate) > now,
        );
        groupEvents.sort(
          (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
        const closestEvent = groupEvents[0];

        return {
          groupId,
          groupName,
          eventId: closestEvent?.id || null,
          eventTitle: closestEvent?.title || 'No upcoming event',
          eventStartDate: closestEvent?.startDate || null,
        };
      });

      // Override the last segment's event with the user-selected event
      const lastSegment = pathWithEvents[pathWithEvents.length - 1];
      if (lastSegment && lastSegment.groupId === targetGroupId) {
        lastSegment.eventId = selectedEventId;
        const selectedEvent = events.find((e: any) => e.id === selectedEventId);
        if (selectedEvent) {
          lastSegment.eventTitle = selectedEvent.title;
          lastSegment.eventStartDate = selectedEvent.startDate;
        }
      }

      // Find the closest event in the path
      const eventsWithDates = pathWithEvents.filter(
        (seg: { eventStartDate: string | null }) => seg.eventStartDate,
      );
      eventsWithDates.sort((a: any, b: any) => {
        const dateA = a.eventStartDate ? new Date(a.eventStartDate).getTime() : 0;
        const dateB = b.eventStartDate ? new Date(b.eventStartDate).getTime() : 0;
        return dateA - dateB;
      });
      const closestEventId = eventsWithDates.length > 0 ? eventsWithDates[0].eventId : null;

      // Create agenda items and votes for each event in the path
      const enrichedPath = [];

      for (const segment of pathWithEvents) {
        let agendaItemId = null;
        let amendmentVoteId = null;
        let forwardingStatus = 'previous_decision_outstanding';

        if (segment.eventId) {
          agendaItemId = crypto.randomUUID();
          amendmentVoteId = crypto.randomUUID();

          if (segment.eventId === closestEventId) {
            forwardingStatus = 'forward_confirmed';
          }

          await createAgendaItem({
            id: agendaItemId,
            title: `Amendment: ${amendment.title} (Clone)`,
            description: amendment.reason || '',
            type: 'amendment',
            status: 'pending',
            forwarding_status: forwardingStatus,
            order_index: 999,
            duration: 0,
            scheduled_time: '',
            start_time: 0,
            end_time: 0,
            activated_at: 0,
            completed_at: 0,
            event_id: segment.eventId,
            amendment_id: cloneId,
          });

          await castAmendmentVote({
            id: amendmentVoteId,
            amendment_id: cloneId,
            event_id: segment.eventId,
            vote: 'pending',
            weight: 1,
            is_delegate_vote: false,
            group_id: null,
          });
        }

        enrichedPath.push({
          ...segment,
          agendaItemId,
          amendmentVoteId,
          forwardingStatus,
        });
      }

      // Create cloned amendment
      await createAmendment({
        id: cloneId,
        title: `${amendment.title} (Clone)`,
        code: amendment.code ? `${amendment.code}-CLONE` : '',
        status: 'Drafting',
        workflow_status: '',
        reason: amendment.reason || '',
        category: amendment.category || '',
        preamble: amendment.preamble || '',
        group_id: targetGroupId,
        event_id: selectedEventId,
        clone_source_id: amendmentId,
        tags: amendment.tags || [],
        visibility: amendment.visibility || 'public',
        is_public: true,
        editing_mode: amendment.editing_mode || 'collaborative',
        discussions: amendment.discussions || [],
        x: '',
        youtube: '',
        linkedin: '',
        website: '',
      });

      // Create cloned document
      await createDocument({
        id: cloneDocumentId,
        amendment_id: cloneId,
        content: originalDocument?.content || { type: 'doc', content: [] },
        editing_mode: 'collaborative',
      });

      // Add current user as admin collaborator
      await addAmendmentCollaborator({
        id: collaboratorId,
        status: 'admin',
        visibility: 'public',
        amendment_id: cloneId,
        user_id: userId,
        role_id: null,
      });

      // Create path record
      await createPath({
        id: pathId,
        amendment_id: cloneId,
        title: '',
      });

      // Create path segments
      for (const [index, segment] of enrichedPath.entries()) {
        const segmentId = crypto.randomUUID();
        await createPathSegment({
          id: segmentId,
          path_id: pathId,
          group_id: segment.groupId,
          event_id: segment.eventId || undefined,
          order_index: index,
          status: segment.forwardingStatus,
        });
      }

      // Notify about the clone
      await notifyAmendmentCloned({
        senderId: userId,
        senderName: userEmail || 'Someone',
        originalAmendmentId: amendmentId,
        originalAmendmentTitle: amendment.title,
        newAmendmentId: cloneId,
      });

      toast.success('Amendment cloned successfully!');
      setCloneDialogOpen(false);
      navigate({ to: `/amendment/${cloneId}` });
    } catch (error) {
      console.error('Error cloning amendment:', error);
      toast.error('Failed to clone amendment');
    } finally {
      setIsCloning(false);
    }
  };

  return {
    cloneDialogOpen,
    setCloneDialogOpen,
    isCloning,
    selectedTargetGroupId,
    setSelectedTargetGroupId,
    handleClone,
    handleConfirmClone,
  };
}
