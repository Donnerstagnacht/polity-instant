import { useState, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useAgendaActions } from '@/zero/agendas/useAgendaActions'
import {
  useAllEvents,
  useAllAmendments,
  usePositionsWithGroups,
} from '@/zero/events/useEventState'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { TypeAheadSelect } from '@/components/ui/type-ahead-select'
import { TypeSelector } from '@/components/ui/type-selector'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  EventSelectCard,
  AmendmentSelectCard,
  PositionSelectCard,
} from '@/components/ui/entity-select-cards'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import { notifyAgendaItemCreated } from '@/utils/notification-helpers'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreateAgendaItemForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const { user } = useAuth()
  const { createAgendaItem, createElection } = useAgendaActions()

  const eventIdParam = (searchParams as Record<string, unknown>).eventId as string | undefined

  const { events: userEvents } = useAllEvents()
  const { amendments: userAmendments } = useAllAmendments()
  const { positions: userPositions } = usePositionsWithGroups()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'election' | 'vote' | 'speech' | 'discussion'>('discussion')
  const [order, setOrder] = useState(1)
  const [duration, setDuration] = useState('')
  const [eventId, setEventId] = useState(eventIdParam || '')
  const [amendmentId, setAmendmentId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedEvent = userEvents.find((e: any) => e.id === eventId)

  const handleSubmit = async () => {
    if (!user?.id || !eventId || !title.trim()) return
    setIsSubmitting(true)

    try {
      const agendaItemId = crypto.randomUUID()

      await createAgendaItem({
        id: agendaItemId,
        title: title.trim(),
        description: description.trim() || '',
        type,
        order_index: order,
        duration: duration ? parseInt(duration) : 0,
        status: 'pending',
        forwarding_status: '',
        scheduled_time: '',
        start_time: 0,
        end_time: 0,
        activated_at: 0,
        completed_at: 0,
        event_id: eventId,
        amendment_id: amendmentId || '',
      })

      if (type === 'election') {
        const electionId = crypto.randomUUID()
        await createElection({
          id: electionId,
          title: title.trim(),
          description: description.trim() || '',
          majority_type: 'relative',
          is_multiple_choice: false,
          max_selections: 1,
          status: 'pending',
          voting_start_time: 0,
          voting_end_time: 0,
          agenda_item_id: agendaItemId,
          position_id: positionId || '',
          amendment_id: null,
        })
      }

      await notifyAgendaItemCreated({
        senderId: user.id,
        eventId,
        eventTitle: selectedEvent?.title || 'Event',
        agendaItemTitle: title.trim(),
      })

      toast.success(t('pages.create.success.created'))
      navigate({ to: `/event/${eventId}/agenda` })
    } catch {
      toast.error(t('pages.create.error.createFailed'))
      setIsSubmitting(false)
    }
  }

  const config = useMemo(
    (): CreateFormConfig => ({
      entityType: 'action',
      title: 'pages.create.agendaItem.title',
      isSubmitting,
      onSubmit: handleSubmit,
      steps: [
        {
          label: t('pages.create.agendaItem.basicInfo'),
          isValid: () => !!eventId && !!title.trim(),
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('pages.create.agendaItem.eventLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <TypeAheadSelect
                  items={userEvents}
                  value={eventId}
                  onChange={setEventId}
                  placeholder={t('pages.create.agendaItem.eventPlaceholder')}
                  searchKeys={['title', 'description', 'location_name']}
                  renderItem={(event) => <EventSelectCard event={event} />}
                  getItemId={(event) => event.id}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('pages.create.agendaItem.titleLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('pages.create.agendaItem.titlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.agendaItem.descriptionLabel')}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('pages.create.agendaItem.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </div>
          ),
        },
        {
          label: t('pages.create.agendaItem.typeAndSettings'),
          isValid: () => true,
          content: (
            <div className="space-y-4">
              <TooltipProvider>
                <TypeSelector value={type} onChange={setType} />
              </TooltipProvider>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('pages.create.agendaItem.orderLabel')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pages.create.agendaItem.durationLabel')}</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={t('pages.create.agendaItem.durationPlaceholder')}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ),
        },
        {
          label: t('pages.create.agendaItem.additionalLinks'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              {type === 'vote' && (
                <div className="space-y-2">
                  <Label>{t('pages.create.agendaItem.amendmentOptional')}</Label>
                  <TypeAheadSelect
                    items={userAmendments}
                    value={amendmentId}
                    onChange={setAmendmentId}
                    placeholder={t('pages.create.agendaItem.amendmentPlaceholder')}
                    searchKeys={['title', 'reason']}
                    renderItem={(amendment) => <AmendmentSelectCard amendment={amendment} />}
                    getItemId={(amendment) => amendment.id}
                  />
                </div>
              )}
              {type === 'election' && (
                <div className="space-y-2">
                  <Label>{t('pages.create.agendaItem.positionOptional')}</Label>
                  <TypeAheadSelect
                    items={userPositions}
                    value={positionId}
                    onChange={setPositionId}
                    placeholder={t('pages.create.agendaItem.positionPlaceholder')}
                    searchKeys={['title', 'description']}
                    renderItem={(position) => <PositionSelectCard position={position} />}
                    getItemId={(position) => position.id}
                  />
                </div>
              )}
              {type !== 'vote' && type !== 'election' && (
                <div className="py-8 text-center text-muted-foreground">
                  {t('pages.create.agendaItem.noAdditionalConfig')}
                </div>
              )}
            </div>
          ),
        },
        {
          label: t('pages.create.common.review'),
          isValid: () => !!eventId && !!title.trim(),
          content: (
            <CreateSummaryStep
              entityType="action"
              badge={t('pages.create.agendaItem.reviewBadge')}
              title={title || t('pages.create.agendaItem.titlePlaceholder')}
              subtitle={description || undefined}
              fields={[
                {
                  label: t('pages.create.agendaItem.eventLabel'),
                  value: selectedEvent?.title || t('pages.create.common.notSelected'),
                },
                { label: t('pages.create.agendaItem.typeLabel'), value: type },
                { label: t('pages.create.agendaItem.orderLabel'), value: `#${order}` },
                ...(duration
                  ? [
                      {
                        label: t('pages.create.agendaItem.durationLabel'),
                        value: `${duration} ${t('pages.create.agendaItem.minutes')}`,
                      },
                    ]
                  : []),
                ...(amendmentId
                  ? [
                      {
                        label: t('pages.create.agendaItem.amendmentLabel'),
                        value:
                          userAmendments.find((a: any) => a.id === amendmentId)?.title || amendmentId,
                      },
                    ]
                  : []),
                ...(positionId
                  ? [
                      {
                        label: t('pages.create.agendaItem.positionLabel'),
                        value:
                          userPositions.find((p: any) => p.id === positionId)?.title || positionId,
                      },
                    ]
                  : []),
              ]}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          ),
        },
      ],
    }),
    [
      title,
      description,
      type,
      order,
      duration,
      eventId,
      amendmentId,
      positionId,
      isSubmitting,
      userEvents,
      userAmendments,
      userPositions,
      t,
    ],
  )

  return config
}
