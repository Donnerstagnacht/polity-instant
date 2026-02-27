import { useEffect, useRef, useState } from 'react'
import { CreateProgressIndicator } from './CreateProgressIndicator'
import type { CreateFormStep } from '../types/create-form.types'

interface OnePageFormLayoutProps {
  steps: CreateFormStep[]
  currentStep: number
  onStepChange: (step: number) => void
}

export function OnePageFormLayout({ steps, currentStep, onStepChange }: OnePageFormLayoutProps) {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeSection, setActiveSection] = useState(0)
  const isScrollingRef = useRef(false)

  // Track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setActiveSection(index)
              onStepChange(index)
            }
          }
        }
      },
      { threshold: 0.5 }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [steps.length, onStepChange])

  const handleStepClick = (step: number) => {
    const el = sectionRefs.current[step]
    if (el) {
      isScrollingRef.current = true
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(step)
      onStepChange(step)
      setTimeout(() => {
        isScrollingRef.current = false
      }, 500)
    }
  }

  const stepLabels = steps.map((s) => s.label)

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-background/95 sticky top-0 z-10 pb-2 pt-2 backdrop-blur-sm">
        <CreateProgressIndicator
          currentStep={activeSection}
          totalSteps={steps.length}
          stepLabels={stepLabels}
          onStepClick={handleStepClick}
        />
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <div
            key={index}
            ref={(el) => {
              sectionRefs.current[index] = el
            }}
            className="scroll-mt-24"
          >
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              {index + 1}. {step.label}
            </h3>
            <div className="space-y-4">{step.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
