'use client';

import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Vote, Award, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { StatusBadge, type DecisionStatus } from './StatusBadge';
import { CountdownTimer, EndedAgo } from './CountdownTimer';
import { VoteBarCompact } from './VoteProgressBar';
import { TrendIndicator } from './TrendIndicator';
import { ResultBadge } from './ResultBadge';
import type { DecisionItem } from './types';

export interface MobileDecisionCardProps {
  decision: DecisionItem;
  onClick: () => void;
  className?: string;
}

/**
 * Mobile-friendly card for Decision Terminal
 * Compact but shows key info: status, time, trend
 */
export function MobileDecisionCard({ decision, onClick, className }: MobileDecisionCardProps) {
  const { t } = useTranslation();
  const Icon = decision.type === 'vote' ? Vote : Award;

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
            ) : (
              <CountdownTimer endsAt={decision.endsAt} compact />
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

        {/* Vote bar and trend (for open votes) */}
        {decision.votes && (
          <div className="mb-3 mt-3 space-y-2">
            {/* Indication display */}
            {decision.isIndicationPhase && decision.indicationVotes ? (
              <>
                <div className="flex items-center justify-between">
                  <VoteBarCompact
                    votes={decision.indicationVotes}
                    className="w-full max-w-[180px] opacity-70"
                  />
                </div>
                <div className="text-[11px] text-blue-500">
                  * {t('timeline.terminal.indicationOnly', { defaultValue: 'Indication only' })}
                </div>
              </>
            ) : (
              <>
                {/* Show indication comparison if available */}
                {decision.indicationVotes && !decision.isIndicationPhase && (
                  <div className="text-[10px] text-muted-foreground">
                    <span className="text-blue-400">
                      {t('timeline.terminal.indication', { defaultValue: 'Ind' })}:{' '}
                      {decision.indicationSupportPercentage}%
                    </span>
                    <span className="mx-1">→</span>
                    <span className="font-medium">{decision.supportPercentage}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <VoteBarCompact votes={decision.votes} className="w-full max-w-[180px]" />
                  {!decision.isClosed && <TrendIndicator trend={decision.trend} compact />}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {t('timeline.terminal.support', { defaultValue: 'Support' })}:{' '}
                    {decision.votes.support}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {t('timeline.terminal.oppose', { defaultValue: 'Oppose' })}:{' '}
                    {decision.votes.oppose}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    {t('timeline.terminal.abstain', { defaultValue: 'Abstain' })}:{' '}
                    {decision.votes.abstain}
                  </span>
                </div>
              </>
            )}
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
