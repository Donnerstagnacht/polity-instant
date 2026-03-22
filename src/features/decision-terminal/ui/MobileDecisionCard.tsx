'use client';

import { cn } from '@/features/shared/utils/utils';
import { Button } from '@/features/shared/ui/ui/button';
import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { Vote, Award, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { StatusBadge, type DecisionStatus } from './StatusBadge';
import { CountdownTimer, EndedAgo } from './CountdownTimer';
import { CandidateBarCompact, VoteBarCompact } from './VoteProgressBar';
import { TrendIndicator } from './TrendIndicator';
import { ResultBadge } from './ResultBadge';
import type { DecisionItem } from './types';

export interface MobileDecisionCardProps {
  decision: DecisionItem;
  onClick: () => void;
  className?: string;
}

function getElectionBarData(decision: DecisionItem) {
  if (decision.type !== 'election' || !decision.candidates?.length) {
    return null;
  }

  const candidates = decision.candidates
    .map(candidate => ({
      id: candidate.id,
      label: candidate.name,
      value: decision.isIndicationPhase ? (candidate.indicationVotes || 0) : (candidate.votes || 0),
    }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));

  return {
    totalSelections: decision.votedCount ?? candidates.reduce((total, candidate) => total + candidate.value, 0),
    candidates,
  };
}

/**
 * Mobile-friendly card for Decision Terminal
 * Compact but shows key info: status, time, trend
 */
export function MobileDecisionCard({ decision, onClick, className }: MobileDecisionCardProps) {
  const { t } = useTranslation();
  const Icon = decision.type === 'vote' ? Vote : Award;
  const electionBarData = getElectionBarData(decision);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        decision.isUrgent && !decision.isClosed && 'border-red-500/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Status and time row */}
        <div className="mb-3 flex items-center justify-between">
          {decision.isClosed ? (
            <ResultBadge
              result={decision.status as 'passed' | 'failed' | 'tied' | 'elected'}
              winnerName={decision.winnerName}
            />
          ) : (
            <StatusBadge status={decision.status as DecisionStatus} />
          )}
          <div className="text-right">
            {decision.isClosed ? (
              <EndedAgo endedAt={decision.endsAt} />
            ) : decision.isOpeningSoon && decision.startsAt ? (
              <CountdownTimer
                endsAt={decision.startsAt}
                compact
                compactLabel={t('timeline.terminal.startsIn', 'Starts in')}
              />
            ) : (
              <CountdownTimer
                endsAt={decision.endsAt}
                compact
                compactLabel={t('timeline.terminal.closesIn', 'Closes in')}
              />
            )}
          </div>
        </div>

        {/* ID and Title */}
        <div className="mb-2 flex items-start gap-2">
          <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <span className="mr-2 font-mono text-xs text-muted-foreground">{decision.id}</span>
            <h3 className="font-medium leading-tight">{decision.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{decision.body}</p>
          </div>
        </div>

        {/* Vote bar and trend (for votes) or candidate share bar (for elections) */}
        {decision.type === 'election' && electionBarData ? (
          <div className="mb-3 mt-3 space-y-2">
            <div className="flex items-center gap-2">
              {decision.isIndicationPhase && (
                <span className="shrink-0 text-[11px] text-blue-500">
                  {t('timeline.terminal.indication', 'Ind')}
                </span>
              )}
              {!decision.isIndicationPhase && electionBarData.candidates.some(c => c.value > 0) && (
                <span className="shrink-0 text-[10px] text-blue-400">
                  {t('timeline.terminal.indication', 'Ind')}
                  {' '}→
                </span>
              )}
              <CandidateBarCompact candidates={electionBarData.candidates} className="min-w-0 flex-1" />
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {electionBarData.totalSelections}
              </span>
            </div>
            {!decision.isClosed && <TrendIndicator trend={decision.trend} compact />}
          </div>
        ) : decision.votes && (
          <div className="mb-3 mt-3 space-y-2">
            <div className="flex items-center gap-2">
              {decision.isIndicationPhase && decision.indicationVotes ? (
                <span className="shrink-0 text-[11px] text-blue-500">
                  {t('timeline.terminal.indication', 'Ind')}
                </span>
              ) : decision.indicationVotes && !decision.isIndicationPhase ? (
                <span className="shrink-0 text-[10px] text-blue-400">
                  {t('timeline.terminal.indication', 'Ind')}
                  {' '}→
                </span>
              ) : null}
              <VoteBarCompact
                votes={decision.isIndicationPhase && decision.indicationVotes ? decision.indicationVotes : decision.votes}
                className={cn('min-w-0 flex-1', decision.isIndicationPhase && 'opacity-70')}
              />
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {(() => {
                  const v = decision.isIndicationPhase && decision.indicationVotes ? decision.indicationVotes : decision.votes;
                  return `${v.support}/${v.oppose}/${v.abstain}`;
                })()}
              </span>
            </div>
            {!decision.isClosed && <TrendIndicator trend={decision.trend} compact />}
          </div>
        )}

        {/* Action button */}
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full justify-between"
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
        >
          {decision.isClosed ? t('timeline.terminal.viewResults') : t('timeline.terminal.castVote')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
