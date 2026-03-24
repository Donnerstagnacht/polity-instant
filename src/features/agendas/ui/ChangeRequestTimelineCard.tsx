'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Button } from '@/features/shared/ui/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/features/shared/ui/ui/collapsible';
import { ChevronDown, CheckCircle2, Circle, Loader2, Vote, Play, Flag, Lock, Crown } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { VotePhaseBadge } from '@/features/vote-cast/ui/VotePhaseBadge';
import { VoteResultsDisplay, type VoteBarOption } from '@/features/vote-cast/ui/VoteResultsDisplay';
import { VoteResultSentence } from '@/features/vote-cast/ui/VoteResultSentence';
import {
  computeVoteResultSummary,
  type MajorityType,
  type VoteResult,
} from '@/features/vote-cast/logic/computeVoteResults';
import { getVotePhase, getVoteResult } from '../hooks/useAgendaItemCRVoting';
import { calculateVoteStats } from '../hooks/useAgendaItemVoting';
import type { ChangeRequestTimelineRow } from '@/zero/agendas/queries';
import type { ChoicesByVoteRow } from '@/zero/votes/queries';

const CR_CHOICE_COLORS = [
  { color: 'bg-green-500', light: 'bg-green-300/60' },
  { color: 'bg-red-500', light: 'bg-red-300/60' },
  { color: 'bg-gray-400', light: 'bg-gray-300/60' },
  { color: 'bg-blue-500', light: 'bg-blue-300/60' },
  { color: 'bg-purple-500', light: 'bg-purple-300/60' },
  { color: 'bg-orange-500', light: 'bg-orange-300/60' },
];

function normalizeMajorityType(value?: string | null): MajorityType {
  if (value === 'absolute' || value === 'two_thirds') {
    return value;
  }

  return 'simple';
}

/** Optional text diff data to render inside the card. */
export interface ChangeRequestDiffData {
  changeType?: string;
  originalText?: string;
  newText?: string;
  properties?: Record<string, string>;
  newProperties?: Record<string, string>;
  justification?: string;
}

interface ChangeRequestTimelineCardProps {
  item: ChangeRequestTimelineRow;
  index: number;
  isCurrent: boolean;
  hasUserVoted: boolean;
  userSelectedChoiceIds: string[];
  canManage: boolean;
  canVote: boolean;
  isFinalVoteLocked?: boolean;
  diff?: ChangeRequestDiffData;
  onCastVote?: (item: ChangeRequestTimelineRow, choiceId: string) => Promise<void>;
  onStartIndicative?: (itemId: string) => Promise<void>;
  onStartFinal?: (itemId: string) => Promise<void>;
  onCloseVoting?: (itemId: string) => Promise<void> | Promise<unknown>;
}

function getStatusIcon(status: string | null, isCurrent: boolean) {
  if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (isCurrent) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
  return <Circle className="h-5 w-5 text-muted-foreground" />;
}

function getStatusBadge(
  status: string | null,
  isCurrent: boolean,
  t: (key: string, fallback?: string) => string,
  voteResult?: string,
  originalStatus?: string,
) {
  // Determine accepted/rejected from vote result or original mock status
  if (status === 'completed') {
    if (voteResult === 'passed' || originalStatus === 'approved' || originalStatus === 'accepted') {
      return <Badge variant="default" className="bg-green-600">{t('features.agendas.crTimeline.accepted', 'Accepted')}</Badge>;
    }
    if (voteResult === 'rejected' || voteResult === 'failed' || originalStatus === 'declined' || originalStatus === 'rejected') {
      return <Badge variant="default" className="bg-red-600">{t('features.agendas.crTimeline.rejected', 'Rejected')}</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">{t('features.agendas.crTimeline.completed')}</Badge>;
  }
  if (isCurrent) return <Badge variant="default" className="bg-blue-600">{t('features.agendas.crTimeline.voting')}</Badge>;
  return <Badge variant="default" className="bg-blue-600">{t('features.agendas.crTimeline.open', 'Open')}</Badge>;
}

export function ChangeRequestTimelineCard({
  item,
  index,
  isCurrent,
  hasUserVoted,
  userSelectedChoiceIds,
  canManage,
  canVote,
  isFinalVoteLocked,
  diff,
  onCastVote,
  onStartIndicative,
  onStartFinal,
  onCloseVoting,
}: ChangeRequestTimelineCardProps) {
  const { t } = useTranslation();
  const [votingLoading, setVotingLoading] = useState(false);
  const cr = item.change_request;
  const vote = item.vote;

  const title = item.is_final_vote
    ? t('features.agendas.crTimeline.acceptAmendment', 'Accept amendment as modified')
    : cr?.title || `${t('features.agendas.crTimeline.changeRequest')} ${index + 1}`;

  const phase = getVotePhase(item);
  const isClosed = phase === 'closed';
  const isIndicative = phase === 'indicative';
  const isFinal = phase === 'final_vote';
  const voteResult = isClosed ? getVoteResult(item) : undefined;

  // Compute vote stats using the existing helper
  const choices = useMemo(() => (vote?.choices ?? []) as ChoicesByVoteRow[], [vote?.choices]);
  const indicativeDecisions = useMemo(() => vote?.indicative_decisions ?? [], [vote?.indicative_decisions]);
  const finalDecisions = useMemo(() => vote?.final_decisions ?? [], [vote?.final_decisions]);

  const { choices: choiceStats, totalIndicative, totalFinal } = useMemo(
    () => calculateVoteStats(choices, indicativeDecisions, finalDecisions),
    [choices, indicativeDecisions, finalDecisions]
  );

  const totalVoters = vote?.voters?.length ?? 0;

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
      totalVoters || totalFinal,
      normalizeMajorityType(vote?.majority_type),
    );
  }, [choiceStats.length, choices, finalDecisions, isClosed, totalFinal, totalVoters, vote?.majority_type]);

  const resolvedVoteResult: VoteResult | undefined = voteResult ?? computedVoteSummary?.result;

  const leadingChoiceId = useMemo(() => {
    if (choiceStats.length === 0) return null;
    const maxVotes = Math.max(
      ...choiceStats.map((s) => (isClosed || !isIndicative ? s.finalCount : s.indicativeCount)),
    );
    if (maxVotes === 0) return null;
    return choiceStats.find(
      (s) => (isClosed || !isIndicative ? s.finalCount : s.indicativeCount) === maxVotes,
    )?.choice.id;
  }, [choiceStats, isClosed, isIndicative]);

  const winningChoiceId = useMemo(() => {
    if (resolvedVoteResult === 'tie') {
      return null;
    }

    if (isClosed) {
      return computedVoteSummary?.winningChoiceId ?? leadingChoiceId;
    }

    return leadingChoiceId;
  }, [computedVoteSummary?.winningChoiceId, isClosed, leadingChoiceId, resolvedVoteResult]);

  const winningLabel = useMemo(() => {
    if (!winningChoiceId) return undefined;
    const choice = choices.find((c) => c.id === winningChoiceId);
    return choice?.label || undefined;
  }, [winningChoiceId, choices]);

  const resolvedVoteSharePercent = useMemo(() => {
    if (!winningChoiceId) {
      return undefined;
    }

    const winningStats = choiceStats.find((choice) => choice.choice.id === winningChoiceId);
    if (!winningStats) {
      return undefined;
    }

    return Math.round(winningStats.finalPercentage);
  }, [choiceStats, winningChoiceId]);
  const currentPhaseVoteCount = isFinal || isClosed ? totalFinal : totalIndicative;

  const handleCastVote = async (choiceId: string) => {
    if (!onCastVote) return;
    setVotingLoading(true);
    try {
      await onCastVote(item, choiceId);
    } finally {
      setVotingLoading(false);
    }
  };

  const isLocked = item.is_final_vote && isFinalVoteLocked;

  return (
    <Collapsible defaultOpen={isCurrent || item.is_final_vote}>
      <Card className={cn(
        'transition-all',
        isCurrent && !isLocked && 'ring-2 ring-blue-500/50',
        item.status === 'completed' && 'opacity-75',
        isLocked && 'opacity-50',
      )}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {isLocked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                getStatusIcon(item.status, isCurrent)
              )}
              <CardTitle className="text-sm font-medium">
                {item.is_final_vote && <Vote className="mr-1 inline h-4 w-4" />}
                {title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasUserVoted && (
                <Badge variant="outline" className="text-xs">
                  {t('features.agendas.crTimeline.voted')}
                </Badge>
              )}
              {!isLocked && vote && (
                <VotePhaseBadge
                  phase={isIndicative ? 'indication' : isClosed ? 'closed' : 'final_vote'}
                />
              )}
              {getStatusBadge(
                item.status,
                isCurrent && !isLocked,
                t,
                resolvedVoteResult,
                (item as Record<string, unknown>)._originalStatus as string | undefined,
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Locked message for final vote */}
            {isLocked && (
              <p className="text-sm text-muted-foreground italic">
                {t('features.agendas.crTimeline.finalVoteLocked')}
              </p>
            )}

            {/* CR description */}
            {cr?.description && (
              <p className="text-sm text-muted-foreground">{cr.description}</p>
            )}

            {/* Text diff details (collapsible) */}
            {diff && !item.is_final_vote && (diff.originalText || diff.newText || diff.justification || (diff.newProperties && Object.keys(diff.newProperties).length > 0)) && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <ChevronDown className="h-3 w-3 transition-transform [[data-state=open]_&]:rotate-180" />
                  {t('features.agendas.crTimeline.showChanges', 'Show Changes')}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-3">
                  {/* Formatting change */}
                  {diff.changeType === 'update' && diff.newText && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {isClosed ? 'Formatting Changed:' : 'Formatting Change:'}
                      </h4>
                      {diff.newProperties && Object.keys(diff.newProperties).length > 0 && (
                        <div className="rounded-lg bg-blue-500/10 p-3">
                          <div className="mb-1 flex flex-wrap gap-2">
                            {Object.entries(diff.newProperties).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs capitalize">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                          <p className="whitespace-pre-wrap text-xs">To text: &quot;{diff.newText}&quot;</p>
                        </div>
                      )}
                      {diff.properties && Object.keys(diff.properties).length > 0 && (
                        <div className="mt-2 rounded-lg bg-muted/50 p-3">
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">
                            {isClosed ? 'Removed formatting:' : 'Remove formatting:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(diff.properties).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs capitalize opacity-60">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Removed text */}
                  {diff.originalText && (diff.changeType === 'remove' || diff.changeType === 'replace') && (
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-red-600 dark:text-red-400">
                        {diff.changeType === 'remove' ? (isClosed ? 'Deleted:' : 'Delete:') : 'Original Text:'}
                      </h4>
                      <div className="rounded-lg bg-red-500/10 p-3 line-through">
                        <p className="whitespace-pre-wrap text-xs">{diff.originalText}</p>
                      </div>
                    </div>
                  )}

                  {/* Added/replacement text */}
                  {diff.newText && (diff.changeType === 'insert' || diff.changeType === 'replace') && (
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-green-600 dark:text-green-400">
                        {diff.changeType === 'insert' ? (isClosed ? 'Added:' : 'Add:') : 'Replace with:'}
                      </h4>
                      <div className="rounded-lg bg-green-500/10 p-3">
                        <p className="whitespace-pre-wrap text-xs">{diff.newText}</p>
                      </div>
                    </div>
                  )}

                  {/* Justification */}
                  {diff.justification && (
                    <div>
                      <h4 className="mb-1 text-sm font-semibold">Justification:</h4>
                      <p className="text-xs text-muted-foreground">{diff.justification}</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Vote result sentence when closed */}
            {isClosed && resolvedVoteResult && (
              <VoteResultSentence
                type="vote"
                result={resolvedVoteResult}
                winnerName={winningLabel}
                voteSharePercent={resolvedVoteSharePercent}
                isFinal
              />
            )}

            {/* Vote results with one bar block per choice */}
            {!isLocked && (
              choices.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-muted-foreground">
                    {t('features.events.agenda.noChoices', 'No choices defined')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {choiceStats.map((cs, idx) => {
                    const isWinner = cs.choice.id === winningChoiceId && !isIndicative;
                    const isSelected = userSelectedChoiceIds.includes(cs.choice.id);
                    const colors = CR_CHOICE_COLORS[idx % CR_CHOICE_COLORS.length];

                    const option: VoteBarOption = {
                      key: cs.choice.id,
                      label: cs.choice.label || `Choice ${idx + 1}`,
                      color: colors.color,
                      lightColor: colors.light,
                      finalCount: cs.finalCount,
                      finalPercent: cs.finalPercentage,
                      indicationCount: cs.indicativeCount,
                      indicationPercent: cs.indicativePercentage,
                    };

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
                          options={[option]}
                          phase={isIndicative ? 'indication' : isClosed ? 'closed' : 'final_vote'}
                          totalFinal={totalFinal}
                          totalIndication={totalIndicative}
                          totalEligible={totalVoters}
                        />
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Participation count */}
            {vote && !isLocked && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {currentPhaseVoteCount}/{totalVoters} {t('features.agendas.crTimeline.votersParticipated')}
                </span>
              </div>
            )}

            {hasUserVoted && !isLocked && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">
                  {isIndicative
                    ? t('features.events.agenda.yourIndication')
                    : t('features.events.agenda.yourVote')}
                </span>
              </div>
            )}

            {/* Voting buttons for active items */}
            {isCurrent && !isLocked && !isClosed && !hasUserVoted && canVote && vote && (
              <div className="flex gap-2 pt-2">
                {choices.map((choice) => (
                  <Button
                    key={choice.id}
                    size="sm"
                    variant={
                      choice.label === 'yes' ? 'default' :
                      choice.label === 'no' ? 'destructive' :
                      'secondary'
                    }
                    className={cn(
                      choice.label === 'yes' && 'bg-green-600 hover:bg-green-700',
                    )}
                    disabled={votingLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCastVote(choice.id);
                    }}
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Moderator controls for active items */}
            {isCurrent && !isLocked && canManage && !isClosed && (
              <div className="flex gap-2 border-t pt-3">
                {item.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartIndicative?.(item.id);
                    }}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    {t('features.agendas.crTimeline.startIndicative')}
                  </Button>
                )}
                {isIndicative && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartFinal?.(item.id);
                    }}
                  >
                    <Flag className="mr-1 h-3 w-3" />
                    {t('features.agendas.crTimeline.startFinal')}
                  </Button>
                )}
                {isFinal && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseVoting?.(item.id);
                    }}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {t('features.agendas.crTimeline.closeVoting')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
