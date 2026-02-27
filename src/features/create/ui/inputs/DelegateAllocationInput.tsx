import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/hooks/use-translation'

type AllocationMode = 'ratio' | 'total'

export interface DelegateConfig {
  allocationMode: AllocationMode
  totalDelegates: number
  delegateRatio: number
}

interface DelegateAllocationInputProps {
  value: DelegateConfig
  onChange: (config: DelegateConfig) => void
}

export function DelegateAllocationInput({ value, onChange }: DelegateAllocationInputProps) {
  const { t } = useTranslation()

  const update = (patch: Partial<DelegateConfig>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-3">
      <Label>{t('pages.create.event.delegateAllocation')}</Label>
      <RadioGroup
        value={value.allocationMode}
        onValueChange={(v) => update({ allocationMode: v as AllocationMode })}
      >
        <div className="space-y-2">
          <Label
            htmlFor="allocation-ratio"
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              value.allocationMode === 'ratio' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <RadioGroupItem value="ratio" id="allocation-ratio" className="mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium">{t('pages.create.event.delegateAllocationMode.ratio')}</div>
              <div className="text-muted-foreground text-xs">
                {t('pages.create.event.delegateAllocationMode.ratioDesc')}
              </div>
              {value.allocationMode === 'ratio' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs">{t('pages.create.event.delegateAllocationMode.ratioLabel')}</span>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={value.delegateRatio}
                    onChange={(e) => update({ delegateRatio: parseInt(e.target.value) || 1 })}
                  />
                  <span className="text-xs">{t('pages.create.event.delegateAllocationMode.ratioMembers')}</span>
                </div>
              )}
            </div>
          </Label>

          <Label
            htmlFor="allocation-total"
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              value.allocationMode === 'total' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <RadioGroupItem value="total" id="allocation-total" className="mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium">{t('pages.create.event.delegateAllocationMode.total')}</div>
              <div className="text-muted-foreground text-xs">
                {t('pages.create.event.delegateAllocationMode.totalDesc')}
              </div>
              {value.allocationMode === 'total' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs">{t('pages.create.event.delegateAllocationMode.totalLabel')}</span>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={value.totalDelegates}
                    onChange={(e) => update({ totalDelegates: parseInt(e.target.value) || 1 })}
                  />
                </div>
              )}
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
