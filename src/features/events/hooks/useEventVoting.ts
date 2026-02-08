/**
 * useEventVoting Hook
 *
 * Manages structured voting at events including introduction phase,
 * voting phase, and result calculation.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { db, tx, id } from '../../../../db/db';
import { usePermissions } from '@db/rbac';
import {
  notifyVotingPhaseStarted,
  notifyVotingCompleted,
  notifyAmendmentForwarded,
  notifyElectionResult,
} from '@/utils/notification-helpers';
import { toast } from 'sonner';
import { handleAmendmentVoteResult } from '@/features/amendments/utils/voting-results';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

export type VotingPhase = 'introduction' | 'voting' | 'completed';
export type VotingType = 'amendment' | 'election' | 'change_request';
export type MajorityType = 'simple' | 'absolute' | 'two_thirds';
export type VoteValue = 'accept' | 'reject' | 'abstain';
export type VoteResult = 'passed' | 'rejected' | 'tie';

interface VotingSession {
  id: string;
  phase: VotingPhase;
  votingType: VotingType;
  startedAt?: number;
  endedAt?: number;
  timeLimit?: number;
  autoCloseOnAllVoted?: boolean;
  autoCloseOnTimeout?: boolean;
  majorityType: MajorityType;
  result?: VoteResult;
  targetEntityType: string;
  targetEntityId: string;
  votes?: Array<{
    id: string;
    vote: VoteValue;
    voter: { id: string; name?: string };
  }>;
}

interface EligibleVoter {
  id: string;
  name?: string;
  hasVoted: boolean;
}

interface UseEventVotingResult {
  currentSession: VotingSession | null;
  eligibleVoters: EligibleVoter[];
  votedCount: number;
  totalVoters: number;
  canVote: boolean;
  canManageVoting: boolean;
  hasUserVoted: boolean;
  userVote: VoteValue | null;
  voteResults: { accept: number; reject: number; abstain: number };
  isLoading: boolean;
  timeRemaining: number | null;
  startIntroductionPhase: (params: StartVotingParams) => Promise<string>;
  startVotingPhase: (sessionId: string, timeLimit?: number) => Promise<void>;
  closeVoting: (sessionId: string) => Promise<void>;
  castVote: (sessionId: string, vote: VoteValue) => Promise<void>;
}

interface StartVotingParams {
  agendaItemId: string;
  votingType: VotingType;
  targetEntityId: string;
  majorityType?: MajorityType;
  autoCloseOnAllVoted?: boolean;
}

export function useEventVoting(eventId: string, agendaItemId?: string): UseEventVotingResult {
  const { user } = db.useAuth();
  const { can } = usePermissions({ eventId });
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const canManageVoting = can('manage', 'agendaItems');
  const canVote = can('active_voting', 'events');

  // Query event with voting sessions and participants with their roles
  const { data, isLoading: queryLoading } = db.useQuery({
    events: {
      $: { where: { id: eventId } },
      participants: {
        user: {},
        role: {
          actionRights: {},
        },
      },
      votingSessions: {
        votes: {
          voter: {},
        },
        agendaItem: {
          amendment: {
            targetGroup: {},
            targetEvent: {},
          },
        },
      },
    },
  });

  const event = data?.events?.[0];

  // Get current voting session for the agenda item
  const currentSession = useMemo((): VotingSession | null => {
    if (!agendaItemId || !event?.votingSessions) return null;

    const sessions = event.votingSessions as any[];
    const activeSession = sessions.find(
      (s: any) =>
        s.agendaItem?.id === agendaItemId && (s.phase === 'introduction' || s.phase === 'voting')
    );

    return activeSession || null;
  }, [agendaItemId, event?.votingSessions]);

  // Get eligible voters (participants with active_voting right)
  const eligibleVoters = useMemo((): EligibleVoter[] => {
    if (!event?.participants) return [];

    const voters: EligibleVoter[] = [];
    const votedUserIds = new Set(currentSession?.votes?.map((v: any) => v.voter?.id) || []);

    for (const participant of event.participants as any[]) {
      const hasVotingRight = participant.role?.actionRights?.some(
        (ar: any) => ar.action === 'active_voting' && ar.resource === 'events'
      );

      if (hasVotingRight && participant.user) {
        voters.push({
          id: participant.user.id,
          name: participant.user.name,
          hasVoted: votedUserIds.has(participant.user.id),
        });
      }
    }

    return voters;
  }, [event?.participants, currentSession?.votes]);

  const votedCount = eligibleVoters.filter(v => v.hasVoted).length;
  const totalVoters = eligibleVoters.length;

  const hasUserVoted = useMemo(() => {
    if (!user || !currentSession?.votes) return false;
    return currentSession.votes.some((v: any) => v.voter?.id === user.id);
  }, [user, currentSession?.votes]);

  const userVote = useMemo((): VoteValue | null => {
    if (!user || !currentSession?.votes) return null;
    const vote = currentSession.votes.find((v: any) => v.voter?.id === user.id);
    return vote?.vote || null;
  }, [user, currentSession?.votes]);

  const voteResults = useMemo(() => {
    const votes = currentSession?.votes || [];
    return {
      accept: votes.filter((v: any) => v.vote === 'accept').length,
      reject: votes.filter((v: any) => v.vote === 'reject').length,
      abstain: votes.filter((v: any) => v.vote === 'abstain').length,
    };
  }, [currentSession?.votes]);

  // Timer for voting phase
  useEffect(() => {
    if (!currentSession || currentSession.phase !== 'voting' || !currentSession.startedAt) {
      setTimeRemaining(null);
      return;
    }

    if (!currentSession.timeLimit) {
      setTimeRemaining(null);
      return;
    }

    const endTime = currentSession.startedAt + currentSession.timeLimit * 1000;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0 && currentSession.autoCloseOnTimeout) {
        closeVoting(currentSession.id);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [
    currentSession?.id,
    currentSession?.phase,
    currentSession?.startedAt,
    currentSession?.timeLimit,
  ]);

  // Auto-close when all voted
  useEffect(() => {
    if (
      currentSession?.phase === 'voting' &&
      currentSession.autoCloseOnAllVoted &&
      votedCount === totalVoters &&
      totalVoters > 0 &&
      canManageVoting
    ) {
      closeVoting(currentSession.id);
    }
  }, [
    currentSession?.phase,
    currentSession?.autoCloseOnAllVoted,
    votedCount,
    totalVoters,
    canManageVoting,
  ]);

  const startIntroductionPhase = useCallback(
    async (params: StartVotingParams): Promise<string> => {
      if (!user || !canManageVoting) {
        toast.error('You do not have permission to manage voting');
        throw new Error('Permission denied');
      }

      setIsLoading(true);
      try {
        const sessionId = id();

        const transactions: any[] = [
          tx.eventVotingSessions[sessionId]
            .update({
              phase: 'introduction',
              votingType: params.votingType,
              majorityType: params.majorityType || 'simple',
              autoCloseOnAllVoted: params.autoCloseOnAllVoted ?? true,
              autoCloseOnTimeout: true,
              targetEntityType: params.votingType,
              targetEntityId: params.targetEntityId,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
            .link({
              event: eventId,
              agendaItem: params.agendaItemId,
            }),
        ];

        // Link to specific entity based on type
        if (params.votingType === 'amendment') {
          transactions.push(
            tx.eventVotingSessions[sessionId].link({ amendment: params.targetEntityId })
          );
        } else if (params.votingType === 'change_request') {
          transactions.push(
            tx.eventVotingSessions[sessionId].link({ changeRequest: params.targetEntityId })
          );
        } else if (params.votingType === 'election') {
          transactions.push(
            tx.eventVotingSessions[sessionId].link({ election: params.targetEntityId })
          );
        }

        await db.transact(transactions);
        toast.success('Introduction phase started');
        return sessionId;
      } catch (error) {
        console.error('Error starting introduction phase:', error);
        toast.error('Failed to start voting');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, canManageVoting, eventId]
  );

  const startVotingPhase = useCallback(
    async (sessionId: string, timeLimit?: number) => {
      if (!user || !canManageVoting) {
        toast.error('You do not have permission to manage voting');
        return;
      }

      setIsLoading(true);
      try {
        const transactions: any[] = [
          tx.eventVotingSessions[sessionId].update({
            phase: 'voting',
            startedAt: Date.now(),
            timeLimit: timeLimit || 300, // Default 5 minutes
            updatedAt: Date.now(),
          }),
        ];

        // Send notification
        if (event?.title && currentSession) {
          const notificationTxs = notifyVotingPhaseStarted({
            senderId: user.id,
            eventId,
            eventTitle: event.title,
            agendaItemTitle: 'Current Item', // TODO: Get actual title
            votingType: currentSession.votingType,
            timeLimit: timeLimit || 300,
          });
          transactions.push(...notificationTxs);
        }

        await db.transact(transactions);
        toast.success('Voting has begun');
      } catch (error) {
        console.error('Error starting voting phase:', error);
        toast.error('Failed to start voting');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, canManageVoting, eventId, event?.title, currentSession]
  );

  const closeVoting = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Calculate result
        const { accept, reject } = voteResults;
        const majorityType = currentSession?.majorityType || 'simple';

        let result: VoteResult;
        if (accept === reject) {
          result = 'tie';
        } else if (majorityType === 'simple') {
          result = accept > reject ? 'passed' : 'rejected';
        } else if (majorityType === 'absolute') {
          result = accept > totalVoters / 2 ? 'passed' : 'rejected';
        } else {
          // two_thirds
          result = accept >= (totalVoters * 2) / 3 ? 'passed' : 'rejected';
        }

        // Get agenda item title for notification
        const session = event?.votingSessions?.find((s: any) => s.id === sessionId) as any;
        const agendaItem = session?.agendaItem;
        const agendaItemTitle = agendaItem?.title || 'Current Item';

        const transactions: any[] = [
          tx.eventVotingSessions[sessionId].update({
            phase: 'completed',
            endedAt: Date.now(),
            result,
            updatedAt: Date.now(),
          }),
        ];

        // Send notification
        if (event?.title) {
          const notificationTxs = notifyVotingCompleted({
            senderId: user.id,
            eventId,
            eventTitle: event.title,
            agendaItemTitle,
            result,
            acceptVotes: accept,
            rejectVotes: reject,
          });
          transactions.push(...notificationTxs);
        }

        // Add timeline event for vote closing
        transactions.push(
          createTimelineEvent({
            eventType: 'vote_closed',
            entityType: 'event',
            entityId: eventId,
            actorId: user.id,
            title: agendaItemTitle,
            description: event?.title || undefined,
            contentType: 'vote',
            status: {
              voteStatus: result === 'tie' ? 'closed' : result,
            },
          })
        );

        await db.transact(transactions);

        // Handle voting type-specific result processing
        if (currentSession?.votingType === 'amendment' && agendaItem?.amendment) {
          const amendment = agendaItem.amendment as any;
          await handleAmendmentVoteResult({
            amendmentId: currentSession.targetEntityId,
            amendmentTitle: amendment.title || agendaItemTitle,
            eventId,
            eventTitle: event?.title || 'Event',
            agendaItemId: agendaItem.id,
            userId: user.id,
            result,
            targetGroupId: amendment.targetGroup?.id,
            targetEventId: amendment.targetEvent?.id,
          });
        }

        toast.success(`Voting completed: ${result}`);
      } catch (error) {
        console.error('Error closing voting:', error);
        toast.error('Failed to close voting');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, eventId, event?.title, event?.votingSessions, currentSession, voteResults, totalVoters]
  );

  const castVote = useCallback(
    async (sessionId: string, vote: VoteValue) => {
      if (!user) {
        toast.error('You must be logged in to vote');
        return;
      }

      if (!canVote) {
        toast.error('You do not have voting rights');
        return;
      }

      if (hasUserVoted) {
        toast.error('You have already voted');
        return;
      }

      if (currentSession?.phase !== 'voting') {
        toast.error('Voting is not currently active');
        return;
      }

      setIsLoading(true);
      try {
        const voteId = id();

        await db.transact([
          tx.eventVotes[voteId]
            .update({
              vote,
              createdAt: Date.now(),
            })
            .link({
              session: sessionId,
              voter: user.id,
            }),
        ]);

        toast.success('Vote cast successfully');
      } catch (error) {
        console.error('Error casting vote:', error);
        toast.error('Failed to cast vote');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, canVote, hasUserVoted, currentSession?.phase]
  );

  return {
    currentSession,
    eligibleVoters,
    votedCount,
    totalVoters,
    canVote,
    canManageVoting,
    hasUserVoted,
    userVote,
    voteResults,
    isLoading: isLoading || queryLoading,
    timeRemaining,
    startIntroductionPhase,
    startVotingPhase,
    closeVoting,
    castVote,
  };
}
