import { CreateReviewCard, SummaryField } from '@/features/shared/ui/ui/create-review-card'
import {
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
  children,
}: CreateSummaryStepProps) {
  const gradient = getContentTypeGradient(entityType).replace('bg-gradient-to-br ', '')

  return (
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
  )
}
