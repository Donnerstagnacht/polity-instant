import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useGroupActions } from '@/zero/groups/useGroupActions'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { toast } from 'sonner'
import { Input } from '@/features/shared/ui/ui/input'
import { Textarea } from '@/features/shared/ui/ui/textarea'
import { Label } from '@/features/shared/ui/ui/label'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import { TypeaheadSearch } from '@/features/shared/ui/typeahead'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreatePositionForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createPosition } = useGroupActions()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [term, setTerm] = useState('4')
  const [firstTermStart, setFirstTermStart] = useState('')
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const positionId = crypto.randomUUID()
      await createPosition({
        id: positionId,
        title: title.trim(),
        description: description.trim(),
        term: String(parseInt(term, 10)),
        first_term_start: new Date(firstTermStart).getTime(),
        scheduled_revote_date: null,
        group_id: groupId,
        event_id: null,
      })
      toast.success(t('pages.create.success.created'))
      navigate({ to: '/group/$id', params: { id: groupId } })
    } catch {
      toast.error(t('pages.create.error.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const config = useMemo((): CreateFormConfig => ({
    entityType: 'group',
    title: 'pages.create.position.title',
    isSubmitting,
    onSubmit: handleSubmit,
    steps: [
      {
        label: t('pages.create.position.groupLabel'),
        isValid: () => !!groupId,
        content: (
          <div className="space-y-2">
            <Label>{t('pages.create.position.groupLabel')}</Label>
            <TypeaheadSearch
              entityTypes={['group']}
              value={groupId || undefined}
              onChange={(item: TypeaheadItem | null) => {
                setGroupId(item?.id ?? '')
                setGroupName(item?.label ?? '')
              }}
              placeholder={t('pages.create.common.searchGroup')}
            />
          </div>
        ),
      },
      {
        label: t('pages.create.position.titleLabel'),
        isValid: () => !!title.trim(),
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t('pages.create.position.titleLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('pages.create.position.titlePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.create.position.descriptionLabel')}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('pages.create.position.descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
        ),
      },
      {
        label: t('pages.create.position.termLabel'),
        isValid: () => parseInt(term, 10) >= 1 && !!firstTermStart,
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t('pages.create.position.termLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">{t('pages.create.position.termHint')}</p>
            </div>
            <div className="space-y-2">
              <Label>
                {t('pages.create.position.firstTermStartLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={firstTermStart}
                onChange={(e) => setFirstTermStart(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">{t('pages.create.position.firstTermStartHint')}</p>
            </div>
          </div>
        ),
      },
      {
        label: t('pages.create.common.review'),
        isValid: () => !!groupId && !!title.trim() && parseInt(term, 10) >= 1 && !!firstTermStart,
        content: (
          <CreateSummaryStep
            entityType="group"
            badge={t('pages.create.position.reviewBadge')}
            title={title || 'Untitled Position'}
            subtitle={description || undefined}
            fields={[
              { label: t('pages.create.position.termLength'), value: t('pages.create.position.termMonths', { months: term }) },
              { label: t('pages.create.position.firstTermStarts'), value: firstTermStart },
            ]}
          />
        ),
      },
    ],
  }), [title, description, term, firstTermStart, groupId, isSubmitting, t])

  return config
}
