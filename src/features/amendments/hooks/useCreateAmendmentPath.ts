import { useCallback } from 'react';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useVoteActions } from '@/zero/votes/useVoteActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import type { EnrichedPathSegment } from '@/features/amendments/logic/amendmentPathHelpers';

interface CreateAmendmentPathArgs {
  amendmentId: string;
  amendmentTitle: string;
  amendmentReason: string | null;
  enrichedPath: EnrichedPathSegment[];
  workflowId?: string | null;
}

/**
 * Orchestration hook that persists an amendment path with its
 * agenda items, votes, and path segments.
 *
 * Used by both the create flow (useCreateAmendmentForm) and the
 * process flow (AmendmentProcessFlow) to ensure identical path creation.
 */
export function useCreateAmendmentPath() {
  const { createPath, createPathSegment } = useAmendmentActions();
  const { createVote } = useVoteActions();
  const { createAgendaItem } = useAgendaActions();

  const createAmendmentPath = useCallback(
    async ({
      amendmentId,
      amendmentTitle,
      amendmentReason,
      enrichedPath,
      workflowId,
    }: CreateAmendmentPathArgs) => {
      // Create agenda items and votes for each segment with an event
      for (const segment of enrichedPath) {
        if (segment.eventId && segment.agendaItemId && segment.amendmentVoteId) {
          await createAgendaItem({
            id: segment.agendaItemId,
            title: `Amendment: ${amendmentTitle}`,
            description: amendmentReason || '',
            type: 'amendment',
            status: 'pending',
            forwarding_status: segment.forwardingStatus,
            order_index: 999,
            duration: 0,
            scheduled_time: '',
            start_time: 0,
            end_time: 0,
            activated_at: 0,
            completed_at: 0,
            event_id: segment.eventId,
            amendment_id: amendmentId,
            majority_type: null,
            time_limit: null,
            voting_phase: null,
          });

          await createVote({
            id: segment.amendmentVoteId,
            agenda_item_id: segment.agendaItemId,
            amendment_id: amendmentId,
            title: `Amendment: ${amendmentTitle}`,
            description: amendmentReason || null,
            closing_duration_seconds: null,
            closing_end_time: null,
          });
        }
      }

      // Create path record
      const pathId = crypto.randomUUID();
      await createPath({
        id: pathId,
        amendment_id: amendmentId,
        title: '',
        workflow_id: workflowId ?? null,
      });

      // Create path segments
      for (const [index, segment] of enrichedPath.entries()) {
        await createPathSegment({
          id: crypto.randomUUID(),
          path_id: pathId,
          group_id: segment.groupId,
          event_id: segment.eventId || '',
          order_index: index,
          status: segment.forwardingStatus,
        });
      }
    },
    [createPath, createPathSegment, createVote, createAgendaItem]
  );

  return { createAmendmentPath };
}
