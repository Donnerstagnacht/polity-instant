import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { Input } from '@/features/shared/ui/ui/input'
import { Label } from '@/features/shared/ui/ui/label'
import { Textarea } from '@/features/shared/ui/ui/textarea'
import { Switch } from '@/features/shared/ui/ui/switch'
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx'
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import { EventTypeInput } from '../ui/inputs/EventTypeInput'
import { GroupSearchInput } from '../ui/inputs/GroupSearchInput'
import { DelegateAllocationInput, type DelegateConfig } from '../ui/inputs/DelegateAllocationInput'
import { useEventActions } from '@/zero/events/useEventActions'
import { useCommonState, useCommonActions } from '@/zero/common'
import type { CreateFormConfig } from '../types/create-form.types'

type EventType = 'delegate_conference' | 'general_assembly' | 'open_assembly' | 'other'

export function useCreateEventForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createEvent } = useEventActions()
  const commonActions = useCommonActions()

  const [eventId] = useState(() => crypto.randomUUID())
  const [eventType, setEventType] = useState<EventType>('open_assembly')
  const [groupId, setGroupId] = useState('')
  const [delegateConfig, setDelegateConfig] = useState<DelegateConfig>({
    allocationMode: 'ratio',
    totalDelegates: 10,
    delegateRatio: 10,
  })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [hashtags, setHashtags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { allHashtags } = useCommonState({ loadAllHashtags: true })

  const handleSubmit = async () => {
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      await createEvent({
        id: eventId,
        title: title.trim(),
        description: description || null,
        location_name: location || null,
        start_date: startDate ? new Date(startDate).getTime() : null,
        end_date: endDate ? new Date(endDate).getTime() : null,
        is_public: isPublic,
        visibility: isPublic ? 'public' : 'private',
        image_url: imageURL || null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        event_type: eventType,
        group_id: groupId || null,
        creator_id: '',
        is_recurring: false,
        has_delegates: eventType === 'delegate_conference',
        ...(eventType === 'delegate_conference' ? {
          total_delegate_seats: delegateConfig.allocationMode === 'total' ? delegateConfig.totalDelegates : null,
          delegate_ratio: delegateConfig.allocationMode === 'ratio' ? delegateConfig.delegateRatio : null,
        } : {}),
      } as any)

      if (hashtags.length > 0) {
        await commonActions.syncEntityHashtags('event', eventId, hashtags, [], allHashtags ?? [])
      }

      navigate({ to: `/event/${eventId}` })
    } catch {
      setIsSubmitting(false)
    }
  }

  const config = useMemo(
    (): CreateFormConfig => ({
      entityType: 'event',
      title: 'pages.create.event.title',
      isSubmitting,
      onSubmit: handleSubmit,
      steps: [
        {
          label: t('pages.create.event.eventType'),
          isValid: () => true,
          content: (
            <EventTypeInput value={eventType} onChange={setEventType} />
          ),
        },
        ...((eventType === 'general_assembly' || eventType === 'delegate_conference') ? [{
          label: t('pages.create.event.associatedGroup'),
          isValid: () => !!groupId,
          content: (
            <GroupSearchInput
              value={groupId}
              onChange={setGroupId}
              label={t('pages.create.event.associatedGroupLabel')}
              placeholder={t('pages.create.event.associatedGroupPlaceholder')}
            />
          ),
        }] : []),
        ...(eventType === 'delegate_conference' ? [{
          label: t('pages.create.event.delegateAllocation'),
          isValid: () => true,
          content: (
            <DelegateAllocationInput value={delegateConfig} onChange={setDelegateConfig} />
          ),
        }] : []),
        {
          label: t('pages.create.event.basicInfo'),
          isValid: () => !!title.trim(),
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('pages.create.event.titleLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('pages.create.event.titlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.event.descriptionLabel')}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('pages.create.event.descriptionPlaceholder')}
                  rows={4}
                />
              </div>
              <ImageUpload
                currentImage={imageURL}
                onImageChange={(url: string) => setImageURL(url)}
                entityType="events"
                entityId={eventId}
                label={t('pages.create.event.imageLabel')}
                description={t('pages.create.event.imageDescription')}
              />
            </div>
          ),
        },
        {
          label: t('pages.create.event.dateTime'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('pages.create.event.startDate')}</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.event.endDate')}</Label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          ),
        },
        {
          label: t('pages.create.event.locationCapacity'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('pages.create.event.locationLabel')}</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('pages.create.event.locationPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.event.capacityLabel')}</Label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder={t('pages.create.event.capacityPlaceholder')}
                  min={1}
                />
              </div>
            </div>
          ),
        },
        {
          label: t('pages.create.event.settings'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="isPublic">{t('pages.create.common.public')}</Label>
              </div>
              <HashtagEditor
                value={hashtags}
                onChange={setHashtags}
                placeholder={t('pages.create.event.hashtagPlaceholder')}
              />
            </div>
          ),
        },
        {
          label: t('pages.create.common.review'),
          isValid: () => !!title.trim(),
          content: (
            <CreateSummaryStep
              entityType="event"
              badge={t('pages.create.event.reviewBadge')}
              title={title || t('pages.create.event.titlePlaceholder')}
              subtitle={description || undefined}
              hashtags={hashtags.length > 0 ? hashtags : undefined}
              fields={[
                { label: t('pages.create.event.eventType'), value: eventType.replace('_', ' ') },
                ...(groupId ? [{ label: t('pages.create.event.associatedGroup'), value: groupId }] : []),
                ...(eventType === 'delegate_conference' ? [
                  { label: t('pages.create.event.delegateAllocation'), value: delegateConfig.allocationMode === 'ratio' ? `1:${delegateConfig.delegateRatio}` : `${delegateConfig.totalDelegates} total` },
                ] : []),
                ...(startDate ? [{ label: t('pages.create.event.startDate'), value: startDate }] : []),
                ...(endDate ? [{ label: t('pages.create.event.endDate'), value: endDate }] : []),
                ...(location ? [{ label: t('pages.create.event.locationLabel'), value: location }] : []),
                ...(capacity ? [{ label: t('pages.create.event.capacityLabel'), value: capacity }] : []),
                {
                  label: t('pages.create.common.visibility'),
                  value: isPublic ? t('pages.create.common.public') : t('pages.create.common.private'),
                },
              ]}
            />
          ),
        },
      ],
    }),
    [title, description, startDate, endDate, location, capacity, imageURL, isPublic, hashtags, eventType, groupId, delegateConfig, isSubmitting, eventId, t],
  )

  return config
}
