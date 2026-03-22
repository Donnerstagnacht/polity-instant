'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  Vote,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import { VoteResultsDisplay, type VoteBarOption } from '@/features/vote-cast/ui/VoteResultsDisplay';
import { VoteResultSentence } from '@/features/vote-cast/ui/VoteResultSentence';
import { VotePhaseBadge } from '@/features/vote-cast/ui/VotePhaseBadge';
import {
  computeVoteResultSummary,
  type MajorityType,
  type VoteResult,
} from '@/features/vote-cast/logic/computeVoteResults';
import {
  calculateVoteStats,
  getVotingPhase,
} from '@/features/agendas/hooks/useAgendaItemVoting';
import type { ChoicesByVoteRow } from '@/zero/votes/queries';

interface ChoiceDecision {
  choice_id: string;
}

function normalizeMajorityType(value?: string | null): MajorityType {
  if (value === 'absolute' || value === 'two_thirds') {
    return value;
  }

  return 'simple';
}

// Color palette for choices
const CHOICE_COLORS = [
  { color: 'bg-green-500', light: 'bg-green-300/60' },
  { color: 'bg-red-500', light: 'bg-red-300/60' },
  { color: 'bg-gray-400', light: 'bg-gray-300/60' },
  { color: 'bg-blue-500', light: 'bg-blue-300/60' },
  { color: 'bg-purple-500', light: 'bg-purple-300/60' },
  { color: 'bg-orange-500', light: 'bg-orange-300/60' },
];

interface AgendaVoteSectionProps {
  voteTitle: string;
  choices: ChoicesByVoteRow[];
  indicativeDecisions: ReadonlyArray<ChoiceDecision>;
  finalDecisions: ReadonlyArray<ChoiceDecision>;
  userHasVoted: boolean;
  userSelectedChoiceIds: string[];
  voteStatus?: string | null;
  voteResult?: 'passed' | 'rejected' | 'tie';
  voteSharePercent?: number;
  majorityType?: string | null;
  totalEligibleVoters?: number;
  className?: string;
}

/**
 * AgendaVoteSection - Displays vote results for an agenda item.
 *
 * Shows dynamic choices from vote_choice table with TWO result bars
 * (indicative + final). Winner gets golden border + crown when status=closed.
 */
export function AgendaVoteSection({
  voteTitle,
  choices,
  indicativeDecisions,
  finalDecisions,
  userHasVoted,
  userSelectedChoiceIds,
  voteStatus,
  voteResult,
  voteSharePercent,
  majorityType,
  totalEligibleVoters,
  className,
}: AgendaVoteSectionProps) {
  const { t } = useTranslation();

  const phase = getVotingPhase(voteStatus);
  const isIndicationPhase = phase === 'indicative';
  const isClosed = phase === 'closed';

  const { choices: choiceStats, totalIndicative, totalFinal } = useMemo(() => {
    return calculateVoteStats(choices, indicativeDecisions, finalDecisions);
  }, [choices, indicativeDecisions, finalDecisions]);

  const computedVoteSummary = useMemo(() => {
    if (!isClosed || choiceStats.length === 0) {
      return null;
    }

    return computeVoteResultSummary(
      choices.map((choice, idx) => ({
        id: choice.id,
        label: choice.label || `Choice ${idx + 1}`,
        order_index: choice.order_index ?? idx,
      })),
      finalDecisions,
      totalEligibleVoters ?? totalFinal,
      normalizeMajorityType(majorityType),
    );
  }, [choiceStats.length, choices, finalDecisions, isClosed, majorityType, totalEligibleVoters, totalFinal]);

  const resolvedVoteResult: VoteResult | undefined = voteResult ?? computedVoteSummary?.result;

  // Find the winning choice in final results
  const leadingChoiceId = useMemo(() => {
    if (choiceStats.length === 0) return null;
    const maxVotes = Math.max(
      ...choiceStats.map((s) => (isClosed || !isIndicationPhase ? s.finalCount : s.indicativeCount)),
    );
    if (maxVotes === 0) return null;
    return choiceStats.find(
      (s) => (isClosed || !isIndicationPhase ? s.finalCount : s.indicativeCount) === maxVotes,
    )?.choice.id;
  }, [choiceStats, isIndicationPhase, isClosed]);

  const winningChoiceId = useMemo(() => {
    if (resolvedVoteResult === 'tie') {
      return null;
    }

    if (isClosed) {
      return computedVoteSummary?.winningChoiceId ?? leadingChoiceId;
    }

    return leadingChoiceId;
  }, [computedVoteSummary?.winningChoiceId, isClosed, leadingChoiceId, resolvedVoteResult]);

  const voteBarOptions: VoteBarOption[] = useMemo(() => {
    return choiceStats.map((cs, idx) => {
      const colors = CHOICE_COLORS[idx % CHOICE_COLORS.length];
      return {
        key: cs.choice.id,
        label: cs.choice.label || `Choice ${idx + 1}`,
        color: colors.color,
        lightColor: colors.light,
        finalCount: cs.finalCount,
        finalPercent: cs.finalPercentage,
        indicationCount: cs.indicativeCount,
        indicationPercent: cs.indicativePercentage,
      };
    });
  }, [choiceStats]);

  const winningLabel = useMemo(() => {
    if (!winningChoiceId) return undefined;
    const choice = choices.find((c) => c.id === winningChoiceId);
    return choice?.label || undefined;
  }, [winningChoiceId, choices]);

  const resolvedVoteSharePercent = useMemo(() => {
    if (voteSharePercent !== undefined) {
      return voteSharePercent;
    }

    if (!winningChoiceId) {
      return undefined;
    }

    const winningStats = choiceStats.find((choice) => choice.choice.id === winningChoiceId);
    if (!winningStats) {
      return undefined;
    }

    return Math.round(winningStats.finalPercentage);
  }, [choiceStats, voteSharePercent, winningChoiceId]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          {t('features.events.agenda.voteResults', 'Vote Results')}
          <VotePhaseBadge
            phase={
              isIndicationPhase
                ? 'indication'
                : isClosed
                  ? 'closed'
                  : 'final_vote'
            }
            className="ml-auto"
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Result sentence when voting is closed */}
        {isClosed && resolvedVoteResult && (
          <VoteResultSentence
            type="vote"
            result={resolvedVoteResult}
            winnerName={winningLabel}
            voteSharePercent={resolvedVoteSharePercent}
            isFinal
          />
        )}

        {/* Vote title */}
        <h3 className="font-semibold">{voteTitle}</h3>

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

        {/* Choices with result bars */}
        {choices.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground">
              {t('features.events.agenda.noChoices', 'No choices defined')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {choiceStats.map((cs, idx) => {
              const isWinner = cs.choice.id === winningChoiceId && !isIndicationPhase;
              const isSelected = userSelectedChoiceIds.includes(cs.choice.id);
              const colors = CHOICE_COLORS[idx % CHOICE_COLORS.length];

              return (
                <div
                  key={cs.choice.id}
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    isSelected && 'border-primary bg-primary/5',
                    isWinner &&
                      isClosed &&
                      'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-medium">{cs.choice.label || `Choice ${idx + 1}`}</span>
                    {isWinner && isClosed && <Crown className="h-4 w-4 text-yellow-500" />}
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>

                  <VoteResultsDisplay
                    options={[
                      {
                        key: cs.choice.id,
                        label: cs.choice.label || `Choice ${idx + 1}`,
                        color: colors.color,
                        lightColor: colors.light,
                        finalCount: cs.finalCount,
                        finalPercent: cs.finalPercentage,
                        indicationCount: cs.indicativeCount,
                        indicationPercent: cs.indicativePercentage,
                      },
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
      </CardContent>
    </Card>
  );
}
