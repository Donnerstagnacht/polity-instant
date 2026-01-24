'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/utils';
import { Vote, Award } from 'lucide-react';
import { StatusBadge, type DecisionStatus } from './StatusBadge';
import { TrendIndicator } from './TrendIndicator';
import { CountdownTimer, EndedAgo } from './CountdownTimer';
import { VoteBarCompact } from './VoteProgressBar';
import { useTranslation } from '@/hooks/use-translation';
import { ResultCompact } from './ResultBadge';
import type { DecisionItem } from './types';

export interface DecisionRowProps {
  decision: DecisionItem;
  onClick: () => void;
  isSelected?: boolean;
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
        'grid cursor-pointer grid-cols-[70px_0.9fr_140px_100px_80px_180px_80px] gap-2 px-4 py-3 transition-colors',
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
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-xs font-medium">{decision.id}</span>
      </div>

      {/* Title */}
      <div className="flex items-center">
        <span className="truncate text-sm font-medium">{decision.title}</span>
      </div>

      {/* Body/Category */}
      <div className="flex items-center">
        <span className="truncate text-xs text-muted-foreground">{decision.body}</span>
      </div>

      {/* Time */}
      <div className="flex items-center">
        {decision.isClosed ? (
          <EndedAgo endedAt={decision.endsAt} />
        ) : (
          <CountdownTimer endsAt={decision.endsAt} compact />
        )}
      </div>

      {/* Status */}
      <div className="flex items-center">
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
        {decision.votes ? (
          <div className="flex w-full flex-col gap-1">
            <VoteBarCompact votes={decision.votes} className="w-full" />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {t('timeline.terminal.support', { defaultValue: 'Support' })}:{' '}
                {decision.votes.support}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {t('timeline.terminal.oppose', { defaultValue: 'Oppose' })}: {decision.votes.oppose}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                {t('timeline.terminal.abstain', { defaultValue: 'Abstain' })}:{' '}
                {decision.votes.abstain}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Trend */}
      <div className="flex items-center">
        {decision.isClosed && decision.supportPercentage !== undefined ? (
          <span className="font-mono text-xs text-muted-foreground">
            {decision.supportPercentage}%
          </span>
        ) : (
          <TrendIndicator trend={decision.trend} compact />
        )}
      </div>
    </div>
  );
}
