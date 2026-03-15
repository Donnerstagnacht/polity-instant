'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/features/shared/ui/ui/button';
import { Panel } from '@/features/network/ui/NetworkFlowBase';
import { RightFilters } from '@/features/network/ui/RightFilters';

export interface NetworkLegendItem {
  id: string;
  label: string;
  swatchClassName: string;
}

interface NetworkControlPanelProps {
  title: string;
  description?: string;
  panelCollapsed: boolean;
  onPanelCollapsedChange: (collapsed: boolean) => void;
  legendCollapsed: boolean;
  onLegendCollapsedChange: (collapsed: boolean) => void;
  legendItems: readonly NetworkLegendItem[];
  legendTitle?: string;
  showGroupTypeLegend?: boolean;
  baseGroupLabel?: string;
  hierarchicalGroupLabel?: string;
  showDisplayControls?: boolean;
  showInteractiveToggle?: boolean;
  showIndirect?: boolean;
  onShowIndirectChange?: (showIndirect: boolean) => void;
  isInteractive: boolean;
  onInteractiveChange: (isInteractive: boolean) => void;
  directLabel?: string;
  indirectLabel?: string;
  lockLabel?: string;
  unlockLabel?: string;
  showRightsFilter?: boolean;
  selectedRights?: Set<string>;
  onToggleRight?: (right: string) => void;
  filterRight?: string;
  filteredByPrefix?: string;
}

export function NetworkControlPanel({
  title,
  description,
  panelCollapsed,
  onPanelCollapsedChange,
  legendCollapsed,
  onLegendCollapsedChange,
  legendItems,
  legendTitle = 'Legend',
  showGroupTypeLegend = false,
  baseGroupLabel = '◉ Base group',
  hierarchicalGroupLabel = '🏛 Hierarchical group',
  showDisplayControls = true,
  showInteractiveToggle = true,
  showIndirect = false,
  onShowIndirectChange,
  isInteractive,
  onInteractiveChange,
  directLabel = 'Direct',
  indirectLabel = 'Indirect',
  lockLabel = 'Lock Editor',
  unlockLabel = 'Unlock Editor',
  showRightsFilter = false,
  selectedRights,
  onToggleRight,
  filterRight,
  filteredByPrefix = 'Filtered by',
}: NetworkControlPanelProps) {
  const canRenderRightFilter = showRightsFilter && !filterRight && selectedRights && onToggleRight;

  return (
    <Panel position="top-left" className="rounded bg-white p-4 shadow dark:bg-background">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPanelCollapsedChange(!panelCollapsed)}
          className="h-6 w-6 p-0"
        >
          {panelCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!panelCollapsed && (
        <>
          {description ? <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{description}</p> : null}

          <div className="flex flex-wrap gap-2">
            {showDisplayControls && isInteractive && onShowIndirectChange ? (
              <>
                <Button
                  size="sm"
                  variant={!showIndirect ? 'default' : 'outline'}
                  onClick={() => onShowIndirectChange(false)}
                >
                  {directLabel}
                </Button>
                <Button
                  size="sm"
                  variant={showIndirect ? 'default' : 'outline'}
                  onClick={() => onShowIndirectChange(true)}
                >
                  {indirectLabel}
                </Button>
              </>
            ) : null}

            {showInteractiveToggle ? (
              <Button
                size="sm"
                variant={isInteractive ? 'outline' : 'default'}
                onClick={() => onInteractiveChange(!isInteractive)}
              >
                {isInteractive ? lockLabel : unlockLabel}
              </Button>
            ) : null}
          </div>

          {canRenderRightFilter ? (
            <RightFilters selectedRights={selectedRights} onToggleRight={onToggleRight} />
          ) : null}

          {filterRight ? (
            <div className="mt-3 rounded-md bg-blue-50 p-2 text-sm dark:bg-blue-950/20">
              <span className="font-medium">{filteredByPrefix}:</span>{' '}
              <span className="text-blue-700 dark:text-blue-300">{filterRight.replace('Right', '')}</span>
            </div>
          ) : null}

          <div className="mt-3">
            <button
              onClick={() => onLegendCollapsedChange(!legendCollapsed)}
              className="flex w-full items-center justify-between text-sm font-medium hover:text-primary"
            >
              <span>{legendTitle}</span>
              {legendCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
            {!legendCollapsed && (
              <div className="mt-2 space-y-2 text-sm">
                {legendItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className={item.swatchClassName}></div>
                    <span>{item.label}</span>
                  </div>
                ))}

                {showGroupTypeLegend ? (
                  <>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border-2 border-solid border-gray-400 bg-gray-100"></div>
                      <span>{baseGroupLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border-2 border-dashed border-gray-400 bg-gray-100"></div>
                      <span>{hierarchicalGroupLabel}</span>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}
