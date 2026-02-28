'use client';

import { Button } from '@/features/shared/ui/ui/button';
import { cn } from '@/features/shared/utils/utils';
import { useTranslation } from '@/features/shared/hooks/use-translation';

export const RIGHT_TYPES = [
  'informationRight',
  'amendmentRight',
  'rightToSpeak',
  'activeVotingRight',
  'passiveVotingRight',
] as const;

export type RightType = (typeof RIGHT_TYPES)[number];

// Translation keys mapping
const RIGHT_TRANSLATION_KEYS: Record<RightType, string> = {
  informationRight: 'common.rights.information',
  amendmentRight: 'common.rights.amendment',
  rightToSpeak: 'common.rights.speak',
  activeVotingRight: 'common.rights.activeVoting',
  passiveVotingRight: 'common.rights.passiveVoting',
};

// Fallback labels (used for non-hook contexts)
export const RIGHT_LABELS: Record<RightType, string> = {
  informationRight: 'Info',
  amendmentRight: 'Antrag',
  rightToSpeak: 'Rede',
  activeVotingRight: 'Aktiv',
  passiveVotingRight: 'Passiv',
};

export function formatRights(rights: string[]): string {
  return rights.map(r => RIGHT_LABELS[r as RightType] || r).join(', ');
}

export function getRightLabel(right: string): string {
  return RIGHT_LABELS[right as RightType] || right;
}

export function isEdgeVisible(edgeRights: string[], selectedRights: Set<string>): boolean {
  return edgeRights.some(right => selectedRights.has(right));
}

/** Deterministic gradient classes for each right type — shared with RightBadge */
export const RIGHT_GRADIENTS: Record<RightType, string> = {
  informationRight:
    'bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-700 dark:to-cyan-600',
  amendmentRight:
    'bg-gradient-to-r from-violet-500 to-purple-400 dark:from-violet-700 dark:to-purple-600',
  rightToSpeak:
    'bg-gradient-to-r from-teal-500 to-emerald-400 dark:from-teal-700 dark:to-emerald-600',
  activeVotingRight:
    'bg-gradient-to-r from-orange-500 to-red-400 dark:from-orange-700 dark:to-red-600',
  passiveVotingRight:
    'bg-gradient-to-r from-pink-500 to-rose-400 dark:from-pink-700 dark:to-rose-600',
};

interface RightFiltersProps {
  selectedRights: Set<string>;
  onToggleRight: (right: string) => void;
}

export function RightFilters({ selectedRights, onToggleRight }: RightFiltersProps) {
  const { t } = useTranslation();
  
  const getTranslatedRightLabel = (right: RightType): string => {
    return t(RIGHT_TRANSLATION_KEYS[right]) || RIGHT_LABELS[right];
  };

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold">{t('common.labels.filterByRights')}:</h3>
      <div className="flex flex-wrap gap-2">
        {RIGHT_TYPES.map(right => {
          const isActive = selectedRights.has(right);
          return (
            <Button
              key={right}
              size="sm"
              variant="outline"
              onClick={() => onToggleRight(right)}
              className={cn(
                'text-xs',
                isActive && RIGHT_GRADIENTS[right],
                isActive && 'border-0 text-white hover:text-white'
              )}
            >
              {getTranslatedRightLabel(right)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
