/**
 * useEventVoting Hook
 *
 * Manages structured voting at events including introduction phase,
 * voting phase, and result calculation.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useEventActions } from '@/zero/events/useEventActions';
import { useEventWithVoting } from '@/zero/events/useEventState';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/zero/rbac';
import {
  notifyVotingPhaseStarted,
  notifyVotingCompleted,
  notifyAmendmentForwarded,
  notifyElectionResult,
} from '@/utils/notification-helpers';
import { toast } from 'sonner';
import { handleAmendmentVoteResult } from '../utils/voting-results';
import { computeVoteResult, type MajorityType, type VoteResult } from '../logic/computeVoteResult';
import { computeEligibleVoters, type EligibleVoter } from '../logic/computeEligibleVoters';

export type VotingPhase = 'introduction' | 'voting' | 'completed';
export type VotingType = 'amendment' | 'election' | 'change_request';
export type { MajorityType, VoteResult } from '../logic/computeVoteResult';
export type VoteValue = 'accept' | 'reject' | 'abstain';

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
  const { user } = useAuth();
  const { startVotingSession, finalizeAgendaItem, castVote: doEventCastVote } = useEventActions();
  const { can } = usePermissions({ eventId });
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const canManageVoting = can('manage', 'agendaItems');
  const canVote = can('active_voting', 'events');

  // Query event with voting sessions and participants with their roles
  const { event, isLoading: queryLoading } = useEventWithVoting(eventId);

  // Get current voting session for the agenda item
  const currentSession = useMemo((): VotingSession | null => {
    if (!agendaItemId || !event?.voting_sessions) return null;

    const sessions = event.voting_sessions as any[];
    const activeSession = sessions.find(
      (s: any) =>
        s.agendaItem?.id === agendaItemId && (s.phase === 'introduction' || s.phase === 'voting')
    );

    return activeSession || null;
  }, [agendaItemId, event?.voting_sessions]);

  // Get eligible voters (participants with active_voting right)
  const eligibleVoters = useMemo((): EligibleVoter[] => {
    if (!event?.participants) return [];
    const votedUserIds = new Set(currentSession?.votes?.map((v: any) => v.user?.id) || []);
    return computeEligibleVoters(event.participants as any[], votedUserIds);
  }, [event?.participants, currentSession?.votes]);

  const votedCount = eligibleVoters.filter(v => v.hasVoted).length;
  const totalVoters = eligibleVoters.length;

  const hasUserVoted = useMemo(() => {
    if (!user || !currentSession?.votes) return false;
    return currentSession.votes.some((v: any) => v.user?.id === user.id);
  }, [user, currentSession?.votes]);

  const userVote = useMemo((): VoteValue | null => {
    if (!user || !currentSession?.votes) return null;
    const vote = currentSession.votes.find((v: any) => v.user?.id === user.id);
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
        const sessionId = crypto.randomUUID();

        await startVotingSession({
          id: sessionId,
          voting_type: params.votingType,
          majority_type: params.majorityType || 'simple',
          title: '',
          description: '',
          event_id: eventId,
          agenda_item_id: params.agendaItemId,
        });

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
        await finalizeAgendaItem({
          id: sessionId,
          status: 'voting',
        });


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
        const result = computeVoteResult(accept, reject, totalVoters, majorityType as MajorityType);

        const session = event?.voting_sessions?.find((s: any) => s.id === sessionId) as any;
        const agendaItem = session?.agenda_item;
        const agendaItemTitle = agendaItem?.title || 'Current Item';

        await finalizeAgendaItem({
          id: sessionId,
          status: 'completed',
          end_time: Date.now(),
        });


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
          targetGroupId: amendment.group?.id,
          targetEventId: amendment.event?.id,
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
    [user, eventId, event?.title, event?.voting_sessions, currentSession, voteResults, totalVoters]
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
        const voteId = crypto.randomUUID();

        await doEventCastVote({
          id: voteId,
          vote,
          session_id: sessionId,
          weight: 1,
          is_delegate: false,
        });

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
