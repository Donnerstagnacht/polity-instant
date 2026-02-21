'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

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
        {RIGHT_TYPES.map(right => (
          <Button
            key={right}
            size="sm"
            variant={selectedRights.has(right) ? 'default' : 'outline'}
            onClick={() => onToggleRight(right)}
            className="text-xs"
          >
            {getTranslatedRightLabel(right)}
          </Button>
        ))}
      </div>
    </div>
  );
}
