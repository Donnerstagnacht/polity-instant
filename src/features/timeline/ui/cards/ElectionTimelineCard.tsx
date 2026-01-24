'use client';

import { Award, Users, Calendar, ExternalLink, Crown, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
} from './TimelineCardBase';

export interface ElectionCandidate {
  id: string;
  name: string;
  avatarUrl?: string;
  votePercentage?: number;
}

export interface ElectionTimelineCardProps {
  election: {
    id: string;
    title: string;
    positionName: string;
    groupId?: string;
    groupName?: string;
    status: 'nominations_open' | 'voting_open' | 'closed' | 'winner_announced';
    nominationsEndDate?: string | Date;
    votingEndDate?: string | Date;
    candidates: ElectionCandidate[];
    winnerId?: string;
    winnerName?: string;
    winnerAvatarUrl?: string;
    winnerVotePercentage?: number;
    totalCandidates: number;
    totalVoters?: number;
    turnoutPercentage?: number;
  };
  onCastVote?: () => void;
  onNominate?: () => void;
  onViewCandidates?: () => void;
  onViewResults?: () => void;
  className?: string;
}

/**
 * Status configuration for election cards
 */
const STATUS_CONFIG: Record<
  string,
  { color: string; bgColor: string; icon: React.ReactNode; pulse?: boolean }
> = {
  nominations_open: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/40',
    icon: <Users className="h-3 w-3" />,
  },
  voting_open: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    icon: <Award className="h-3 w-3" />,
    pulse: true,
  },
  closed: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/40',
    icon: <Calendar className="h-3 w-3" />,
  },
  winner_announced: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    icon: <Trophy className="h-3 w-3" />,
  },
};

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Election phase type
 */
type ElectionPhase = 'nomination' | 'voting' | 'results';

/**
 * Get current phase from status
 */
function getCurrentPhase(status: string): ElectionPhase {
  if (status === 'nominations_open') return 'nomination';
  if (status === 'voting_open') return 'voting';
  return 'results';
}

/**
 * Phase timeline indicator component
 */
function PhaseTimeline({ currentPhase }: { currentPhase: ElectionPhase }) {
  const { t } = useTranslation();
  const phases: { key: ElectionPhase; label: string }[] = [
    { key: 'nomination', label: t('features.timeline.cards.election.phases.nomination') },
    { key: 'voting', label: t('features.timeline.cards.election.phases.voting') },
    { key: 'results', label: t('features.timeline.cards.election.phases.results') },
  ];

  const currentIndex = phases.findIndex(p => p.key === currentPhase);

  return (
    <div className="mt-3 flex items-center justify-center gap-1">
      {phases.map((phase, index) => (
        <div key={phase.key} className="flex items-center gap-1">
          <div
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              index < currentIndex
                ? 'bg-rose-400 dark:bg-rose-500'
                : index === currentIndex
                  ? 'bg-rose-600 dark:bg-rose-400'
                  : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
          {index < phases.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-4',
                index < currentIndex
                  ? 'bg-rose-400 dark:bg-rose-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Candidate avatars row component
 */
function CandidateAvatars({
  candidates,
  maxDisplay = 5,
  winnerId,
}: {
  candidates: ElectionCandidate[];
  maxDisplay?: number;
  winnerId?: string;
}) {
  const displayCandidates = candidates.slice(0, maxDisplay);
  const remaining = candidates.length - maxDisplay;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex -space-x-2">
        {displayCandidates.map(candidate => (
          <div key={candidate.id} className="relative">
            <Avatar
              className={cn(
                'h-10 w-10 border-2 border-background',
                candidate.id === winnerId && 'ring-2 ring-amber-400'
              )}
            >
              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
              <AvatarFallback className="bg-rose-100 text-xs dark:bg-rose-900/40">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            {candidate.id === winnerId && (
              <Crown className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 text-amber-500" />
            )}
          </div>
        ))}
        {remaining > 0 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-gray-100 text-xs font-medium dark:bg-gray-800">
            +{remaining}
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground">
        {displayCandidates.slice(0, 4).map((candidate, i) => (
          <span key={candidate.id}>
            {candidate.name}
            {i < Math.min(displayCandidates.length, 4) - 1 && ','}
          </span>
        ))}
        {candidates.length > 4 && <span>...</span>}
      </div>
    </div>
  );
}

/**
 * Winner display component
 */
function WinnerDisplay({
  name,
  avatarUrl,
  votePercentage,
  positionName,
}: {
  name: string;
  avatarUrl?: string;
  votePercentage?: number;
  positionName: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="text-sm font-medium text-muted-foreground">
        🎉 {t('features.timeline.cards.election.winnerAnnounced')}
      </div>
      <div className="relative">
        <Avatar className="h-16 w-16 border-4 border-amber-400 ring-2 ring-amber-200 dark:ring-amber-800">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-rose-100 text-lg dark:bg-rose-900/40">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <Crown className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 text-amber-500" />
      </div>
      <div className="text-center">
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-muted-foreground">{positionName}</div>
        {votePercentage !== undefined && (
          <div className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
            {votePercentage}% {t('features.timeline.cards.election.ofVotes')}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ElectionTimelineCard - Leadership Election card
 *
 * Displays an election with:
 * - Rose-pink gradient header
 * - Status badge (nominations open, voting, closed, winner)
 * - Position and group context
 * - Candidate avatars with winner highlight
 * - Phase timeline indicator
 * - Stats (candidates, voters, turnout)
 * - Action buttons based on status
 */
export function ElectionTimelineCard({
  election,
  onCastVote,
  onNominate,
  onViewCandidates,
  onViewResults,
  className,
}: ElectionTimelineCardProps) {
  const { t } = useTranslation();
  const statusConfig = STATUS_CONFIG[election.status];
  const currentPhase = getCurrentPhase(election.status);
  const isWinnerAnnounced = election.status === 'winner_announced';
  const isVotingOpen = election.status === 'voting_open';
  const isNominationsOpen = election.status === 'nominations_open';

  // Get status label
  const getStatusLabel = () => {
    switch (election.status) {
      case 'nominations_open':
        return t('features.timeline.cards.election.status.nominationsOpen');
      case 'voting_open':
        return t('features.timeline.cards.election.status.votingOpen');
      case 'closed':
        return t('features.timeline.cards.election.status.closed');
      case 'winner_announced':
        return t('features.timeline.cards.election.status.elected');
      default:
        return '';
    }
  };

  // Get date display text
  const getDateText = () => {
    if (isNominationsOpen && election.nominationsEndDate) {
      return `${t('features.timeline.cards.election.submitBy')} ${formatDate(election.nominationsEndDate)}`;
    }
    if (isVotingOpen && election.votingEndDate) {
      return `${t('features.timeline.cards.election.endsOn')} ${formatDate(election.votingEndDate)}`;
    }
    return null;
  };

  const dateText = getDateText();

  return (
    <TimelineCardBase contentType="election" className={className}>
      <TimelineCardHeader
        contentType="election"
        title={election.title}
        subtitle={election.groupName}
        badge={
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1 text-xs',
              statusConfig.bgColor,
              statusConfig.color,
              statusConfig.pulse && 'animate-pulse'
            )}
          >
            {statusConfig.icon}
            {getStatusLabel()}
          </Badge>
        }
      >
        {dateText && (
          <div className="mt-2 text-center text-xs text-muted-foreground">{dateText}</div>
        )}
      </TimelineCardHeader>

      <TimelineCardContent>
        {/* Position being elected */}
        <div className="mb-3 text-center">
          <span className="text-sm text-muted-foreground">
            {t('features.timeline.cards.election.electionFor')}:{' '}
          </span>
          <span className="font-medium">{election.positionName}</span>
        </div>

        {/* Winner display or candidate avatars */}
        {isWinnerAnnounced && election.winnerName ? (
          <WinnerDisplay
            name={election.winnerName}
            avatarUrl={election.winnerAvatarUrl}
            votePercentage={election.winnerVotePercentage}
            positionName={election.positionName}
          />
        ) : (
          election.candidates.length > 0 && (
            <CandidateAvatars
              candidates={election.candidates}
              winnerId={isWinnerAnnounced ? election.winnerId : undefined}
            />
          )
        )}

        {/* Phase timeline */}
        <div className="mt-3">
          <PhaseTimeline currentPhase={currentPhase} />
          <div className="mt-1 text-center text-xs text-muted-foreground">
            {currentPhase === 'nomination' &&
              t('features.timeline.cards.election.phases.nomination')}
            {currentPhase === 'voting' && t('features.timeline.cards.election.phases.voting')}
            {currentPhase === 'results' &&
              t('features.timeline.cards.election.phases.results')}{' '}
            {t('features.timeline.cards.election.phase')}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5" />
            <span>
              {election.totalCandidates} {t('features.timeline.cards.election.candidates')}
            </span>
          </div>
          {election.totalVoters !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>
                {election.totalVoters} {t('features.timeline.cards.election.voted')}
              </span>
            </div>
          )}
          {election.turnoutPercentage !== undefined && (
            <span className="font-medium">
              {election.turnoutPercentage}% {t('features.timeline.cards.election.turnout')}
            </span>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        {/* Primary action based on status */}
        {isNominationsOpen && onNominate && (
          <TimelineCardActionButton
            onClick={onNominate}
            variant="default"
            size="sm"
            label={t('features.timeline.cards.election.nominate')}
          />
        )}
        {isVotingOpen && onCastVote && (
          <TimelineCardActionButton
            onClick={onCastVote}
            variant="default"
            size="sm"
            label={t('features.timeline.cards.castVote')}
          />
        )}
        {(election.status === 'closed' || isWinnerAnnounced) && onViewResults && (
          <TimelineCardActionButton
            onClick={onViewResults}
            variant="default"
            size="sm"
            label={t('features.timeline.cards.viewResults')}
          />
        )}

        {/* View candidates */}
        {onViewCandidates && !isWinnerAnnounced && (
          <TimelineCardActionButton
            onClick={onViewCandidates}
            variant="outline"
            size="sm"
            label={t('features.timeline.cards.election.viewCandidates')}
          />
        )}

        {/* Link to election page */}
        <Link href={`/election/${election.id}`} passHref>
          <TimelineCardActionButton
            variant="ghost"
            size="sm"
            className="ml-auto"
            icon={ExternalLink}
            label=""
          />
        </Link>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}

export default ElectionTimelineCard;
