import { TypeAheadSelect } from '@/features/shared/ui/ui/type-ahead-select'
import { GroupSelectCard } from '@/features/shared/ui/ui/entity-select-cards'
import { useAllGroups } from '@/zero/groups/useGroupState'
import { Label } from '@/features/shared/ui/ui/label'

interface GroupSearchInputProps {
  value: string
  onChange: (groupId: string) => void
  label?: string
  placeholder?: string
  /** Optional filter: only show groups where this user is a member */
  filterByUserId?: string
}

export function GroupSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search for a group...',
}: GroupSearchInputProps) {
  const { groups } = useAllGroups()

  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeAheadSelect
        items={groups}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchKeys={['name', 'description']}
        renderItem={(group) => <GroupSelectCard group={group} />}
        getItemId={(group) => group.id}
      />
    </div>
  )
}
