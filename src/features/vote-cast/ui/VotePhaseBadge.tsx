'use client';

import { Badge } from '@/features/shared/ui/ui/badge';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import type { VotingPhase } from '../logic/votePhaseHelpers';

interface VotePhaseBadgeProps {
  phase: VotingPhase;
  className?: string;
}

/**
 * Badge displaying the current voting phase.
 *
 * - "Indication" — neutral / secondary
 * - "Final Vote" — blinking primary
 * - "Closed" — green outline
 * - "Aborted" — red outline (if result is aborted, handled via variant override)
 */
export function VotePhaseBadge({ phase, className }: VotePhaseBadgeProps) {
  const { t } = useTranslation();

  switch (phase) {
    case 'indication':
      return (
        <Badge variant="secondary" className={cn('text-xs', className)}>
          {t('features.events.voting.phases.indication', 'Indication')}
        </Badge>
      );
    case 'final_vote':
      return (
        <Badge variant="default" className={cn('animate-pulse border-green-500 bg-green-600 text-xs text-white hover:bg-green-700', className)}>
          {t('features.events.voting.phases.finalVote', 'Final Vote')}
        </Badge>
      );
    case 'closed':
      return (
        <Badge
          variant="outline"
          className={cn('border-green-500 text-xs text-green-600', className)}
        >
          {t('features.events.voting.phases.closed', 'Closed')}
        </Badge>
      );
  }
}
