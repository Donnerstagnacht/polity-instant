import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch'
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems'
import { useAllAmendments } from '@/zero/events/useEventState'
import { Label } from '@/features/shared/ui/ui/label'
import { useMemo } from 'react'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'

interface AmendmentSearchInputProps {
  value: string
  onChange: (amendmentId: string) => void
  label?: string
  placeholder?: string
}

export function AmendmentSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search for an amendment...',
}: AmendmentSearchInputProps) {
  const { amendments } = useAllAmendments()

  const items = useMemo(
    () =>
      toTypeaheadItems(
        amendments ?? [],
        'amendment',
        (a: any) => a.title || 'Amendment',
      ),
    [amendments],
  )

  const handleChange = (item: TypeaheadItem | null) => {
    onChange(item?.id ?? '')
  }

  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeaheadSearch
        items={items}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  )
}
