'use client';

import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';
import { DecisionRow } from './DecisionRow';
import type { DecisionItem } from './types';

export interface DecisionTableProps {
  decisions: DecisionItem[];
  onRowClick: (decision: DecisionItem) => void;
  selectedId?: string;
  className?: string;
}

/**
 * Decision table for terminal view
 * Sortable columns, fixed header, scrollable body
 */
export function DecisionTable({
  decisions,
  onRowClick,
  selectedId,
  className,
}: DecisionTableProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      {/* Table header */}
      <div className="sticky top-0 z-10 min-w-[920px] bg-muted/95 backdrop-blur">
        <div className="grid grid-cols-[70px_0.9fr_140px_100px_80px_180px_80px] gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          <div className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {t('timeline.terminal.columns.id')}
          </div>
          <div className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {t('timeline.terminal.columns.title')}
          </div>
          <div className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {t('timeline.terminal.columns.body')}
          </div>
          <div className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {t('timeline.terminal.columns.time')}
          </div>
          <div className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {t('timeline.terminal.columns.status')}
          </div>
          <div className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {t('timeline.terminal.columns.votes', { defaultValue: 'Votes' })}
          </div>
          <div className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {t('timeline.terminal.columns.trend')}
          </div>
        </div>
      </div>

      {/* Table body */}
      <div className="min-w-[920px] divide-y divide-gray-100 dark:divide-gray-800">
        {decisions.map(decision => (
          <DecisionRow
            key={decision.id}
            decision={decision}
            onClick={() => onRowClick(decision)}
            isSelected={selectedId === decision.id}
          />
        ))}
      </div>
    </div>
  );
}
