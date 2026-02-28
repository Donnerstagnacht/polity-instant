import { Button } from '@/features/shared/ui/ui/button'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { usePreferenceState } from '@/zero/preferences/usePreferenceState'
import { usePreferenceActions } from '@/zero/preferences/usePreferenceActions'
import { Columns2, LayoutList, Smartphone } from 'lucide-react'
import { cn } from '@/features/shared/utils/utils'
import type { CreateFormStyle } from '@/zero/preferences/schema'

const STYLE_OPTIONS: { value: CreateFormStyle; icon: typeof Columns2; labelKey: string }[] = [
  { value: 'carousel', icon: Smartphone, labelKey: 'pages.create.preferences.carousel' },
  { value: 'one_page', icon: LayoutList, labelKey: 'pages.create.preferences.onePage' },
  { value: 'auto', icon: Columns2, labelKey: 'pages.create.preferences.auto' },
]

export function FormStyleSelector() {
  const { t } = useTranslation()
  const { createFormStyle } = usePreferenceState()
  const { updateFormStyle } = usePreferenceActions()

  return (
    <div className="flex items-center gap-1">
      {STYLE_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 gap-1 px-2 text-xs',
            createFormStyle === value && 'bg-accent text-accent-foreground'
          )}
          onClick={() => updateFormStyle(value)}
          title={t(labelKey)}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t(labelKey)}</span>
        </Button>
      ))}
    </div>
  )
}
