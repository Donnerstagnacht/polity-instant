import { CreateReviewCard, SummaryField } from '@/components/ui/create-review-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import {
  CONTENT_TYPE_CONFIG,
  getContentTypeGradient,
  type ContentType,
} from '@/features/timeline/constants/content-type-config'
import type { ReactNode } from 'react'

interface SummaryFieldEntry {
  label: string
  value: ReactNode
}

interface CreateSummaryStepProps {
  entityType: ContentType
  badge: string
  title: string
  subtitle?: string
  hashtags?: string[]
  fields: SummaryFieldEntry[]
  onSubmit: () => void
  isSubmitting: boolean
  /** Extra content to render below the fields (e.g., images, lists) */
  children?: ReactNode
}

export function CreateSummaryStep({
  entityType,
  badge,
  title,
  subtitle,
  hashtags,
  fields,
  onSubmit,
  isSubmitting,
  children,
}: CreateSummaryStepProps) {
  const { t } = useTranslation()
  const gradient = getContentTypeGradient(entityType).replace('bg-gradient-to-br ', '')

  return (
    <div className="space-y-4">
      <CreateReviewCard
        badge={badge}
        title={title}
        subtitle={subtitle}
        hashtags={hashtags}
        gradient={gradient}
      >
        {fields.map((field, i) => (
          <SummaryField key={i} label={field.label} value={field.value} />
        ))}
        {children}
      </CreateReviewCard>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('pages.create.creating')}
          </>
        ) : (
          t('pages.create.summary.createButton')
        )}
      </Button>
    </div>
  )
}
