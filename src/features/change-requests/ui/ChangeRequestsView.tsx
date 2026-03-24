import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import type { Value } from 'platejs';
import { Button } from '@/features/shared/ui/ui/button';
import { PageWrapper } from '@/layout/page-wrapper';
import { ArrowLeft, FileEdit } from 'lucide-react';
import { AgendaCRVoteTimeline } from '@/features/agendas/ui/AgendaCRVoteTimeline';
import { ChangeRequestCardsList } from '@/features/agendas/ui/ChangeRequestCardsList';
import type { ChangeRequestDiffData } from '@/features/agendas/ui/ChangeRequestTimelineCard';
import { createMockCRTimelineItems, type CRSummary } from '@/features/agendas/logic/createMockCRTimelineItems';
import { useAgendaItemByAmendment } from '@/zero/agendas/useAgendaState';
import type { TDiscussion } from '@/features/editor/types';
import type { ChangeRequestTimelineRow } from '@/zero/agendas/queries';
import { useChangeRequests } from '../hooks/useChangeRequests';

interface ChangeRequestsViewProps {
  amendmentId: string;
  userId?: string;
}

export function ChangeRequestsView({ amendmentId, userId }: ChangeRequestsViewProps) {
  const {
    amendment,
    document,
    openChangeRequests,
    approvedChangeRequests,
    declinedChangeRequests,
    isLoading,
  } = useChangeRequests(amendmentId);

  // Check if this amendment has an agenda item with CR voting timeline
  const { agendaItemId } = useAgendaItemByAmendment(amendmentId);
  const isInVotingStage = amendment?.editing_mode === 'vote_event' || amendment?.editing_mode === 'vote_internal';

  const allChangeRequests = useMemo(
    () => [...openChangeRequests, ...approvedChangeRequests, ...declinedChangeRequests],
    [openChangeRequests, approvedChangeRequests, declinedChangeRequests],
  );

  // Convert ChangeRequest[] → CRSummary[] → mock timeline items
  const crSummaries = useMemo<CRSummary[]>(
    () =>
      allChangeRequests.map((cr) => ({
        id: cr.id,
        crId: cr.crId,
        title: cr.title || cr.crId,
        description: cr.description || '',
        status: cr.resolution
          ? (cr.resolution === 'approved' || cr.resolution === 'accepted' ? 'approved' : 'declined')
          : cr.status,
        type: cr.type,
        text: cr.text,
        newText: cr.newText,
        properties: cr.properties as Record<string, string>,
        newProperties: cr.newProperties as Record<string, string>,
        justification: cr.justification,
      })),
    [allChangeRequests],
  );

  const mockTimelineItems = useMemo(
    () => createMockCRTimelineItems(crSummaries) as unknown as ChangeRequestTimelineRow[],
    [crSummaries],
  );

  // Build diffMap: keyed by cr.id (= change_request_id in mock items)
  const diffMap = useMemo<Record<string, ChangeRequestDiffData>>(() => {
    const map: Record<string, ChangeRequestDiffData> = {};
    for (const cr of allChangeRequests) {
      map[cr.id] = {
        changeType: cr.type,
        originalText: cr.text || undefined,
        newText: cr.newText || undefined,
        properties: cr.properties as Record<string, string> | undefined,
        newProperties: cr.newProperties as Record<string, string> | undefined,
        justification: cr.justification || undefined,
      };
    }
    return map;
  }, [allChangeRequests]);

  // Build TDiscussion-compatible array for SuggestionViewToggle
  const discussions = useMemo<TDiscussion[]>(
    () =>
      allChangeRequests
        .filter((cr) => !!cr.crId)
        .map((cr) => ({
          id: cr.id,
          crId: cr.crId,
          title: cr.title || cr.crId,
          userId: cr.userId,
          comments: [],
          createdAt: new Date(cr.createdAt),
          isResolved: cr.isResolved,
        })),
    [allChangeRequests],
  );

  const documentContent = document?.content as Value | undefined;

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="py-12 text-center">Loading change requests...</div>
      </PageWrapper>
    );
  }

  if (!amendment) {
    return (
      <PageWrapper>
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Amendment Not Found</h1>
          <p className="text-muted-foreground">
            The amendment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Back button */}
      <div className="mb-6">
        <Link to="/amendment/$id" params={{ id: amendmentId }}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Amendment
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <FileEdit className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Change Requests</h1>
        </div>
        <p className="text-muted-foreground">
          {openChangeRequests.length} open, {approvedChangeRequests.length} approved,{' '}
          {declinedChangeRequests.length} declined change request
          {allChangeRequests.length !== 1 ? 's' : ''} for this amendment
        </p>
      </div>

      {/* CR Voting Timeline — shown when amendment is in a voting stage */}
      {isInVotingStage && agendaItemId && (
        <div className="mb-8">
          <AgendaCRVoteTimeline
            agendaItemId={agendaItemId}
            userId={userId}
          />
        </div>
      )}

      {/* Change Request Cards — agenda-item style */}
      {allChangeRequests.length > 0 && (
        <ChangeRequestCardsList
          items={mockTimelineItems}
          editingMode={amendment.editing_mode}
          isVotingActive={false}
          userId={userId}
          diffMap={diffMap}
          documentContent={documentContent}
          discussions={discussions}
          amendmentId={amendment.id}
          agendaItemId={agendaItemId ?? undefined}
        />
      )}
    </PageWrapper>
  );
}
