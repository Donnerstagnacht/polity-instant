import { VisibilitySelector } from '@/components/ui/visibility-selector'

type Visibility = 'public' | 'authenticated' | 'private'

interface VisibilityInputProps {
  value: Visibility
  onChange: (value: Visibility) => void
  label?: string
  showTooltip?: boolean
}

export function VisibilityInput({ value, onChange, label, showTooltip }: VisibilityInputProps) {
  return <VisibilitySelector value={value} onChange={onChange} label={label} showTooltip={showTooltip} />
}
