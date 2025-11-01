'use client';

import { Button } from '@/components/ui/button';

export const RIGHT_TYPES = [
  'informationRight',
  'amendmentRight',
  'rightToSpeak',
  'activeVotingRight',
  'passiveVotingRight',
] as const;

export type RightType = (typeof RIGHT_TYPES)[number];

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
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold">Filter nach Rechten:</h3>
      <div className="flex flex-wrap gap-2">
        {RIGHT_TYPES.map(right => (
          <Button
            key={right}
            size="sm"
            variant={selectedRights.has(right) ? 'default' : 'outline'}
            onClick={() => onToggleRight(right)}
            className="text-xs"
          >
            {getRightLabel(right)}
          </Button>
        ))}
      </div>
    </div>
  );
}
