'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Vote, UserPlus, CheckCircle2, Crown, User, Loader2 } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import { VoteResultsDisplay, type VoteBarOption } from '@/features/vote-cast/ui/VoteResultsDisplay';
import { VoteResultSentence } from '@/features/vote-cast/ui/VoteResultSentence';
import { VotePhaseBadge } from '@/features/vote-cast/ui/VotePhaseBadge';
import {
  calculateElectionStats,
  getVotingPhase,
} from '@/features/agendas/hooks/useAgendaItemVoting';
import type { CandidatesByElectionRow } from '@/zero/elections/queries';

interface CandidateSelection {
  candidate_id: string;
}

interface AgendaElectionSectionProps {
  positionName: string;
  candidates: CandidatesByElectionRow[];
  indicativeSelections: ReadonlyArray<CandidateSelection>;
  finalSelections: ReadonlyArray<CandidateSelection>;
  userHasVoted: boolean;
  userSelectedCandidateIds: string[];
  electionStatus?: string | null;
  canVote: boolean;
  canBeCandidate: boolean;
  isUserCandidate: boolean;
  isVotingLoading?: boolean;
  isCandidateLoading?: boolean;
  onBecomeCandidate: () => void;
  onWithdrawCandidacy?: () => void;
  winnerName?: string;
  winnerVoteSharePercent?: number;
  className?: string;
}

/**
 * Build VoteBarOption for a candidate
 */
function buildCandidateOption(
  candidateId: string,
  candidateName: string,
  indicativeCount: number,
  indicativePercent: number,
  finalCount: number,
  finalPercent: number,
): VoteBarOption {
  return {
    key: candidateId,
    label: candidateName,
    color: 'bg-primary',
    lightColor: 'bg-blue-400/50',
    finalCount,
    finalPercent,
    indicationCount: indicativeCount,
    indicationPercent: indicativePercent,
  };
}

function getCandidateDisplayName(candidate: CandidatesByElectionRow): string {
  const user = candidate.user;
  if (!user) return candidate.name || 'Unknown';
  const full = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return full || user.email || candidate.name || 'Unknown';
}

/**
 * AgendaElectionSection - Displays election results for an agenda item.
 *
 * Shows candidates with TWO result bars (indicative + final).
 * Winner gets a golden border + Crown icon when status=closed.
 */
export function AgendaElectionSection({
  positionName,
  candidates,
  indicativeSelections,
  finalSelections,
  userHasVoted,
  userSelectedCandidateIds,
  electionStatus,
  canVote,
  canBeCandidate,
  isUserCandidate,
  isVotingLoading,
  isCandidateLoading,
  onBecomeCandidate,
  onWithdrawCandidacy,
  winnerName,
  winnerVoteSharePercent,
  className,
}: AgendaElectionSectionProps) {
  const { t } = useTranslation();

  const phase = getVotingPhase(electionStatus);
  const isIndicationPhase = phase === 'indicative';
  const isClosed = phase === 'closed';

  // Show all candidates except withdrawn
  const visibleCandidates = useMemo(() => {
    return candidates.filter((c) => c.status !== 'withdrawn');
  }, [candidates]);

  const { candidates: candidateStats, totalIndicative, totalFinal } = useMemo(() => {
    return calculateElectionStats(visibleCandidates, indicativeSelections, finalSelections);
  }, [visibleCandidates, indicativeSelections, finalSelections]);

  // Find the leading candidate in final results
  const leadingCandidateId = useMemo(() => {
    if (candidateStats.length === 0) return null;
    const maxVotes = Math.max(
      ...candidateStats.map((s) => (isClosed || !isIndicationPhase ? s.finalCount : s.indicativeCount)),
    );
    if (maxVotes === 0) return null;
    return candidateStats.find(
      (s) => (isClosed || !isIndicationPhase ? s.finalCount : s.indicativeCount) === maxVotes,
    )?.candidate.id;
  }, [candidateStats, isIndicationPhase, isClosed]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {t('features.events.agenda.electionResults')}
            <VotePhaseBadge
              phase={
                isIndicationPhase
                  ? 'indication'
                  : isClosed
                    ? 'closed'
                    : 'final_vote'
              }
            />
          </CardTitle>
          <Badge variant="outline">{positionName}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Result sentence when voting is closed */}
        {isClosed && winnerName && (
          <VoteResultSentence
            type="election"
            result={winnerName ? 'passed' : 'tie'}
            winnerName={winnerName}
            positionName={positionName}
            voteSharePercent={winnerVoteSharePercent}
            isFinal
          />
        )}

        {/* Vote count header */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isIndicationPhase
              ? `${totalIndicative} ${t('features.events.agenda.indicationVotes')}`
              : `${totalFinal} ${t('features.events.agenda.votes')}`}
          </span>
          {isIndicationPhase && (
            <Badge variant="secondary" className="text-xs">
              * {t('features.events.agenda.indicationOnly')}
            </Badge>
          )}
        </div>

        {/* Candidates List */}
        {visibleCandidates.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">{t('features.events.agenda.noCandidates')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleCandidates.map((candidate) => {
              const stats = candidateStats.find((s) => s.candidate.id === candidate.id);
              const isLeading = candidate.id === leadingCandidateId && !isIndicationPhase;
              const isSelected = userSelectedCandidateIds.includes(candidate.id);
              const displayName = getCandidateDisplayName(candidate);

              return (
                <div
                  key={candidate.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    isSelected && 'border-primary bg-primary/5',
                    isLeading &&
                      isClosed &&
                      'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
                  )}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={candidate.user?.avatar ?? undefined}
                        alt={displayName}
                      />
                      <AvatarFallback>
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{displayName}</span>
                        <Badge
                          variant={candidate.status === 'accepted' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {candidate.status === 'accepted'
                            ? t('features.events.agenda.candidateAccepted')
                            : t('features.events.agenda.candidateNominated')}
                        </Badge>
                        {isLeading && isClosed && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      {candidate.user?.email && displayName !== candidate.user.email && (
                        <span className="text-sm text-muted-foreground">
                          {candidate.user.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vote bar */}
                  {stats && (
                    <VoteResultsDisplay
                      options={[
                        buildCandidateOption(
                          candidate.id,
                          displayName,
                          stats.indicativeCount,
                          stats.indicativePercentage,
                          stats.finalCount,
                          stats.finalPercentage,
                        ),
                      ]}
                      phase={
                        isIndicationPhase
                          ? 'indication'
                          : isClosed
                            ? 'closed'
                            : 'final_vote'
                      }
                      totalFinal={totalFinal}
                      totalIndication={totalIndicative}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* User's current vote indicator */}
        {userHasVoted && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">
              {isIndicationPhase
                ? t('features.events.agenda.yourIndication')
                : t('features.events.agenda.yourVote')}
            </span>
          </div>
        )}

        {/* Become Candidate Button */}
        {!isClosed && canBeCandidate && !isUserCandidate && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={onBecomeCandidate}
              disabled={isCandidateLoading}
            >
              {isCandidateLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {t('features.events.agenda.becomeCandidate')}
            </Button>
          </div>
        )}

        {/* Withdraw Candidacy */}
        {!isClosed && isUserCandidate && onWithdrawCandidacy && (
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={onWithdrawCandidacy}
              disabled={isCandidateLoading}
            >
              {t('features.events.agenda.withdrawCandidacy')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
