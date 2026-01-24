'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';
import { TerminalHeader, type TerminalFilter } from './TerminalHeader';
import { DecisionTable } from './DecisionTable';
import { DecisionSidePanel } from './DecisionSidePanel';
import { MobileDecisionCard } from './MobileDecisionCard';
import type { DecisionItem } from './types';

export interface DecisionTerminalProps {
  decisions: DecisionItem[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Decision Terminal - Bloomberg-style view for active votes and elections
 * Shows all open decisions with real-time updates, countdowns, and trends
 */
export function DecisionTerminal({
  decisions,
  isLoading = false,
  className,
}: DecisionTerminalProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<TerminalFilter>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<DecisionItem | null>(null);

  // Filter decisions based on active filter and search
  const filteredDecisions = useMemo(() => {
    let filtered = [...decisions];

    // Apply filter
    switch (activeFilter) {
      case 'live':
        filtered = filtered.filter(d => !d.isClosed);
        break;
      case 'closing_soon':
        filtered = filtered.filter(d => !d.isClosed && d.isClosingSoon);
        break;
      case 'recently_closed':
        filtered = filtered.filter(d => d.isClosed);
        break;
      case 'all':
      default:
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.title.toLowerCase().includes(query) ||
          d.body.toLowerCase().includes(query) ||
          d.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [decisions, activeFilter, searchQuery]);

  // Calculate counts
  const urgentCount = decisions.filter(d => !d.isClosed && d.isUrgent).length;
  const activeCount = decisions.filter(d => !d.isClosed).length;

  // Handle row click
  const handleRowClick = (decision: DecisionItem) => {
    setSelectedDecision(decision);
  };

  // Close side panel
  const handleCloseSidePanel = () => {
    setSelectedDecision(null);
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-card dark:border-gray-700',
        className
      )}
    >
      {/* Terminal Header */}
      <TerminalHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        urgentCount={urgentCount}
        activeCount={activeCount}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table (desktop) or Cards (mobile) */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <TerminalLoadingSkeleton />
          ) : filteredDecisions.length === 0 ? (
            <TerminalEmptyState filter={activeFilter} />
          ) : (
            <>
              {/* Desktop: Table view */}
              <div className="hidden lg:block">
                <DecisionTable
                  decisions={filteredDecisions}
                  onRowClick={handleRowClick}
                  selectedId={selectedDecision?.id}
                />
              </div>

              {/* Mobile: Card view */}
              <div className="block space-y-3 p-4 lg:hidden">
                {filteredDecisions.map(decision => (
                  <MobileDecisionCard
                    key={decision.id}
                    decision={decision}
                    onClick={() => handleRowClick(decision)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Side panel for details */}
        {selectedDecision && (
          <DecisionSidePanel decision={selectedDecision} onClose={handleCloseSidePanel} />
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for terminal
 */
function TerminalLoadingSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex h-12 animate-pulse items-center gap-4 rounded border border-gray-100 bg-gray-50 px-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state for terminal
 */
function TerminalEmptyState({ filter }: { filter: TerminalFilter }) {
  const { t } = useTranslation();

  const messages: Record<TerminalFilter, string> = {
    live: t('timeline.terminal.empty.live'),
    closing_soon: t('timeline.terminal.empty.closingSoon'),
    recently_closed: t('timeline.terminal.empty.recentlyClosed'),
    all: t('timeline.terminal.empty.all'),
  };

  return (
    <div className="flex h-64 flex-col items-center justify-center text-center">
      <span className="mb-2 text-4xl">📊</span>
      <p className="text-muted-foreground">{messages[filter]}</p>
    </div>
  );
}
