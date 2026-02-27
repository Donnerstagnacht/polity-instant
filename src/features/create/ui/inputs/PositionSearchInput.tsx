import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { PositionSelectCard } from '@/components/ui/entity-select-cards';
import { usePositionsWithGroups } from '@/zero/events/useEventState';
import { Label } from '@/components/ui/label';

interface PositionSearchInputProps {
  value: string;
  onChange: (positionId: string) => void;
  label?: string;
  placeholder?: string;
}

export function PositionSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search for a position...',
}: PositionSearchInputProps) {
  const { positions } = usePositionsWithGroups();

  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeAheadSelect
        items={positions ?? []}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchKeys={['title', 'description']}
        renderItem={(position: any) => <PositionSelectCard position={position} />}
        getItemId={(position: any) => position.id}
      />
    </div>
  );
}
