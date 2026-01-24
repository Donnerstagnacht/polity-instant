'use client';

import { Pin, Telescope, Monitor } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { TimelineMode } from '../hooks/useTimelineMode';

export interface TimelineModeToggleProps {
  /** Current active mode */
  mode: TimelineMode;
  /** Callback when mode changes */
  onModeChange: (mode: TimelineMode) => void;
  /** Badge count for Following tab (unread count) */
  followingBadge?: number;
  /** Badge count for Decisions tab (urgent votes/elections) */
  decisionsBadge?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Mode configuration with icons and colors
 */
const MODE_CONFIG: Record<
  TimelineMode,
  {
    icon: React.ElementType;
    labelKey: string;
    activeClass: string;
    hoverClass: string;
  }
> = {
  subscribed: {
    icon: Pin,
    labelKey: 'features.timeline.modes.following',
    activeClass: 'bg-primary text-primary-foreground',
    hoverClass: 'hover:bg-primary/10',
  },
  decisions: {
    icon: Monitor,
    labelKey: 'features.timeline.modes.decisions',
    activeClass: 'bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900',
    hoverClass: 'hover:bg-slate-100 dark:hover:bg-slate-800',
  },
};

/**
 * TimelineModeToggle - Two-tab mode selector for timeline
 *
 * Displays tabs for:
 * - 📌 Following: Content from subscribed entities
 * - 🖥️ Decisions: Bloomberg-style terminal for votes/elections
 *
 * Features:
 * - Badge on Following showing unread count
 * - Badge on Decisions showing urgent vote count (red)
 * - Decisions tab has distinct darker styling
 * - Smooth transition animation between modes
 */
export function TimelineModeToggle({
  mode,
  onModeChange,
  followingBadge,
  decisionsBadge,
  className,
}: TimelineModeToggleProps) {
  const { t } = useTranslation();

  const modes: TimelineMode[] = ['subscribed', 'decisions'];

  return (
    <div
      className={cn('inline-flex items-center gap-1 rounded-lg border bg-muted/50 p-1', className)}
      role="tablist"
      aria-label="Timeline mode"
    >
      {modes.map(m => {
        const config = MODE_CONFIG[m];
        const Icon = config.icon;
        const isActive = mode === m;
        const badgeCount =
          m === 'subscribed' ? followingBadge : m === 'decisions' ? decisionsBadge : undefined;
        const showBadge = badgeCount !== undefined && badgeCount > 0;

        return (
          <button
            key={m}
            role="tab"
            aria-selected={isActive}
            aria-controls={`timeline-panel-${m}`}
            onClick={() => onModeChange(m)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
              isActive ? config.activeClass : cn('text-muted-foreground', config.hoverClass),
              m === 'decisions' && !isActive && 'font-mono text-xs tracking-tight'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t(config.labelKey)}</span>

            {/* Badge */}
            {showBadge && (
              <Badge
                variant={m === 'decisions' ? 'destructive' : 'secondary'}
                className={cn(
                  'ml-1 h-5 min-w-[20px] px-1.5 text-xs',
                  isActive &&
                    m !== 'decisions' &&
                    'bg-primary-foreground/20 text-primary-foreground'
                )}
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </Badge>
            )}

            {/* Urgent indicator for decisions */}
            {m === 'decisions' &&
              decisionsBadge !== undefined &&
              decisionsBadge > 0 &&
              !isActive && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
              )}
          </button>
        );
      })}
    </div>
  );
}

export default TimelineModeToggle;
