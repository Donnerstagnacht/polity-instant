import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useStatementMutations } from '@/features/statements/hooks/useStatementMutations'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { Textarea } from '@/features/shared/ui/ui/textarea'
import { Input } from '@/features/shared/ui/ui/input'
import { Label } from '@/features/shared/ui/ui/label'
import { VisibilityInput } from '../ui/inputs/VisibilityInput'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreateStatementForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createStatement, isLoading } = useStatementMutations()

  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'authenticated' | 'private'>('public')

  const handleSubmit = async () => {
    if (!user) return
    const result = await createStatement(user.id, text.trim(), tag.trim(), visibility)
    if (result.success) {
      navigate({ to: '/home' })
    }
  }

  const config = useMemo((): CreateFormConfig => ({
    entityType: 'statement',
    title: 'pages.create.statement.title',
    isSubmitting: isLoading,
    onSubmit: handleSubmit,
    steps: [
      {
        label: t('pages.create.statement.textLabel'),
        isValid: () => !!text.trim(),
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t('pages.create.statement.textLabel')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('pages.create.statement.textPlaceholder')}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('pages.create.statement.tagLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder={t('pages.create.statement.tagPlaceholder')}
              />
            </div>
          </div>
        ),
      },
      {
        label: t('pages.create.common.visibility'),
        isValid: () => true,
        content: (
          <VisibilityInput value={visibility} onChange={setVisibility} />
        ),
      },
      {
        label: t('pages.create.common.review'),
        isValid: () => !!text.trim() && !!tag.trim(),
        content: (
          <CreateSummaryStep
            entityType="statement"
            badge={t('pages.create.statement.reviewBadge')}
            title={t('pages.create.statement.reviewBadge')}
            subtitle={text || undefined}
            fields={[
              { label: t('pages.create.statement.tagLabel'), value: `#${tag}` },
              { label: t('pages.create.common.visibility'), value: visibility },
            ]}
          />
        ),
      },
    ],
  }), [text, tag, visibility, isLoading, t])

  return config
}
