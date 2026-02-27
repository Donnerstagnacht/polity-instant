import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { CreateProgressIndicator } from './CreateProgressIndicator'
import type { CreateFormStep } from '../types/create-form.types'

interface CarouselFormLayoutProps {
  steps: CreateFormStep[]
  currentStep: number
  onStepChange: (step: number) => void
}

export function CarouselFormLayout({ steps, currentStep, onStepChange }: CarouselFormLayoutProps) {
  const { t } = useTranslation()
  const [emblaRef, emblaApi] = useEmblaCarousel({ watchDrag: true })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const currentStepValid = steps[currentStep]?.isValid() ?? false

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const index = emblaApi.selectedScrollSnap()
    onStepChange(index)
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi, onStepChange])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Sync external step changes to the carousel
  useEffect(() => {
    if (!emblaApi) return
    if (emblaApi.selectedScrollSnap() !== currentStep) {
      emblaApi.scrollTo(currentStep)
    }
  }, [emblaApi, currentStep])

  const scrollPrev = useCallback(() => {
    if (emblaApi && canScrollPrev) {
      emblaApi.scrollPrev()
    }
  }, [emblaApi, canScrollPrev])

  const scrollNext = useCallback(() => {
    if (emblaApi && canScrollNext && currentStepValid) {
      emblaApi.scrollNext()
    }
  }, [emblaApi, canScrollNext, currentStepValid])

  const handleStepClick = useCallback(
    (step: number) => {
      // Only allow navigating to steps where all previous steps are valid
      const canNavigate = steps.slice(0, step).every((s) => s.isValid())
      if (canNavigate && emblaApi) {
        emblaApi.scrollTo(step)
      }
    },
    [emblaApi, steps]
  )

  const stepLabels = steps.map((s) => s.label)
  const validSteps = steps.map((_, i) => steps.slice(0, i).every((s) => s.isValid()))

  return (
    <div className="flex flex-col gap-4">
      <CreateProgressIndicator
        currentStep={currentStep}
        totalSteps={steps.length}
        stepLabels={stepLabels}
        onStepClick={handleStepClick}
        validSteps={validSteps}
      />

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {steps.map((step, index) => (
            <div key={index} className="min-w-0 flex-[0_0_100%] px-1">
              <div className="space-y-4 py-2">{step.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('pages.create.previous')}
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={scrollNext}
          disabled={!canScrollNext || !currentStepValid}
        >
          {t('pages.create.next')}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
