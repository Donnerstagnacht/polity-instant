'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/features/shared/ui/ui/tooltip';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';

export interface VoteOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Tailwind bg class for the solid (final) bar, e.g. "bg-green-500" */
  color: string;
  /** Tailwind bg class for the lighter (indication) bar, e.g. "bg-green-300/60" */
  lightColor: string;
  finalCount: number;
  finalPercent: number;
  indicationCount: number;
  indicationPercent: number;
}

interface GroupedVoteResultBarProps {
  options: VoteOption[];
  isIndicationPhase: boolean;
  showBoth: boolean;
  totalFinal: number;
  totalIndication: number;
  className?: string;
}

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

export function GroupedVoteResultBar({
  options,
  isIndicationPhase,
  showBoth,
  totalFinal,
  totalIndication,
  className,
}: GroupedVoteResultBarProps) {
  const { t } = useTranslation();

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {options.map((option) => (
          <div key={option.key} className="space-y-1.5">
            {/* Option label */}
            <div className="flex items-center gap-1.5 text-sm font-medium">
              {option.icon}
              <span>{option.label}</span>
            </div>

            {/* Bars */}
            <div className="space-y-1 pl-1">
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'w-16 text-[10px]',
                    isIndicationPhase ? 'text-muted-foreground/70' : 'text-muted-foreground'
                  )}
                >
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
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'w-16 text-[10px]',
                    !showBoth && !isIndicationPhase
                      ? 'text-muted-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
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
            </div>
          </div>
        ))}
        {totalFinal === 0 && totalIndication === 0 && (
          <div className="text-xs text-muted-foreground">
            {t('features.events.agenda.noVotesYet', 'No votes yet')}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
