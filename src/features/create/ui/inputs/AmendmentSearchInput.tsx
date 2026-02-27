import { TypeAheadSelect } from '@/components/ui/type-ahead-select'
import { AmendmentSelectCard } from '@/components/ui/entity-select-cards'
import { useAllAmendments } from '@/zero/events/useEventState'
import { Label } from '@/components/ui/label'

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

  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeAheadSelect
        items={amendments ?? []}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchKeys={['title']}
        renderItem={(amendment: any) => <AmendmentSelectCard amendment={amendment} />}
        getItemId={(amendment: any) => amendment.id}
      />
    </div>
  )
}
