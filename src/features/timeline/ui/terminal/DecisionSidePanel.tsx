'use client';

import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, ThumbsUp, ThumbsDown, MessageSquare, ExternalLink, Vote, Award } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { StatusBadge, type DecisionStatus } from './StatusBadge';
import { CountdownTimer } from './CountdownTimer';
import { VoteProgressBar } from './VoteProgressBar';
import { TrendIndicator } from './TrendIndicator';
import { ResultBadge } from './ResultBadge';
import type { DecisionItem } from './types';

export interface DecisionSidePanelProps {
  decision: DecisionItem;
  onClose: () => void;
  className?: string;
}

/**
 * Side panel showing full decision details
 * Slides in from right, doesn't navigate away
 */
export function DecisionSidePanel({ decision, onClose, className }: DecisionSidePanelProps) {
  const { t } = useTranslation();
  const Icon = decision.type === 'vote' ? Vote : Award;

  return (
    <div
      className={cn(
        'flex w-[400px] flex-col border-l border-gray-200 bg-card dark:border-gray-700',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <a href={decision.href} className="font-mono text-sm font-semibold hover:underline">
            {decision.id}
          </a>
          {decision.isClosed ? (
            <ResultBadge
              result={decision.status as 'passed' | 'failed' | 'tied' | 'elected'}
              winnerName={decision.winnerName}
            />
          ) : (
            <StatusBadge status={decision.status as DecisionStatus} />
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Title */}
          <div className="space-y-1">
            <a href={decision.href} className="text-lg font-semibold hover:underline">
              {decision.title}
            </a>
            {decision.entity && (
              <a
                href={decision.entity.href}
                className="text-sm text-muted-foreground hover:underline"
              >
                {decision.entity.name}
              </a>
            )}
            {decision.agendaItem && (
              <a
                href={decision.agendaItem.href}
                className="text-sm text-muted-foreground hover:underline"
              >
                {decision.agendaItem.name}
              </a>
            )}
          </div>

          {/* Vote progress bar */}
          {decision.votes && (
            <div className="space-y-2">
              {/* Indication phase display */}
              {decision.isIndicationPhase && decision.indicationVotes ? (
                <>
                  <div className="text-xs text-blue-500">
                    * {t('timeline.terminal.indicationOnly', { defaultValue: 'Indication only' })}
                  </div>
                  <VoteProgressBar votes={decision.indicationVotes} showLabels showPercentages />
                </>
              ) : (
                <>
                  {/* Show indication comparison if available */}
                  {decision.indicationVotes && !decision.isIndicationPhase && (
                    <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-950/30">
                      <div className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {t('timeline.terminal.indicationComparison', {
                          defaultValue: 'Indication vs Actual',
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-500">
                          {t('timeline.terminal.indication', { defaultValue: 'Ind' })}:{' '}
                          {decision.indicationSupportPercentage}%
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">
                          {t('timeline.terminal.actual', { defaultValue: 'Act' })}:{' '}
                          {decision.supportPercentage}%
                        </span>
                      </div>
                    </div>
                  )}
                  <VoteProgressBar votes={decision.votes} showLabels showPercentages />
                </>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Time */}
            <div className="space-y-1">
              <span className="text-xs uppercase text-muted-foreground">
                {decision.isClosed
                  ? t('timeline.terminal.ended')
                  : t('timeline.terminal.timeRemaining')}
              </span>
              {!decision.isClosed ? (
                <CountdownTimer endsAt={decision.endsAt} />
              ) : (
                <span className="block text-sm">
                  {new Date(decision.endsAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Turnout */}
            {decision.votedCount !== undefined && decision.totalMembers !== undefined && (
              <div className="space-y-1">
                <span className="text-xs uppercase text-muted-foreground">
                  {t('timeline.terminal.turnout')}
                </span>
                <span className="block font-medium">
                  {decision.votedCount} / {decision.totalMembers}{' '}
                  <span className="text-muted-foreground">({decision.turnout}%)</span>
                </span>
              </div>
            )}

            {/* Trend */}
            {!decision.isClosed && (
              <div className="space-y-1">
                <span className="text-xs uppercase text-muted-foreground">
                  {t('timeline.terminal.trend')}
                </span>
                <TrendIndicator trend={decision.trend} />
              </div>
            )}
          </div>

          <Separator />

          {/* Summary */}
          {decision.summary && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                📋 {t('timeline.terminal.summary')}
              </h3>
              <p className="text-sm text-muted-foreground">{decision.summary}</p>
            </div>
          )}

          {/* Problem */}
          {decision.problem && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                🔍 {t('timeline.terminal.problem')}
              </h3>
              <p className="text-sm text-muted-foreground">{decision.problem}</p>
            </div>
          )}

          {/* Proposal */}
          {decision.proposal && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                💡 {t('timeline.terminal.proposal')}
              </h3>
              <p className="text-sm text-muted-foreground">{decision.proposal}</p>
            </div>
          )}

          {/* Candidates (for elections) */}
          {decision.candidates && decision.candidates.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                {t('timeline.terminal.candidates')} ({decision.candidates.length})
              </h3>
              {decision.isIndicationPhase && (
                <div className="text-xs text-blue-500">
                  * {t('timeline.terminal.indicationOnly', { defaultValue: 'Indication only' })}
                </div>
              )}
              <div className="space-y-2">
                {decision.candidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className={cn(
                      'flex items-center gap-3 rounded-md border p-2',
                      candidate.isWinner &&
                        'border-yellow-500 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950/30'
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="flex-1">
                      <span className="font-medium">{candidate.name}</span>
                      {candidate.isWinner && (
                        <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                          👑 {t('timeline.terminal.winner')}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {/* Show indication or actual votes */}
                      {decision.isIndicationPhase && candidate.indicationVotes !== undefined ? (
                        <span className="font-mono text-xs text-blue-500">
                          {candidate.indicationVotes} * ({candidate.indicationPercentage}%)
                        </span>
                      ) : (
                        <>
                          {candidate.indicationPercentage !== undefined &&
                            !decision.isIndicationPhase && (
                              <span className="mr-1 text-[10px] text-blue-400">
                                {candidate.indicationPercentage}% →
                              </span>
                            )}
                          {candidate.votes !== undefined && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {candidate.votes} {t('timeline.terminal.votes')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {!decision.isClosed && (
            <>
              <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                <ThumbsUp className="h-4 w-4" />
                {t('timeline.terminal.voteSupport')}
              </Button>
              <Button variant="destructive" className="flex-1 gap-2">
                <ThumbsDown className="h-4 w-4" />
                {t('timeline.terminal.voteOppose')}
              </Button>
            </>
          )}
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('timeline.terminal.discuss')}
          </Button>
        </div>

        <Button variant="ghost" className="mt-2 w-full gap-2" asChild>
          <a href={decision.href}>
            <ExternalLink className="h-4 w-4" />
            {t('timeline.terminal.viewFullDocument')}
          </a>
        </Button>
      </div>
    </div>
  );
}
