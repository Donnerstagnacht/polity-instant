import { Link, useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useEventAgendaItem } from '../hooks/useEventAgendaItem';
import { TransferAgendaItemDialog } from './TransferAgendaItemDialog';
import { AgendaItemContextCard } from './AgendaItemContextCard';
import {
  AgendaRelatedAmendmentCard,
  AgendaRelatedPositionCard,
} from './AgendaRelatedEntityCard';
import { AgendaSpeakerListSection } from './AgendaSpeakerListSection';
import { AgendaVoteSection } from './AgendaVoteSection';
import { AgendaElectionSection } from './AgendaElectionSection';
import { AgendaActionBar } from './AgendaActionBar';
import { EditElectionVoteDialog } from './EditElectionVoteDialog';
import { useAgendaActionBar } from '../hooks/useAgendaActionBar';
import { useAgendaNavigation } from '../hooks/useAgendaNavigation';
import { VoteCastDialog } from '@/features/vote-cast/ui/VoteCastDialog';
import { AccreditationSection } from './AccreditationSection';
import { usePermissions } from '@/zero/rbac';
import { useVotingPasswordActions } from '@/zero/voting-password/useVotingPasswordActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/features/shared/hooks/use-translation';

function getEffectiveVotingPhase(
  status?: string | null,
  fallback?: string | null,
): string | null {
  if (status === 'final' || status === 'final_vote') return 'final_vote';
  if (status === 'closed') return 'closed';
  if (status === 'indicative') return 'indication';
  return fallback ?? null;
}

export function EventAgendaItemDetail({
  eventId,
  agendaItemId,
}: {
  eventId: string;
  agendaItemId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateSpeaker } = useAgendaActions();
  const {
    agendaItem,
    event,
    user,
    isLoading,
    votingLoading,
    addingSpeaker,
    election,
    candidates,
    electors,
    vote,
    choices,
    userElector,
    userVoter,
    estimatedStartTime,
    handleElectionVote,
    handleAmendmentVote,
    handleDelete,
    handleAddToSpeakerList,
  } = useEventAgendaItem(eventId, agendaItemId);

  const { can, canVote, canBeCandidate } = usePermissions({ eventId });
  const canManageAgenda = can('manage', 'agendaItems');
  const hasVotingRight = canVote();
  const hasCandidateRight = canBeCandidate();

  // Agenda navigation (Previous / Complete / Next)
  const agendaNav = useAgendaNavigation(eventId);

  const { verifyVotingPassword } = useVotingPasswordActions();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordVerifying, setIsPasswordVerifying] = useState(false);
  const effectiveVotingPhase = getEffectiveVotingPhase(
    election?.status ?? vote?.status,
    agendaItem?.voting_phase ?? null,
  );

  // Action bar hook — pass election/vote data for phase management
  const actionBarHook = useAgendaActionBar({
    eventId,
    currentAgendaItem: agendaItem ? {
      id: agendaItem.id,
      type: agendaItem.type,
      status: agendaItem.status,
      voting_phase: effectiveVotingPhase,
      speaker_list: agendaItem.speaker_list ?? undefined,
    } : null,
    eventTitle: event?.title ?? undefined,
    election: election ?? undefined,
    vote: vote ?? undefined,
    electorId: userElector?.id,
    voterId: userVoter?.id,
  });

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [markingSpeakerComplete, setMarkingSpeakerComplete] = useState<string | null>(null);

  // Handler: Mark speaker as completed
  const handleMarkSpeakerCompleted = async (speakerId: string) => {
    if (!user || !canManageAgenda) return;

    setMarkingSpeakerComplete(speakerId);
    try {
      const now = Date.now();
      await updateSpeaker({
        id: speakerId,
        completed: true,
        end_time: now,
      });

      // Set start_time on the next active speaker (if any)
      const sorted = [...speakerListData].sort((a, b) => a.order - b.order);
      const activeAfter = sorted.filter(s => !s.completed && s.id !== speakerId);
      if (activeAfter.length > 0) {
        const next = activeAfter[0];
        await updateSpeaker({
          id: next.id,
          start_time: now,
        });
      }

      toast.success(t('features.events.agenda.markCompleted'));
    } catch (error) {
      console.error('Error marking speaker completed:', error);
      toast.error('Fehler beim Markieren');
    } finally {
      setMarkingSpeakerComplete(null);
    }
  };

  // Prepare speaker list data
  const speakerListData = useMemo(() => {
    return (agendaItem?.speaker_list || []).map((speaker) => ({
      id: speaker.id,
      order: speaker.order_index || 0,
      time: speaker.time || 3,
      completed: speaker.completed || false,
      title: speaker.title ?? undefined,
      startTime: speaker.start_time ?? undefined,
      endTime: speaker.end_time ?? undefined,
      user: speaker.user
        ? {
            id: speaker.user.id,
            name: `${speaker.user.first_name ?? ''} ${speaker.user.last_name ?? ''}`.trim() || undefined,
            email: speaker.user.email ?? undefined,
            avatar: speaker.user.avatar ?? undefined,
          }
        : undefined,
    }));
  }, [agendaItem?.speaker_list]);

  const isUserInSpeakerList = speakerListData.some(speaker => speaker.user?.id === user?.id && !speaker.completed);

  // Derive election/vote data for section components
  const indicativeSelections = useMemo(
    () => election?.indicative_selections ?? [],
    [election?.indicative_selections],
  );
  const finalSelections = useMemo(
    () => election?.final_selections ?? [],
    [election?.final_selections],
  );
  const userHasElectionVoted = useMemo(() => {
    if (!userElector) return false;
    const phase = election?.status;
    if (phase === 'final' || phase === 'final_vote') {
      return (election?.final_participations ?? []).some(
        (p: { elector_id?: string | null }) => p.elector_id === userElector.id,
      );
    }
    return (election?.indicative_participations ?? []).some(
      (p: { elector_id?: string | null }) => p.elector_id === userElector.id,
    );
  }, [userElector, election]);

  const userSelectedCandidateIds = useMemo(() => {
    if (!userElector) return [];
    const phase = election?.status;
    const participations = phase === 'final' || phase === 'final_vote'
      ? election?.final_participations ?? []
      : election?.indicative_participations ?? [];
    const userPart = participations.find(
      (p: { elector_id?: string | null }) => p.elector_id === userElector.id,
    );
    if (!userPart) return [];
    return (userPart.selections ?? []).map(
      (s: { candidate_id?: string | null; candidate?: { id: string } | null }) =>
        s.candidate?.id ?? s.candidate_id ?? '',
    ).filter(Boolean);
  }, [userElector, election]);

  const indicativeDecisions = useMemo(
    () => vote?.indicative_decisions ?? [],
    [vote?.indicative_decisions],
  );
  const finalDecisions = useMemo(
    () => vote?.final_decisions ?? [],
    [vote?.final_decisions],
  );
  const userHasVoteVoted = useMemo(() => {
    if (!userVoter) return false;
    const phase = vote?.status;
    if (phase === 'final' || phase === 'final_vote') {
      return (vote?.final_participations ?? []).some(
        (p: { voter_id?: string | null }) => p.voter_id === userVoter.id,
      );
    }
    return (vote?.indicative_participations ?? []).some(
      (p: { voter_id?: string | null }) => p.voter_id === userVoter.id,
    );
  }, [userVoter, vote]);

  const userSelectedChoiceIds = useMemo(() => {
    if (!userVoter) return [];
    const phase = vote?.status;
    const participations = phase === 'final' || phase === 'final_vote'
      ? vote?.final_participations ?? []
      : vote?.indicative_participations ?? [];
    const userPart = participations.find(
      (p: { voter_id?: string | null }) => p.voter_id === userVoter.id,
    );
    if (!userPart) return [];
    return (userPart.decisions ?? []).map(
      (d: { choice_id?: string | null; choice?: { id: string } | null }) =>
        d.choice?.id ?? d.choice_id ?? '',
    ).filter(Boolean);
  }, [userVoter, vote]);

  const voteAmendment = vote?.amendment ?? agendaItem?.amendment ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 animate-pulse rounded bg-muted"></div>
        <div className="h-64 animate-pulse rounded bg-muted"></div>
      </div>
    );
  }

  if (!agendaItem || !event) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Tagesordnungspunkt nicht gefunden</h2>
          <p className="mb-4 text-muted-foreground">
            Der gesuchte Tagesordnungspunkt existiert nicht oder wurde gelöscht.
          </p>
          <Button asChild>
            <Link to="/event/$id/agenda" params={{ id: eventId }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Tagesordnung
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fixed Action Bar */}
      <AgendaActionBar
        eventId={eventId}
        currentAgendaItem={{
          id: agendaItem.id,
          type: agendaItem.type,
          status: agendaItem.status,
          voting_phase: effectiveVotingPhase,
          election: election ? { id: election.id } : null,
          vote: vote ? { id: vote.id } : null,
        }}
        canManageAgenda={actionBarHook.canManageAgenda}
        canVote={actionBarHook.hasVotingRight}
        canBeCandidate={actionBarHook.hasCandidateRight}
        isEventStarted={event?.status === 'active' || event?.status === 'in-progress'}
        isUserInSpeakerList={actionBarHook.isUserInSpeakerList}
        isUserCandidate={actionBarHook.isUserCandidate}
        hasPreviousItem={agendaNav.hasPreviousItem}
        hasNextItem={agendaNav.hasNextItem}
        onPreviousItem={agendaNav.moveToPreviousItem}
        onNextItem={agendaNav.moveToNextItem}
        onCompleteItem={agendaNav.completeCurrentItem}
        navigationLoading={agendaNav.isLoading}
        speakerLoading={actionBarHook.speakerLoading}
        candidateLoading={actionBarHook.candidateLoading}
        onBackToAgenda={() => navigate({ to: '/event/$id/agenda', params: { id: eventId } })}
        onMoveToEvent={() => setTransferDialogOpen(true)}
        onEditItem={actionBarHook.handleEditClick}
        onDeleteItem={handleDelete}
        onJoinSpeakerList={actionBarHook.handleJoinSpeakerList}
        onLeaveSpeakerList={actionBarHook.handleLeaveSpeakerList}
        onBecomeCandidate={actionBarHook.handleBecomeCandidate}
        onWithdrawCandidacy={actionBarHook.handleWithdrawCandidacy}
        onStartFinalVote={actionBarHook.handleStartFinalVote}
        onCloseFinalVote={actionBarHook.handleCloseFinalVote}
        onVoteClick={actionBarHook.handleVoteClick}
      />
      {/* Spacer for fixed toolbar */}
      <div className="h-10" />

      {/* Vote Cast Dialog (with password support) */}
      <VoteCastDialog
        open={actionBarHook.voteDialogOpen}
        onOpenChange={actionBarHook.setVoteDialogOpen}
        phase={actionBarHook.voteCasting.phase}
        title={agendaItem.title ?? undefined}
        candidates={election ? candidates.map(c => ({
          id: c.id,
          name: c.user ? `${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim() || c.user.email || 'Candidate' : c.name || 'Candidate',
          avatar: c.user?.avatar ?? undefined,
        })) : undefined}
        maxVotes={election?.max_votes ?? 1}
        choices={vote ? choices.map(c => ({
          id: c.id,
          label: c.label || 'Choice',
        })) : undefined}
        requirePassword
        passwordError={passwordError}
        isPasswordVerifying={isPasswordVerifying}
        onPasswordSubmit={async (password: string) => {
          setPasswordError(null);
          setIsPasswordVerifying(true);
          try {
            await verifyVotingPassword(password);
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            setPasswordError(message);
            throw err;
          } finally {
            setIsPasswordVerifying(false);
          }
        }}
        onCastVote={actionBarHook.voteCasting.castAmendmentVote}
        onCastElectionVote={actionBarHook.voteCasting.castElectionVote}
        isLoading={actionBarHook.voteCasting.isLoading}
      />

      {/* Edit Election/Vote Dialog */}
      <EditElectionVoteDialog
        open={actionBarHook.editDialogOpen}
        onOpenChange={actionBarHook.setEditDialogOpen}
        agendaItemId={agendaItem.id}
        agendaItemTitle={agendaItem.title ?? null}
        agendaItemDescription={agendaItem.description ?? null}
        election={election ?? undefined}
        vote={vote ?? undefined}
        choices={choices.map(c => ({
          id: c.id,
          label: c.label,
          order_index: c.order_index,
        }))}
      />

      {/* Section 1: Context Card */}
      <AgendaItemContextCard
        agendaItem={{
          id: agendaItem.id,
          title: agendaItem.title || '',
          description: agendaItem.description ?? undefined,
          type: agendaItem.type || '',
          status: agendaItem.status || '',
          duration: agendaItem.duration ?? undefined,
          scheduledTime: estimatedStartTime?.toISOString() ?? agendaItem.scheduled_time ?? undefined,
          startTime: agendaItem.start_time ? new Date(agendaItem.start_time) : undefined,
          endTime: agendaItem.end_time ? new Date(agendaItem.end_time) : undefined,
          activatedAt: agendaItem.activated_at ? new Date(agendaItem.activated_at) : undefined,
          completedAt: agendaItem.completed_at ? new Date(agendaItem.completed_at) : undefined,
        }}
        votingStartTime={agendaItem.start_time ? new Date(agendaItem.start_time) : undefined}
        votingEndTime={
          (election?.closing_end_time ?? vote?.closing_end_time)
            ? new Date(election?.closing_end_time ?? vote?.closing_end_time ?? 0)
            : undefined
        }
      />

      {/* Section 2: Speaker List */}
      <AgendaSpeakerListSection
        speakers={speakerListData}
        isUserInSpeakerList={isUserInSpeakerList}
        canManageSpeakers={canManageAgenda}
        isAddingSpeaker={addingSpeaker}
        isRemovingSpeaker={actionBarHook.speakerLoading}
        userId={user?.id}
        agendaStartTime={agendaItem.start_time ?? undefined}
        onAddToSpeakerList={handleAddToSpeakerList}
        onRemoveFromSpeakerList={actionBarHook.handleLeaveSpeakerList}
        onMarkCompleted={handleMarkSpeakerCompleted}
      />

      {/* Accreditation Section */}
      {agendaItem.type === 'accreditation' && (
        <AccreditationSection eventId={eventId} agendaItemId={agendaItemId} />
      )}

      {/* Section 3: Election */}
      {election && (
        <div className="space-y-4">
          <AgendaElectionSection
            positionName={
              election.title ??
              t('features.events.agenda.position')
            }
            candidates={candidates}
            indicativeSelections={indicativeSelections}
            finalSelections={finalSelections}
            userHasVoted={userHasElectionVoted}
            userSelectedCandidateIds={userSelectedCandidateIds}
            electionStatus={election.status}
            canVote={hasVotingRight}
            canBeCandidate={hasCandidateRight}
            isUserCandidate={actionBarHook.isUserCandidate}
            isVotingLoading={votingLoading === election.id}
            isCandidateLoading={actionBarHook.candidateLoading}
            onBecomeCandidate={actionBarHook.handleBecomeCandidate}
            onWithdrawCandidacy={actionBarHook.handleWithdrawCandidacy}
          />
          {election.position && (
            <AgendaRelatedPositionCard position={election.position} />
          )}
        </div>
      )}

      {/* Section 3: Vote */}
      {vote && (
        <div className="space-y-4">
          <AgendaVoteSection
            voteTitle={vote.title || agendaItem.title || 'Vote'}
            choices={choices}
            indicativeDecisions={indicativeDecisions}
            finalDecisions={finalDecisions}
            userHasVoted={userHasVoteVoted}
            userSelectedChoiceIds={userSelectedChoiceIds}
            voteStatus={vote.status}
            majorityType={vote.majority_type}
            totalEligibleVoters={vote.voters?.length}
          />
          {voteAmendment && (
            <AgendaRelatedAmendmentCard amendment={voteAmendment} />
          )}
        </div>
      )}

      {/* Transfer Dialog */}
      <TransferAgendaItemDialog
        agendaItemId={agendaItemId}
        agendaItemTitle={agendaItem.title || ''}
        currentEventId={eventId}
        currentEventTitle={event?.title || 'Event'}
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransferComplete={() => {
          setTransferDialogOpen(false);
        }}
      />
    </div>
  );
}
