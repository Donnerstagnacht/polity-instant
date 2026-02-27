import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/use-translation'
import { useFormStyle } from '../hooks/useFormStyle'
import { CarouselFormLayout } from './CarouselFormLayout'
import { OnePageFormLayout } from './OnePageFormLayout'
import { FormStyleSelector } from './FormStyleSelector'
import type { CreateFormConfig } from '../types/create-form.types'

interface CreateFormShellProps {
  config: CreateFormConfig
}

/**
 * Master wrapper: reads the user's form style preference,
 * then delegates to CarouselFormLayout or OnePageFormLayout.
 */
export function CreateFormShell({ config }: CreateFormShellProps) {
  const { t } = useTranslation()
  const { formMode } = useFormStyle()
  const [currentStep, setCurrentStep] = useState(0)

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const Layout = formMode === 'carousel' ? CarouselFormLayout : OnePageFormLayout

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{t(config.title)}</CardTitle>
            <CardDescription className="sr-only">
              {t(config.title)}
            </CardDescription>
          </div>
          <FormStyleSelector />
        </CardHeader>
        <CardContent>
          <Layout
            steps={config.steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
