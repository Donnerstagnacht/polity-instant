'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/features/shared/ui/ui/tooltip';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import { VotePhaseBadge } from './VotePhaseBadge';
import type { VotingPhase } from '../logic/votePhaseHelpers';

// ─── Types ───────────────────────────────────────────────────────────

export interface VoteBarOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Tailwind bg class for the solid (final) bar */
  color: string;
  /** Tailwind bg class for the lighter (indication) bar */
  lightColor: string;
  finalCount: number;
  finalPercent: number;
  indicationCount: number;
  indicationPercent: number;
}

interface VoteResultsDisplayProps {
  options: VoteBarOption[];
  phase: VotingPhase;
  totalFinal: number;
  totalIndication: number;
  totalEligible?: number;
  openedAt?: string;
  closedAt?: string;
  className?: string;
}

// ─── Internal bar row ────────────────────────────────────────────────

function BarRow({
  percent,
  count,
  total,
  barClass,
  suffix,
  tooltipLabel,
}: {
  percent: number;
  count: number;
  total: number;
  barClass: string;
  suffix?: string;
  tooltipLabel: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full transition-all', barClass)}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="min-w-[60px] text-right text-xs text-muted-foreground">
            {count} ({percent.toFixed(0)}%){suffix}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {tooltipLabel}: {count} / {total}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

/**
 * Reusable grouped horizontal bar chart for vote results.
 *
 * For elections: one set of bars per candidate (indication + final).
 * For amendment votes: 3 sets (yes/no/abstain, each with indication + final bar).
 *
 * Includes:
 * - Phase badge
 * - Total summary (eligible / voted / share)
 * - Opening/closing dates when available
 */
export function VoteResultsDisplay({
  options,
  phase,
  totalFinal,
  totalIndication,
  totalEligible,
  openedAt,
  closedAt,
  className,
}: VoteResultsDisplayProps) {
  const { t } = useTranslation();

  const showBoth = phase !== 'indication' && totalIndication > 0;
  const isIndicationPhase = phase === 'indication';

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {/* Phase badge + totals header */}
        <div className="flex items-center justify-between">
          <VotePhaseBadge phase={phase} />
          <span className="text-xs text-muted-foreground">
            {isIndicationPhase
              ? `${totalIndication} ${t('features.events.agenda.indicationVotes', 'indications')}`
              : `${totalFinal} ${t('features.events.agenda.votes', 'votes')}`}
          </span>
        </div>

        {/* Bar chart per option */}
        {options.map((option) => (
          <div key={option.key} className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              {option.icon}
              <span>{option.label}</span>
            </div>

            <div className="space-y-1 pl-1">
              {/* Final bar */}
              {(!isIndicationPhase || showBoth) && (
                <div className="flex items-center gap-1">
                  <span className="w-16 text-[10px] text-muted-foreground">
                    {t('features.events.agenda.actualShort', 'Final')}
                  </span>
                  <div className="flex-1">
                    <BarRow
                      percent={option.finalPercent}
                      count={option.finalCount}
                      total={totalFinal}
                      barClass={option.color}
                      tooltipLabel={t('features.events.agenda.actual', 'Final')}
                    />
                  </div>
                </div>
              )}
              {/* Indication bar */}
              {(isIndicationPhase || showBoth) && (
                <div className="flex items-center gap-1">
                  <span className="w-16 text-[10px] text-muted-foreground">
                    {t('features.events.agenda.indicationShort', 'Indic.')}
                  </span>
                  <div className="flex-1">
                    <BarRow
                      percent={option.indicationPercent}
                      count={option.indicationCount}
                      total={totalIndication}
                      barClass={option.lightColor}
                      suffix=" *"
                      tooltipLabel={t('features.events.agenda.indication', 'Indication')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {totalFinal === 0 && totalIndication === 0 && (
          <div className="text-xs text-muted-foreground">
            {t('features.events.agenda.noVotesYet', 'No votes yet')}
          </div>
        )}

        {/* Summary row */}
        {totalEligible !== undefined && totalEligible > 0 && (
          <div className="flex justify-between border-t pt-2 text-xs text-muted-foreground">
            <span>
              {t('features.events.voting.eligible', 'Eligible')}: {totalEligible}
            </span>
            <span>
              {t('features.events.voting.voted', 'Voted')}:{' '}
              {isIndicationPhase ? totalIndication : totalFinal}
            </span>
            <span>
              {t('features.events.voting.share', 'Share')}:{' '}
              {Math.round(
                ((isIndicationPhase ? totalIndication : totalFinal) / totalEligible) * 100,
              )}
              %
            </span>
          </div>
        )}

        {/* Dates */}
        {(openedAt || closedAt) && (
          <div className="flex justify-between text-xs text-muted-foreground">
            {openedAt && <span>{t('features.events.voting.opened', 'Opened')}: {openedAt}</span>}
            {closedAt && <span>{t('features.events.voting.closed', 'Closed')}: {closedAt}</span>}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
