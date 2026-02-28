import { cn } from '@/features/shared/utils/utils'
import { Progress } from '@/features/shared/ui/ui/progress'
import { useTranslation } from '@/features/shared/hooks/use-translation'

interface CreateProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
  onStepClick?: (step: number) => void
  /** Which steps are valid (clickable) — defaults to all steps up to current */
  validSteps?: boolean[]
}

export function CreateProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
  validSteps,
}: CreateProgressIndicatorProps) {
  const { t } = useTranslation()
  const progressPercent = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="h-2 flex-1" />
        <span className="text-muted-foreground whitespace-nowrap text-xs">
          {t('pages.create.progress.stepOf', {
            current: currentStep + 1,
            total: totalSteps,
          })}
        </span>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2">
        {stepLabels.map((label, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable =
            onStepClick &&
            (isCompleted || (validSteps ? validSteps[index] : index <= currentStep))

          return (
            <button
              key={index}
              type="button"
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={cn(
                'flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-all',
                isCurrent && 'bg-primary text-primary-foreground shadow-sm',
                isCompleted && 'bg-primary/20 text-primary cursor-pointer hover:bg-primary/30',
                !isCurrent &&
                  !isCompleted &&
                  'bg-muted text-muted-foreground cursor-default opacity-50'
              )}
              title={label}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
                {index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
