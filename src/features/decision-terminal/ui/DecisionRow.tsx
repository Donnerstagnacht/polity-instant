'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/features/shared/utils/utils';
import { Vote, Award } from 'lucide-react';
import { StatusBadge, type DecisionStatus } from './StatusBadge';
import { TrendIndicator } from './TrendIndicator';
import { CountdownTimer, EndedAgo } from './CountdownTimer';
import { CandidateBarCompact, VoteBarCompact } from './VoteProgressBar';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { ResultCompact } from './ResultBadge';
import type { DecisionItem } from './types';

export interface DecisionRowProps {
  decision: DecisionItem;
  onClick: () => void;
  isSelected?: boolean;
}

function getElectionBarData(decision: DecisionItem) {
  if (decision.type !== 'election' || !decision.candidates?.length) {
    return null;
  }

  const candidates = decision.candidates
    .map(candidate => ({
      id: candidate.id,
      label: candidate.name,
      value: decision.isIndicationPhase ? candidate.indicationVotes || 0 : candidate.votes || 0,
    }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));

  return {
    totalSelections:
      decision.votedCount ?? candidates.reduce((total, candidate) => total + candidate.value, 0),
    candidates,
  };
}

/**
 * Single row in the Decision Table
 * Shows ID, title, body, time, status, and trend
 * Includes flash effect when values change significantly
 */
export function DecisionRow({ decision, onClick, isSelected }: DecisionRowProps) {
  const { t } = useTranslation();
  const [isFlashing, setIsFlashing] = useState(false);
  const prevTrendRef = useRef(decision.trend.percentage);
  const electionBarData = getElectionBarData(decision);
  const gridColumnsClass = 'grid-cols-[70px_minmax(0,0.9fr)_140px_100px_112px_180px_80px]';

  // Flash effect when trend changes significantly (> 2%)
  useEffect(() => {
    const change = Math.abs(decision.trend.percentage - prevTrendRef.current);
    if (change >= 2) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 500);
      prevTrendRef.current = decision.trend.percentage;
      return () => clearTimeout(timer);
    }
    prevTrendRef.current = decision.trend.percentage;
  }, [decision.trend.percentage]);

  const Icon = decision.type === 'vote' ? Vote : Award;

  return (
    <div
      className={cn(
        'grid cursor-pointer gap-2 px-4 py-3 transition-colors',
        gridColumnsClass,
        'hover:bg-muted/50',
        isSelected && 'bg-muted',
        isFlashing && 'animate-flash-yellow'
      )}
      onClick={onClick}
      role="row"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* ID */}
      <div className="flex items-center gap-1">
        <Icon className="text-muted-foreground h-3.5 w-3.5" />
        <span className="font-mono text-xs font-medium">{decision.id}</span>
      </div>

      {/* Title */}
      <div className="flex items-center">
        <span className="truncate text-sm font-medium">{decision.title}</span>
      </div>

      {/* Body/Category */}
      <div className="flex items-center">
        <span className="text-muted-foreground truncate text-xs">{decision.body}</span>
      </div>

      {/* Time */}
      <div className="flex items-center">
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

      {/* Status */}
      <div className="flex min-w-0 items-center">
        {decision.isClosed ? (
          <ResultCompact
            result={decision.status as 'passed' | 'failed' | 'tied' | 'elected'}
            winnerName={decision.winnerName}
          />
        ) : (
          <StatusBadge status={decision.status as DecisionStatus} className="text-[10px]" />
        )}
      </div>

      {/* Votes */}
      <div className="flex items-center">
        {decision.type === 'election' && electionBarData ? (
          <div className="flex w-full items-center gap-2 overflow-hidden">
            {decision.isIndicationPhase && (
              <span className="shrink-0 text-[10px] text-blue-500">
                {t('timeline.terminal.indication', 'Ind')}
              </span>
            )}
            {!decision.isIndicationPhase && electionBarData.candidates.some(c => c.value > 0) && (
              <span className="shrink-0 text-[9px] text-blue-400">
                {t('timeline.terminal.indication', 'Ind')} →
              </span>
            )}
            <CandidateBarCompact
              candidates={electionBarData.candidates}
              className="min-w-0 flex-1"
            />
            <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
              {electionBarData.totalSelections}
            </span>
          </div>
        ) : decision.votes ? (
          <div className="flex w-full items-center gap-2 overflow-hidden">
            {decision.isIndicationPhase && decision.indicationVotes ? (
              <span className="shrink-0 text-[10px] text-blue-500">
                {t('timeline.terminal.indication', 'Ind')}
              </span>
            ) : decision.indicationVotes && !decision.isIndicationPhase ? (
              <span className="shrink-0 text-[9px] text-blue-400">
                {t('timeline.terminal.indication', 'Ind')} →
              </span>
            ) : null}
            <VoteBarCompact
              votes={
                decision.isIndicationPhase && decision.indicationVotes
                  ? decision.indicationVotes
                  : decision.votes
              }
              className={cn('min-w-0 flex-1', decision.isIndicationPhase && 'opacity-70')}
            />
            <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
              {(() => {
                const v =
                  decision.isIndicationPhase && decision.indicationVotes
                    ? decision.indicationVotes
                    : decision.votes;
                return `${v.support}/${v.oppose}/${v.abstain}`;
              })()}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>

      {/* Trend */}
      <div className="flex items-center">
        {decision.isClosed && decision.supportPercentage !== undefined ? (
          <span className="text-muted-foreground font-mono text-xs">
            {decision.supportPercentage}%
          </span>
        ) : (
          <TrendIndicator trend={decision.trend} compact />
        )}
      </div>
    </div>
  );
}
