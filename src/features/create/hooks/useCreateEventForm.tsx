import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from '@/hooks/use-translation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { HashtagEditor } from '@/components/ui/hashtag-editor'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import { useEventActions } from '@/zero/events/useEventActions'
import { useCommonState, useCommonActions } from '@/zero/common'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreateEventForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createEvent } = useEventActions()
  const commonActions = useCommonActions()

  const [eventId] = useState(() => crypto.randomUUID())
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
        group_id: null,
        creator_id: '',
        is_recurring: false,
        has_delegates: false,
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
                ...(startDate ? [{ label: t('pages.create.event.startDate'), value: startDate }] : []),
                ...(endDate ? [{ label: t('pages.create.event.endDate'), value: endDate }] : []),
                ...(location ? [{ label: t('pages.create.event.locationLabel'), value: location }] : []),
                ...(capacity ? [{ label: t('pages.create.event.capacityLabel'), value: capacity }] : []),
                {
                  label: t('pages.create.common.visibility'),
                  value: isPublic ? t('pages.create.common.public') : t('pages.create.common.private'),
                },
              ]}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          ),
        },
      ],
    }),
    [title, description, startDate, endDate, location, capacity, imageURL, isPublic, hashtags, isSubmitting, eventId, t],
  )

  return config
}
