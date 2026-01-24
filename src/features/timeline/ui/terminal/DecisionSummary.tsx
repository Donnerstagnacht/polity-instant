'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, FileText, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';

export interface DecisionSummarySection {
  type: 'summary' | 'problem' | 'proposal' | 'impact' | 'background';
  title: string;
  content: string;
  isCollapsed?: boolean;
}

export interface DecisionSummaryProps {
  sections: DecisionSummarySection[];
  /** Default collapsed state for all sections */
  defaultCollapsed?: boolean;
  /** Maximum height before showing "read more" */
  maxContentHeight?: number;
  className?: string;
}

const SECTION_ICONS: Record<
  DecisionSummarySection['type'],
  React.ComponentType<{ className?: string }>
> = {
  summary: FileText,
  problem: AlertCircle,
  proposal: Lightbulb,
  impact: AlertCircle,
  background: FileText,
};

const SECTION_COLORS: Record<DecisionSummarySection['type'], string> = {
  summary: 'text-blue-600 dark:text-blue-400',
  problem: 'text-red-600 dark:text-red-400',
  proposal: 'text-green-600 dark:text-green-400',
  impact: 'text-amber-600 dark:text-amber-400',
  background: 'text-gray-600 dark:text-gray-400',
};

interface CollapsibleSectionProps {
  section: DecisionSummarySection;
  isCollapsed: boolean;
  onToggle: () => void;
  maxContentHeight: number;
}

function CollapsibleSection({
  section,
  isCollapsed,
  onToggle,
  maxContentHeight,
}: CollapsibleSectionProps) {
  const { t } = useTranslation();
  const Icon = SECTION_ICONS[section.type];
  const colorClass = SECTION_COLORS[section.type];
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [needsCollapse, setNeedsCollapse] = React.useState(false);

  React.useEffect(() => {
    if (contentRef.current) {
      setNeedsCollapse(contentRef.current.scrollHeight > maxContentHeight);
    }
  }, [section.content, maxContentHeight]);

  return (
    <div className="border-b border-gray-200 last:border-b-0 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', colorClass)} />
          <span className="text-sm font-medium">{section.title}</span>
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        )}
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isCollapsed ? 'max-h-0' : needsCollapse ? 'max-h-[500px]' : 'max-h-[2000px]'
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            'px-3 pb-3 text-sm text-gray-600 dark:text-gray-300',
            isCollapsed ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            maxHeight: isCollapsed ? 0 : needsCollapse && isCollapsed ? maxContentHeight : 'none',
            overflow: 'hidden',
          }}
        >
          {section.content}
        </div>
      </div>
    </div>
  );
}

/**
 * DecisionSummary - Collapsible sections for decision details
 *
 * Shows summary, problem statement, proposal, impact, and background
 * sections with expand/collapse functionality.
 */
export function DecisionSummary({
  sections,
  defaultCollapsed = false,
  maxContentHeight = 150,
  className,
}: DecisionSummaryProps) {
  const { t } = useTranslation();
  const [collapsedSections, setCollapsedSections] = React.useState<Set<number>>(() => {
    if (defaultCollapsed) {
      return new Set(sections.map((_, i) => i));
    }
    // By default, only first section is expanded
    return new Set(sections.slice(1).map((_, i) => i + 1));
  });

  const toggleSection = React.useCallback((index: number) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const expandAll = React.useCallback(() => {
    setCollapsedSections(new Set());
  }, []);

  const collapseAll = React.useCallback(() => {
    setCollapsedSections(new Set(sections.map((_, i) => i)));
  }, [sections]);

  const allCollapsed = collapsedSections.size === sections.length;
  const allExpanded = collapsedSections.size === 0;

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header with expand/collapse all */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t('features.timeline.terminal.details')}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            disabled={allExpanded}
            className="h-6 px-2 text-xs"
          >
            {t('features.timeline.terminal.expandAll')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            disabled={allCollapsed}
            className="h-6 px-2 text-xs"
          >
            {t('features.timeline.terminal.collapseAll')}
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div>
        {sections.map((section, index) => (
          <CollapsibleSection
            key={`${section.type}-${index}`}
            section={section}
            isCollapsed={collapsedSections.has(index)}
            onToggle={() => toggleSection(index)}
            maxContentHeight={maxContentHeight}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * DecisionSummaryCompact - Single line summary with expand
 */
export function DecisionSummaryCompact({
  summary,
  className,
}: {
  summary: string;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className={cn('text-sm', className)}>
      <p
        className={cn(
          'text-gray-600 transition-all dark:text-gray-300',
          !isExpanded && 'line-clamp-2'
        )}
      >
        {summary}
      </p>
      {summary.length > 150 && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 text-xs"
        >
          {isExpanded
            ? t('features.timeline.terminal.showLess')
            : t('features.timeline.terminal.readMore')}
        </Button>
      )}
    </div>
  );
}
