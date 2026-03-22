'use client';

import { useNavigate } from '@tanstack/react-router';
import {
  Plus,
  Vote,
  Gavel,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Edit,
  Trash2,
  Mic,
  MicOff,
  UserPlus,
  UserMinus,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import {
  ToolbarButton,
  ToolbarGroup,
} from '@/features/shared/ui/ui/toolbar';
import { FixedAgendaToolbar } from './FixedAgendaToolbar';

// ─── Types ───────────────────────────────────────────────────────────

interface CurrentAgendaItem {
  id: string;
  type: string | null;
  status: string | null;
  voting_phase?: string | null;
  election?: { id: string } | null;
  vote?: { id: string } | null;
}

interface AgendaActionBarProps {
  eventId: string;
  currentAgendaItem?: CurrentAgendaItem | null;

  // Permissions
  canManageAgenda: boolean;
  canVote: boolean;
  canBeCandidate: boolean;

  // Event state
  isEventStarted: boolean;

  // User state
  isUserInSpeakerList: boolean;
  isUserCandidate: boolean;

  // Navigation (agenda progression)
  hasPreviousItem?: boolean;
  hasNextItem?: boolean;
  onPreviousItem?: () => void;
  onNextItem?: () => void;
  onCompleteItem?: () => void;
  navigationLoading?: boolean;

  // Loading
  speakerLoading?: boolean;
  candidateLoading?: boolean;
  voteLoading?: boolean;

  // Handlers
  onStartFinalVote?: () => void;
  onCloseFinalVote?: () => void;
  onEditItem?: () => void;
  onDeleteItem?: () => void;
  onMoveToEvent?: () => void;
  onBackToAgenda?: () => void;
  onJoinSpeakerList?: () => void;
  onLeaveSpeakerList?: () => void;
  onBecomeCandidate?: () => void;
  onWithdrawCandidacy?: () => void;
  onVoteClick?: () => void;
}

export function AgendaActionBar({
  eventId,
  currentAgendaItem,
  canManageAgenda,
  canVote,
  canBeCandidate,
  isEventStarted,
  isUserInSpeakerList,
  isUserCandidate,
  hasPreviousItem,
  hasNextItem,
  onPreviousItem,
  onNextItem,
  onCompleteItem,
  navigationLoading,
  speakerLoading,
  candidateLoading,
  voteLoading,
  onStartFinalVote,
  onCloseFinalVote,
  onEditItem,
  onDeleteItem,
  onMoveToEvent,
  onBackToAgenda,
  onJoinSpeakerList,
  onLeaveSpeakerList,
  onBecomeCandidate,
  onWithdrawCandidacy,
  onVoteClick,
}: AgendaActionBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isElection = currentAgendaItem?.type === 'election' || !!currentAgendaItem?.election;
  const isVote = currentAgendaItem?.type === 'amendment' || currentAgendaItem?.type === 'vote' || !!currentAgendaItem?.vote;
  const isVotable = isElection || isVote;

  const votingPhase = currentAgendaItem?.voting_phase;
  const isIndicationPhase = votingPhase === 'indication';
  const isFinalVotePhase = votingPhase === 'final_vote';
  const isClosed = votingPhase === 'closed';

  return (
    <FixedAgendaToolbar>
      {/* Group 1: Create actions */}
      <ToolbarGroup>
        <ToolbarButton
          tooltip={t('features.events.agenda.quickActions.addItem')}
          onClick={() => navigate({ to: '/create/agenda-item', search: { eventId } })}
        >
          <Plus />
        </ToolbarButton>
        <ToolbarButton
          tooltip={t('features.events.agenda.quickActions.createElection')}
          onClick={() => navigate({ to: '/create/agenda-item', search: { eventId, type: 'election' } })}
        >
          <Vote />
        </ToolbarButton>
        <ToolbarButton
          tooltip={t('features.events.agenda.quickActions.createVote')}
          onClick={() => navigate({ to: '/create/agenda-item', search: { eventId, type: 'vote' } })}
        >
          <Gavel />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Group 2: Navigation (organizer only) */}
      {canManageAgenda && (onPreviousItem || onCompleteItem || onNextItem) && (
        <ToolbarGroup>
          {onPreviousItem && (
            <ToolbarButton
              tooltip={t('features.events.navigation.previous', 'Previous')}
              onClick={onPreviousItem}
              disabled={!hasPreviousItem || navigationLoading}
            >
              {navigationLoading ? <Loader2 className="animate-spin" /> : <ChevronLeft />}
            </ToolbarButton>
          )}
          {onCompleteItem && (
            <ToolbarButton
              tooltip={t('features.events.navigation.complete', 'Complete')}
              onClick={onCompleteItem}
              disabled={!currentAgendaItem || navigationLoading}
            >
              {navigationLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            </ToolbarButton>
          )}
          {onNextItem && (
            <ToolbarButton
              tooltip={t('features.events.navigation.next', 'Next')}
              onClick={onNextItem}
              disabled={!hasNextItem || navigationLoading}
            >
              {navigationLoading ? <Loader2 className="animate-spin" /> : <ChevronRight />}
            </ToolbarButton>
          )}
        </ToolbarGroup>
      )}

      {/* Group 3: Item management */}
      <ToolbarGroup>
        {onBackToAgenda && (
          <ToolbarButton
            tooltip={t('features.events.agenda.backToAgenda')}
            onClick={onBackToAgenda}
          >
            <ArrowLeft />
          </ToolbarButton>
        )}
        {canManageAgenda && onMoveToEvent && (
          <ToolbarButton
            tooltip={t('features.events.agenda.moveToEvent')}
            onClick={onMoveToEvent}
          >
            <ArrowRight />
          </ToolbarButton>
        )}
        {canManageAgenda && currentAgendaItem && onEditItem && (
          <ToolbarButton
            tooltip={t('common.actions.edit')}
            onClick={onEditItem}
          >
            <Edit />
          </ToolbarButton>
        )}
        {canManageAgenda && currentAgendaItem && onDeleteItem && (
          <ToolbarButton
            tooltip={t('common.actions.delete')}
            onClick={onDeleteItem}
          >
            <Trash2 />
          </ToolbarButton>
        )}
      </ToolbarGroup>

      {/* Group 4: Voting & participation */}
      <ToolbarGroup>
        {/* Start / Close final vote (organizer) */}
        {canManageAgenda && isVotable && !isClosed && isIndicationPhase && onStartFinalVote && (
          <ToolbarButton
            tooltip={t('features.events.agenda.actions.startFinalVote', 'Start Final Vote')}
            onClick={onStartFinalVote}
          >
            <Vote />
          </ToolbarButton>
        )}
        {canManageAgenda && isVotable && !isClosed && isFinalVotePhase && onCloseFinalVote && (
          <ToolbarButton
            tooltip={t('features.events.agenda.actions.closeFinalVote', 'Close Final Vote')}
            onClick={onCloseFinalVote}
          >
            <Vote />
          </ToolbarButton>
        )}

        {/* Speaker list */}
        {currentAgendaItem && !isUserInSpeakerList && onJoinSpeakerList && (
          <ToolbarButton
            tooltip={t('features.events.agenda.actions.joinSpeakerList', 'Join Speaker List')}
            onClick={onJoinSpeakerList}
            disabled={speakerLoading}
          >
            {speakerLoading ? <Loader2 className="animate-spin" /> : <Mic />}
          </ToolbarButton>
        )}
        {currentAgendaItem && isUserInSpeakerList && onLeaveSpeakerList && (
          <ToolbarButton
            tooltip={t('features.events.agenda.actions.leaveSpeakerList', 'Leave Speaker List')}
            onClick={onLeaveSpeakerList}
            disabled={speakerLoading}
          >
            {speakerLoading ? <Loader2 className="animate-spin" /> : <MicOff />}
          </ToolbarButton>
        )}

        {/* Candidate */}
        {isElection && canBeCandidate && !isUserCandidate && onBecomeCandidate && (
          <ToolbarButton
            tooltip={t('features.events.agenda.actions.becomeCandidate', 'Become Candidate')}
            onClick={onBecomeCandidate}
            disabled={candidateLoading}
          >
            {candidateLoading ? <Loader2 className="animate-spin" /> : <UserPlus />}
          </ToolbarButton>
        )}
        {isElection && canBeCandidate && isUserCandidate && onWithdrawCandidacy && (
          <ToolbarButton
            tooltip={t('features.events.agenda.actions.withdrawCandidacy', 'Withdraw Candidacy')}
            onClick={onWithdrawCandidacy}
            disabled={candidateLoading}
          >
            {candidateLoading ? <Loader2 className="animate-spin" /> : <UserMinus />}
          </ToolbarButton>
        )}

        {/* Vote / Cast button */}
        {isVotable && canVote && !isClosed && onVoteClick && (
          <ToolbarButton
            tooltip={
              isFinalVotePhase
                ? t('features.events.agenda.actions.castFinalVote', 'Cast Final Vote')
                : t('features.events.agenda.actions.castIndicativeVote', 'Cast Indication')
            }
            onClick={onVoteClick}
            disabled={voteLoading}
            className={isFinalVotePhase ? 'text-green-600' : undefined}
          >
            {voteLoading ? <Loader2 className="animate-spin" /> : <Vote className={isFinalVotePhase ? 'text-green-600' : undefined} />}
          </ToolbarButton>
        )}
      </ToolbarGroup>
    </FixedAgendaToolbar>
  );
}
