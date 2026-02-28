import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/shared/ui/ui/alert-dialog';
import { ArrowLeft, ArrowRight, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useEventAgendaItem } from '../hooks/useEventAgendaItem';
import { AmendmentVotingQueue } from '@/features/votes/ui/AmendmentVotingQueue';
import { VotingSessionManager } from '@/features/votes/ui/VotingSessionManager';
import { TransferAgendaItemDialog } from './TransferAgendaItemDialog';
import { AgendaItemContextCard } from './AgendaItemContextCard';
import { AgendaSpeakerListSection } from './AgendaSpeakerListSection';
import { AgendaVoteSection } from './AgendaVoteSection';
import { AgendaElectionSection } from './AgendaElectionSection';
import { usePermissions } from '@/zero/rbac';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import type {
  SpeakerListItem,
  ElectionVote,
  ElectionCandidate,
  VoteEntry,
} from '../types/agenda-section-types';
import {
  notifyVotingSessionStarted,
  notifyVotingSessionCompleted,
  notifyCandidateAdded,
} from '@/features/shared/utils/notification-helpers';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { useTranslation } from '@/features/shared/hooks/use-translation';

export function EventAgendaItemDetail({
  eventId,
  agendaItemId,
}: {
  eventId: string;
  agendaItemId: string;
}) {
  const { t } = useTranslation();
  const { updateAmendment, createVotingSession, updateVotingSession, voteOnChangeRequest, updateChangeRequest } = useAmendmentActions();
  const { updateSpeaker, addCandidate: doAddCandidate, deleteCandidate } = useAgendaActions();
  const {
    agendaItem,
    event,
    user,
    isLoading,
    votingLoading,
    deleteLoading,
    addingSpeaker,
    userElectionVotes,
    userAmendmentVotes,
    data,
    handleElectionVote,
    handleAmendmentVote,
    handleDelete,
    handleAddToSpeakerList,
  } = useEventAgendaItem(eventId, agendaItemId);

  const { can, canVote, canBeCandidate } = usePermissions({ eventId });
  const canManageAgenda = can('manage', 'agendaItems');
  const canManageVotes = canManageAgenda;
  const hasVotingRight = canVote();
  const hasCandidateRight = canBeCandidate();

  const [startingVoting, setStartingVoting] = useState(false);
  const [advancingVote, setAdvancingVote] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [markingSpeakerComplete, setMarkingSpeakerComplete] = useState<string | null>(null);

  // Check if user is event organizer
  const isOrganizer =
    user &&
    (event as any)?.group?.roles?.some(
      (role: any) =>
        role.actionRights?.some((ar: any) => ar.resource === 'events' && ar.action === 'manage') &&
        (event as any)?.group?.memberships?.some(
          (m: any) => m.user?.id === user.id && m.role?.id === role.id
        )
    );

  // Get amendment data if this is an amendment agenda item
  const amendment = agendaItem?.type === 'amendment' && (data as any)?.amendments?.[0];
  const changeRequests = amendment
    ? ((data as any)?.changeRequests || []).filter((cr: any) => cr.amendment?.id === amendment.id)
    : [];
  const votingSession =
    amendment &&
    ((data as any)?.amendmentVotingSessions || []).find(
      (session: any) =>
        session.amendment?.id === amendment.id && session.agendaItem?.id === agendaItemId
    );

  const handleStartEventVoting = async () => {
    if (!amendment || !isOrganizer || !user) return;

    setStartingVoting(true);
    try {
      const sessionId = crypto.randomUUID();
      const now = Date.now();
      const votingDuration = 30 * 60 * 1000; // 30 minutes default

      // Update amendment to event_voting status
      await updateAmendment({
        id: amendment.id,
        workflow_status: 'event_voting',
      });

      // Create voting session
      await createVotingSession({
        id: sessionId,
        amendment_id: amendment.id,
        event_id: eventId,
        title: amendment.title || 'Voting Session',
        description: '',
        status: 'active',
        voting_type: 'simple',
        majority_type: 'simple',
        start_time: now,
        end_time: now + votingDuration,
      });

      // Add timeline event for public amendments
      if (amendment.visibility === 'public') {
        await createTimelineEvent({ data: {
          eventType: 'vote_started',
          entityType: 'amendment',
          entityId: amendment.id,
          actorId: user.id,
          title: `Voting started for ${amendment.title || 'amendment'}`,
          description: 'Event voting has begun',
        } });
      }

      // Send notification
      await notifyVotingSessionStarted({
        senderId: user.id,
        amendmentId: amendment.id,
        amendmentTitle: amendment.title || 'Untitled Amendment',
        eventId,
      });

      await Promise.resolve(); // mutations already committed above

      toast.success('Event-Abstimmung gestartet');
    } catch (error) {
      console.error('Failed to start event voting:', error);
      toast.error('Fehler beim Starten der Abstimmung');
    } finally {
      setStartingVoting(false);
    }
  };

  const handleAdvanceToNext = async () => {
    if (!votingSession || !isOrganizer) return;

    setAdvancingVote(true);
    try {
      const currentIndex = votingSession.currentChangeRequestIndex || 0;
      const newIndex = currentIndex + 1;

      await updateVotingSession({
        id: votingSession.id,
      });

      toast.success('Zur nächsten Abstimmung fortgeschritten');
    } catch (error) {
      console.error('Failed to advance vote:', error);
      toast.error('Fehler beim Fortschreiten');
    } finally {
      setAdvancingVote(false);
    }
  };

  const handleCompleteVoting = async () => {
    if (!votingSession || !amendment || !isOrganizer || !user) return;

    try {
      await updateVotingSession({
        id: votingSession.id,
        status: 'completed',
      });

      // Send notification
      await notifyVotingSessionCompleted({
        senderId: user.id,
        amendmentId: amendment.id,
        amendmentTitle: amendment.title || 'Untitled Amendment',
        eventId,
      });

      // Vote counting: Query vote records for this agenda item, tally results, then update voting session status.
      // This should integrate with amendment-process-helpers.ts

      toast.success('Abstimmung abgeschlossen');
    } catch (error) {
      console.error('Failed to complete voting:', error);
      toast.error('Fehler beim Abschließen der Abstimmung');
    }
  };

  // Handler: Mark speaker as completed
  const handleMarkSpeakerCompleted = async (speakerId: string) => {
    if (!user || !canManageAgenda) return;

    setMarkingSpeakerComplete(speakerId);
    try {
      await updateSpeaker({
        id: speakerId,
        completed: true,
      });
      toast.success(t('features.events.agenda.markCompleted'));
    } catch (error) {
      console.error('Error marking speaker completed:', error);
      toast.error('Fehler beim Markieren');
    } finally {
      setMarkingSpeakerComplete(null);
    }
  };

  // Handler: Become candidate
  const handleBecomeCandidate = async () => {
    if (!user || !agendaItem?.election?.id || !hasCandidateRight) return;

    setCandidateLoading(true);
    try {
      const candidateName = user.email || 'Candidate';
      const candidateOrder = electionCandidates.length + 1;
      const candidateId = crypto.randomUUID();

      await doAddCandidate({
        id: candidateId,
        name: candidateName,
        description: '',
        image_url: '',
        order_index: candidateOrder,
        status: 'nominated',
        user_id: user.id,
        election_id: agendaItem.election.id,
      });

      await notifyCandidateAdded({
        senderId: user.id,
        eventId,
        eventTitle: event?.title || 'Event',
        candidateName,
      });
      toast.success(t('features.events.agenda.becomeCandidate'));
    } catch (error) {
      console.error('Error becoming candidate:', error);
      toast.error('Fehler beim Kandidieren');
    } finally {
      setCandidateLoading(false);
    }
  };

  // Handler: Withdraw candidacy
  const handleWithdrawCandidacy = async () => {
    if (!user || !agendaItem?.election?.id) return;

    const candidates = agendaItem.election.candidates || [];
    const userCandidate = candidates.find((c: any) => c.user?.id === user.id);
    if (!userCandidate) return;

    setCandidateLoading(true);
    try {
      await deleteCandidate(userCandidate.id);
      toast.success(t('features.events.agenda.withdrawCandidacy'));
    } catch (error) {
      console.error('Error withdrawing candidacy:', error);
      toast.error('Fehler beim Zurückziehen');
    } finally {
      setCandidateLoading(false);
    }
  };

  // Handler: Vote on change request
  const handleChangeRequestVote = async (
    changeRequestId: string,
    vote: 'yes' | 'no' | 'abstain'
  ) => {
    if (!user) return;
    try {
      await voteOnChangeRequest({
        id: crypto.randomUUID(),
        change_request_id: changeRequestId,
        vote: vote,
      });
      toast.success('Vote recorded');
    } catch (error) {
      console.error('Failed to record change request vote:', error);
      toast.error('Failed to record vote');
    }
  };

  // Handler: Activate change request for voting
  const handleActivateChangeRequest = async (changeRequestId: string) => {
    if (!user || !canManageVotes) return;
    try {
      await updateChangeRequest({
        id: changeRequestId,
        status: 'active',
      });
      toast.success('Change request activated');
    } catch (error) {
      console.error('Failed to activate change request:', error);
      toast.error('Failed to activate change request');
    }
  };

  // Map agenda status to component status
  const mapAgendaStatus = (status: string): 'planned' | 'active' | 'completed' => {
    if (status === 'completed' || status === 'done') return 'completed';
    if (status === 'active' || status === 'in-progress') return 'active';
    return 'planned';
  };

  // Prepare speaker list data
  const speakerListData = useMemo((): SpeakerListItem[] => {
    return (agendaItem?.speakerList || []).map((speaker: any) => ({
      id: speaker.id,
      order: speaker.order || 0,
      time: speaker.time || 3,
      completed: speaker.completed || false,
      title: speaker.title,
      user: speaker.user
        ? {
            id: speaker.user.id,
            name: speaker.user.name,
            email: speaker.user.email,
            avatar: speaker.user.avatar || speaker.user.imageURL,
          }
        : undefined,
    }));
  }, [agendaItem?.speakerList]);

  const isUserInSpeakerList = speakerListData.some(speaker => speaker.user?.id === user?.id);

  // Prepare election data
  const election = agendaItem?.election;

  const electionCandidates = useMemo((): ElectionCandidate[] => {
    if (!election?.candidates) return [];
    return election.candidates
      .filter((candidate: any) => candidate.user?.id || candidate.userId)
      .map((candidate: any) => ({
        id: candidate.id,
        userId: candidate.user?.id || candidate.userId || '',
        user: candidate.user
          ? {
              id: candidate.user.id,
              name: candidate.user.name,
              email: candidate.user.email,
              avatar: candidate.user.avatar || candidate.user.imageURL,
            }
          : undefined,
        status: (candidate.status || 'nominated') as 'nominated' | 'accepted' | 'withdrawn',
      }));
  }, [election?.candidates]);

  const electionVotes = useMemo((): ElectionVote[] => {
    if (!election?.id) return [];
    // Use nested election.votes query for better reactivity
    const votes = (election as any)?.votes || [];
    return votes
      .filter((vote: any) => vote.candidate?.id)
      .map((vote: any) => ({
        id: vote.id,
        candidateId: vote.candidate?.id || '',
        isIndication: vote.is_indication,
      voter: vote.voter ? { id: vote.voter.id, name: `${vote.voter.first_name ?? ''} ${vote.voter.last_name ?? ''}`.trim() || undefined } : undefined,
      }));
  }, [election]);

  const userElectionVote = useMemo((): ElectionVote | undefined => {
    if (!user?.id || !election?.id) return undefined;
    const vote = userElectionVotes.find((v: any) => v.election?.id === election.id);
    if (!vote || !vote.candidate?.id) return undefined;
    return {
      id: vote.id,
      candidateId: vote.candidate?.id || '',
      isIndication: vote.is_indication,
      voter: { id: user.id, name: user.email },
    };
  }, [user?.id, election?.id, userElectionVotes]);

  const isUserCandidate = useMemo(() => {
    return electionCandidates.some(c => c.userId === user?.id);
  }, [electionCandidates, user?.id]);

  // Prepare amendment vote data
  const amendmentVote = agendaItem?.amendmentVote;

  const amendmentVoteEntries = useMemo((): VoteEntry[] => {
    if (!amendmentVote?.id) return [];
    // Use global query which is reactive, then filter by amendmentVote.id
    return ((data as any)?.amendmentVoteEntries || [])
      .filter(
        (entry: any) =>
          entry.amendmentVote?.id === amendmentVote.id &&
          ['yes', 'no', 'abstain'].includes(entry.vote)
      )
      .map((entry: any) => ({
        id: entry.id,
        vote: entry.vote as 'yes' | 'no' | 'abstain',
        isIndication: entry.isIndication,
        voter: entry.voter ? { id: entry.voter.id, name: entry.voter.name } : undefined,
      }));
  }, [amendmentVote?.id, data]);

  const userAmendmentVote = useMemo((): VoteEntry | undefined => {
    if (!user?.id || !amendmentVote?.id) return undefined;
    const entry = userAmendmentVotes.find((e: any) => e.amendment?.id === amendmentVote.id);
    if (!entry) return undefined;
    if (entry.vote == null) return undefined;
    const voteMap: Record<number, 'yes' | 'no' | 'abstain'> = { 1: 'yes', [-1]: 'no', 0: 'abstain' };
    const mappedVote = voteMap[entry.vote];
    if (!mappedVote) return undefined;
    return {
      id: entry.id,
      vote: mappedVote,
      voter: { id: user.id, name: user.email },
    };
  }, [user?.id, amendmentVote?.id, userAmendmentVotes]);

  // Change request votes (grouped by CR id)
  const changeRequestVotes = useMemo(() => {
    const votes: Record<string, VoteEntry[]> = {};
    // Change request votes: Requires querying change_request_vote table filtered by relevant change request IDs.
    // Deferred until change request voting UI is fully integrated.
    return votes;
  }, []);

  const userChangeRequestVotes = useMemo(() => {
    const votes: Record<string, VoteEntry> = {};
    // User's change request votes: Requires querying change_request_vote table filtered by user ID.
    // Deferred until change request voting UI is fully integrated.
    return votes;
  }, []);

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
            <Link to={`/event/${eventId}/agenda`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Tagesordnung
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCreator = user?.id === agendaItem.creator?.id;
  const isEventOrganizer = user?.id === event.organizer?.id;
  const canEdit = isCreator || isEventOrganizer;

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to={`/event/${eventId}/agenda`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('features.events.agenda.backToAgenda')}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {canManageAgenda && (
            <Button variant="outline" size="sm" onClick={() => setTransferDialogOpen(true)}>
              <ArrowRight className="mr-2 h-4 w-4" />
              {t('features.events.agenda.moveToEvent')}
            </Button>
          )}
          {canEdit && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                {t('common.actions.edit')}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={deleteLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.actions.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('features.events.agenda.deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('features.events.agenda.deleteDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                      {deleteLoading ? t('common.actions.deleting') : t('common.actions.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Section 1: Context Card */}
      <AgendaItemContextCard
        agendaItem={{
          id: agendaItem.id,
          title: agendaItem.title,
          description: agendaItem.description,
          type: agendaItem.type,
          status: agendaItem.status,
          duration: agendaItem.duration,
          scheduledTime: agendaItem.scheduledTime,
          startTime: agendaItem.startTime ? new Date(agendaItem.startTime) : undefined,
          endTime: agendaItem.endTime ? new Date(agendaItem.endTime) : undefined,
          activatedAt: agendaItem.activatedAt ? new Date(agendaItem.activatedAt) : undefined,
          completedAt: agendaItem.completedAt ? new Date(agendaItem.completedAt) : undefined,
        }}
        position={
          (election as any)?.position
            ? {
                id: (election as any).position.id,
                title: (election as any).position.title,
                description: (election as any).position.description,
                group: (election as any).position.group
                  ? {
                      id: (election as any).position.group.id,
                      name:
                        (election as any).position.group.name ||
                        (election as any).position.group.title,
                    }
                  : undefined,
              }
            : undefined
        }
        amendment={
          amendment
            ? {
                id: amendment.id,
                title: amendment.title,
                subtitle: amendment.subtitle,
                status: amendment.status,
                workflowStatus: amendment.workflowStatus,
                imageURL: amendment.imageURL,
                group: amendment.group
                  ? { id: amendment.group.id, name: amendment.group.name || amendment.group.title }
                  : undefined,
              }
            : undefined
        }
      />

      {/* Section 2: Speaker List */}
      <AgendaSpeakerListSection
        speakers={speakerListData}
        isUserInSpeakerList={isUserInSpeakerList}
        canManageSpeakers={canManageAgenda}
        isAddingSpeaker={addingSpeaker}
        userId={user?.id}
        onAddToSpeakerList={handleAddToSpeakerList}
        onMarkCompleted={handleMarkSpeakerCompleted}
      />

      {/* Section 3: Election */}
      {election && (
        <>
          <VotingSessionManager
            eventId={eventId}
            agendaItemId={agendaItemId}
            agendaItemTitle={agendaItem.title || 'Election'}
            votingType="election"
            targetEntityId={election.id}
          />
          <AgendaElectionSection
            positionId={(election as any).position?.id || election.id}
            positionName={
              (election as any).position?.title ||
              election.title ||
              t('features.events.agenda.position')
            }
            candidates={electionCandidates}
            electionVotes={electionVotes}
            userVote={userElectionVote}
            agendaStatus={mapAgendaStatus(agendaItem.status)}
            canVote={hasVotingRight}
            canBeCandidate={hasCandidateRight}
            isUserCandidate={isUserCandidate}
            isVotingLoading={votingLoading === election.id}
            isCandidateLoading={candidateLoading}
            onVote={candidateId => handleElectionVote(election.id, candidateId)}
            onBecomeCandidate={handleBecomeCandidate}
            onWithdrawCandidacy={handleWithdrawCandidacy}
          />
        </>
      )}

      {/* Section 3: Amendment Vote (when amendment is linked) */}
      {agendaItem.type === 'amendment' && amendment && (
        <>
          {(amendment.workflowStatus === 'event_suggesting' ||
            amendment.workflowStatus === 'event_voting') && (
            <VotingSessionManager
              eventId={eventId}
              agendaItemId={agendaItemId}
              agendaItemTitle={amendment.title || 'Amendment'}
              votingType="amendment"
              targetEntityId={amendment.id}
            />
          )}
          {amendment.workflowStatus === 'event_voting' && votingSession && (
            <AmendmentVotingQueue
              amendmentId={amendment.id}
              eventId={eventId}
              agendaItemId={agendaItemId}
              changeRequests={changeRequests}
              currentSession={votingSession}
              isOrganizer={!!isOrganizer}
              onAdvanceToNext={handleAdvanceToNext}
              onComplete={handleCompleteVoting}
            />
          )}
          <AgendaVoteSection
            amendmentId={amendment.id}
            amendmentTitle={amendment.title || 'Amendment'}
            voteEntries={amendmentVoteEntries}
            changeRequests={changeRequests.map((cr: any) => ({
              id: cr.id,
              title: cr.title || 'Change Request',
              description: cr.description || '',
              characterCount: cr.characterCount,
              votingOrder: cr.votingOrder,
              status: cr.status,
              activatedAt: cr.activatedAt,
              completedAt: cr.completedAt,
            }))}
            changeRequestVotes={changeRequestVotes}
            userVote={userAmendmentVote}
            userChangeRequestVotes={userChangeRequestVotes}
            agendaStatus={mapAgendaStatus(agendaItem.status)}
            canVote={hasVotingRight}
            canManageVotes={canManageVotes}
            isVotingLoading={votingLoading === amendmentVote?.id}
            onVote={vote => amendmentVote && handleAmendmentVote(amendmentVote.id, vote)}
            onChangeRequestVote={handleChangeRequestVote}
            onActivateChangeRequest={handleActivateChangeRequest}
          />
        </>
      )}

      {/* Section 3: Legacy Amendment Vote (when no amendment linked) */}
      {amendmentVote && !amendment && (
        <AgendaVoteSection
          amendmentId={amendmentVote.id}
          amendmentTitle={amendmentVote.title || 'Amendment Vote'}
          voteEntries={amendmentVoteEntries}
          changeRequests={[]}
          changeRequestVotes={{}}
          userVote={userAmendmentVote}
          userChangeRequestVotes={{}}
          agendaStatus={mapAgendaStatus(agendaItem.status)}
          canVote={hasVotingRight}
          canManageVotes={canManageVotes}
          isVotingLoading={votingLoading === amendmentVote.id}
          onVote={vote => handleAmendmentVote(amendmentVote.id, vote)}
          onChangeRequestVote={handleChangeRequestVote}
          onActivateChangeRequest={handleActivateChangeRequest}
        />
      )}

      {/* Transfer Dialog */}
      <TransferAgendaItemDialog
        agendaItemId={agendaItemId}
        agendaItemTitle={agendaItem.title}
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
