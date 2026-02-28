import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useTodoMutations } from '@/features/todos/hooks/useTodoMutations'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { toast } from 'sonner'
import { Input } from '@/features/shared/ui/ui/input'
import { Textarea } from '@/features/shared/ui/ui/textarea'
import { Label } from '@/features/shared/ui/ui/label'
import { PriorityInput } from '../ui/inputs/PriorityInput'
import { StatusInput } from '../ui/inputs/StatusInput'
import { VisibilityInput } from '../ui/inputs/VisibilityInput'
import { TagsInput } from '../ui/inputs/TagsInput'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreateTodoForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createTodo, isLoading } = useTodoMutations()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending')
  const [dueDate, setDueDate] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'authenticated' | 'private'>('private')
  const [tags, setTags] = useState<string[]>([])

  const handleSubmit = async () => {
    if (!title.trim() || !user?.id) return
    try {
      await createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        ownerId: user.id,
        assigneeId: user.id,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        visibility,
      })
      toast.success(t('pages.create.success.created'))
      navigate({ to: '/user/$id', params: { id: user.id } })
    } catch {
      toast.error(t('pages.create.error.createFailed'))
    }
  }

  const config = useMemo((): CreateFormConfig => ({
    entityType: 'todo',
    title: 'pages.create.todo.title',
    isSubmitting: isLoading,
    onSubmit: handleSubmit,
    steps: [
      {
        label: t('pages.create.todo.titleLabel'),
        isValid: () => !!title.trim(),
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t('pages.create.todo.titleLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('pages.create.todo.titlePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.create.todo.descriptionLabel')}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('pages.create.todo.descriptionPlaceholder')}
                rows={4}
              />
            </div>
          </div>
        ),
      },
      {
        label: t('pages.create.todo.priorityLabel'),
        isValid: () => true,
        content: (
          <div className="space-y-4">
            <PriorityInput value={priority} onChange={setPriority} />
            <StatusInput value={status} onChange={setStatus} />
          </div>
        ),
      },
      {
        label: t('pages.create.event.settings'),
        isValid: () => true,
        optional: true,
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages.create.todo.dueDateOptional')}</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <VisibilityInput value={visibility} onChange={setVisibility} />
            <TagsInput
              value={tags}
              onChange={setTags}
              label={t('pages.create.todo.tagsOptional')}
              placeholder={t('pages.create.todo.tagPlaceholder')}
            />
          </div>
        ),
      },
      {
        label: t('pages.create.common.review'),
        isValid: () => !!title.trim(),
        content: (
          <CreateSummaryStep
            entityType="todo"
            badge={t('pages.create.todo.reviewBadge')}
            title={title || t('pages.create.todo.titlePlaceholder')}
            subtitle={description || undefined}
            fields={[
              { label: t('pages.create.todo.priorityLabel'), value: t(`pages.create.todo.priority.${priority}`) },
              { label: t('pages.create.todo.statusLabel'), value: status },
              ...(dueDate ? [{ label: t('pages.create.todo.dueDateLabel'), value: dueDate }] : []),
              { label: t('pages.create.common.visibility'), value: visibility },
              ...(tags.length > 0 ? [{ label: t('pages.create.todo.tagsLabel'), value: tags.join(', ') }] : []),
            ]}
          />
        ),
      },
    ],
  }), [title, description, priority, status, dueDate, visibility, tags, isLoading, t])

  return config
}
