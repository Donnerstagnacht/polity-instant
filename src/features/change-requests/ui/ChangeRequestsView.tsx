import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/features/shared/ui/ui/button';
import { PageWrapper } from '@/layout/page-wrapper';
import { ArrowLeft, FileEdit } from 'lucide-react';
import { ChangeRequestCardsList } from '@/features/agendas/ui/ChangeRequestCardsList';
import { useAgendaItemByAmendment } from '@/zero/agendas/useAgendaState';
import { useAgendaItemCRVoting } from '@/features/agendas/hooks/useAgendaItemCRVoting';
import { useChangeRequests } from '../hooks/useChangeRequests';
import { createMockCRTimelineItems, type CRSummary } from '@/features/agendas/logic/createMockCRTimelineItems';
import type { ChangeRequestDiffData } from '@/features/agendas/ui/ChangeRequestTimelineCard';
import type { ChangeRequestTimelineRow } from '@/zero/agendas/queries';

interface ChangeRequestsViewProps {
  amendmentId: string;
  userId?: string;
}

export function ChangeRequestsView({ amendmentId, userId }: ChangeRequestsViewProps) {
  const {
    amendment,
    changeRequests,
    isLoading,
  } = useChangeRequests(amendmentId);

  // Check if this amendment has an agenda item with CR voting timeline
  const { agendaItemId } = useAgendaItemByAmendment(amendmentId);
  const isInVotingStage = amendment?.editing_mode === 'vote_event' || amendment?.editing_mode === 'vote_internal';

  // Real CR voting timeline (only used when in voting stage)
  const crVoting = useAgendaItemCRVoting(agendaItemId ?? '', userId);

  // Build diff map from useChangeRequests data (provides text diff info from document)
  const diffMap = useMemo<Record<string, ChangeRequestDiffData>>(() => {
    const map: Record<string, ChangeRequestDiffData> = {};
    for (const cr of changeRequests) {
      // Key by the suggestion id (used as mock CR id) and by changeRequestEntityId
      const diff: ChangeRequestDiffData = {
        changeType: cr.type || undefined,
        originalText: cr.text || undefined,
        newText: cr.newText || undefined,
        properties: cr.properties as Record<string, string> | undefined,
        newProperties: cr.newProperties as Record<string, string> | undefined,
        justification: cr.justification || undefined,
      };
      map[cr.id] = diff;
      if (cr.changeRequestEntityId) {
        map[cr.changeRequestEntityId] = diff;
      }
    }
    return map;
  }, [changeRequests]);

  // Build mock timeline items for non-voting mode
  const mockItems = useMemo(() => {
    if (isInVotingStage && crVoting.crTimeline.length > 0) return [];

    const summaries: CRSummary[] = changeRequests.map(cr => ({
      id: cr.id,
      crId: cr.crId,
      title: cr.title || cr.crId,
      description: cr.description || '',
      status: cr.isResolved ? (cr.resolution || cr.status) : 'open',
      type: cr.type,
      text: cr.text,
      newText: cr.newText,
      properties: cr.properties as Record<string, string> | undefined,
      newProperties: cr.newProperties as Record<string, string> | undefined,
      justification: cr.justification,
    }));

    return createMockCRTimelineItems(summaries);
  }, [changeRequests, isInVotingStage, crVoting.crTimeline.length]);

  // Determine which items to display
  const useRealTimeline = isInVotingStage && agendaItemId && crVoting.crTimeline.length > 0;
  const displayItems = useRealTimeline
    ? crVoting.crTimeline
    : mockItems as unknown as ChangeRequestTimelineRow[];

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
            The amendment you&apos;re looking for doesn&apos;t exist or has been removed.
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
      </div>

      {/* Unified CR Cards List with tabs */}
      <ChangeRequestCardsList
        items={displayItems}
        editingMode={amendment.editing_mode}
        isVotingActive={!!useRealTimeline}
        userId={userId}
        canManage={false}
        canVote={false}
        currentItemId={useRealTimeline ? crVoting.currentItem?.id : null}
        diffMap={diffMap}
        progress={useRealTimeline ? crVoting.progress : undefined}
        completedCount={useRealTimeline ? crVoting.completedItems.length : undefined}
        allCRsProcessed={useRealTimeline ? crVoting.allCRsProcessed : undefined}
        isTimelineComplete={useRealTimeline ? crVoting.isTimelineComplete : undefined}
        hasUserVoted={useRealTimeline ? crVoting.hasUserVoted : undefined}
        getUserSelectedChoiceIds={useRealTimeline ? crVoting.getUserSelectedChoiceIds : undefined}
        onCastVote={useRealTimeline ? crVoting.castCRVote : undefined}
        onStartIndicative={useRealTimeline ? crVoting.startIndicativePhase : undefined}
        onStartFinal={useRealTimeline ? crVoting.startFinalPhase : undefined}
        onCloseVoting={useRealTimeline ? crVoting.closeVoting : undefined}
      />
    </PageWrapper>
  );
}
