import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { ReadonlyJSONValue } from '@rocicorp/zero';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { findShortestPath, type GroupRelationship, type GroupNode } from '@/features/amendments/logic/path-finding.ts';
import { notifyAmendmentCloned } from '@/features/notifications/utils/notification-helpers.ts';

interface CloneAmendmentDocument {
  readonly content: ReadonlyJSONValue | null;
}

interface CloneAmendmentData {
  readonly title: string | null;
  readonly code: string | null;
  readonly reason: string | null;
  readonly category: string | null;
  readonly preamble: string | null;
  readonly tags: string[] | null;
  readonly visibility: string;
  readonly editing_mode: string | null;
  readonly discussions: ReadonlyJSONValue | null;
  readonly image_url: string | null;
  readonly documents: readonly CloneAmendmentDocument[];
}

interface CloneNetworkMembership {
  readonly status: string | null;
  readonly user: { readonly id: string } | undefined;
  readonly group: { readonly id: string } | undefined;
}

interface CloneNetworkGroup {
  readonly id: string;
  readonly name: string | null;
  readonly description: string | null;
}

interface CloneNetworkEvent {
  readonly id: string;
  readonly title: string | null;
  readonly start_date: number | null;
  readonly group: { readonly id: string } | undefined;
}

interface CloneNetworkRelationship {
  readonly id: string;
  readonly with_right: string | null;
  readonly group_id: string;
  readonly related_group_id: string;
  readonly group: { readonly id: string; readonly name: string | null; readonly description: string | null } | undefined;
  readonly related_group: { readonly id: string; readonly name: string | null; readonly description: string | null } | undefined;
}

interface CloneNetworkData {
  groupMemberships: readonly CloneNetworkMembership[];
  groups: readonly CloneNetworkGroup[];
  groupRelationships: readonly CloneNetworkRelationship[];
  events: readonly CloneNetworkEvent[];
}

interface CloneSelection {
  groupId: string;
  groupData: { id: string; name?: string | null; description?: string | null };
  eventId: string;
  eventData: { id: string; title?: string | null };
  collaboratorUserId: string;
}

export function useCloneAmendment(
  amendmentId: string,
  amendment: CloneAmendmentData | null | undefined,
  networkData: CloneNetworkData | null | undefined,
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
    if (!amendment) {
      toast.error('Amendment data not loaded');
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
        networkData?.groupMemberships.filter(
          (m) => (m.status === 'active' || m.status === 'admin') && m.user?.id === targetUserId,
        ) ?? [];
      const userGroupIds = userMemberships.map(m => m.group?.id).filter((id): id is string => !!id);
      const allGroups = networkData?.groups ?? [];
      const rawRelationships = networkData?.groupRelationships ?? [];
      const events = networkData?.events ?? [];

      const amendmentRelationships: GroupRelationship[] = rawRelationships
        .filter(r => r.with_right === 'amendmentRight')
        .map(r => ({
          id: r.id,
          withRight: r.with_right ?? '',
          parentGroup: {
            id: r.group?.id ?? r.group_id,
            name: r.group?.name ?? '',
            description: r.group?.description ?? undefined,
          },
          childGroup: {
            id: r.related_group?.id ?? r.related_group_id,
            name: r.related_group?.name ?? '',
            description: r.related_group?.description ?? undefined,
          },
        }));

      const groupsMap = new Map<string, GroupNode>();
      allGroups.forEach(g => {
        groupsMap.set(g.id, { id: g.id, name: g.name ?? '', description: g.description ?? undefined });
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
      const pathWithEvents = path.map((segment) => {
        const groupId = segment.group.id;
        const groupName = segment.group.name;

        const groupEvents = events.filter(
          e => e.group?.id === groupId && e.start_date != null && new Date(e.start_date) > now,
        );
        groupEvents.sort(
          (a, b) => (a.start_date ?? 0) - (b.start_date ?? 0),
        );
        const closestEvent = groupEvents[0];

        return {
          groupId,
          groupName,
          eventId: closestEvent?.id ?? null,
          eventTitle: (closestEvent?.title ?? null) || 'No upcoming event',
          eventStartDate: closestEvent?.start_date ?? null,
        };
      });

      // Override the last segment's event with the user-selected event
      const lastSegment = pathWithEvents[pathWithEvents.length - 1];
      if (lastSegment && lastSegment.groupId === targetGroupId) {
        lastSegment.eventId = selectedEventId;
        const selectedEvent = events.find(e => e.id === selectedEventId);
        if (selectedEvent) {
          lastSegment.eventTitle = selectedEvent.title ?? 'No upcoming event';
          lastSegment.eventStartDate = selectedEvent.start_date ?? null;
        }
      }

      // Find the closest event in the path
      const eventsWithDates = pathWithEvents.filter(
        (seg) => seg.eventStartDate != null,
      );
      eventsWithDates.sort((a, b) => {
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
            title: `Amendment: ${amendment.title ?? ''} (Clone)`,
            description: amendment.reason ?? '',
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
            majority_type: null,
            time_limit: null,
            voting_phase: null,
          });

          // TODO: Wire up to new vote model if needed
          // Old castAmendmentVote removed with voting migration
        }

        enrichedPath.push({
          ...segment,
          agendaItemId,
          amendmentVoteId,
          forwardingStatus,
        });
      }

      // Create cloned document first so amendment can reference it
      await createDocument({
        id: cloneDocumentId,
        amendment_id: null,
        content: originalDocument?.content ?? { type: 'doc', content: [] },
        editing_mode: 'collaborative',
      });

      // Create cloned amendment
      await createAmendment({
        id: cloneId,
        title: `${amendment.title ?? ''} (Clone)`,
        code: amendment.code ? `${amendment.code}-CLONE` : '',
        status: 'Drafting',
        workflow_status: '',
        reason: amendment.reason ?? '',
        category: amendment.category ?? '',
        preamble: amendment.preamble ?? '',
        group_id: targetGroupId,
        event_id: selectedEventId,
        clone_source_id: amendmentId,
        document_id: cloneDocumentId,
        tags: amendment.tags ?? [],
        visibility: amendment.visibility ?? 'public',
        is_public: true,
        editing_mode: amendment.editing_mode ?? 'collaborative',
        discussions: amendment.discussions ?? [],
        x: '',
        youtube: '',
        linkedin: '',
        website: '',
        image_url: amendment.image_url ?? null,
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
          event_id: segment.eventId ?? null,
          order_index: index,
          status: segment.forwardingStatus,
        });
      }

      // Notify about the clone
      await notifyAmendmentCloned({
        senderId: userId,
        senderName: userEmail || 'Someone',
        originalAmendmentId: amendmentId,
        originalAmendmentTitle: amendment.title ?? '',
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
