import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import {
  useAllEvents,
  useAllAmendments,
  usePositionsWithGroups,
  useEventAgenda,
} from '@/zero/events/useEventState';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { toast } from 'sonner';
import { Input } from '@/features/shared/ui/ui/input';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Label } from '@/features/shared/ui/ui/label';
import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch';
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems';
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';
import { TypeSelector } from '@/features/shared/ui/ui/type-selector';
import { TooltipProvider } from '@/features/shared/ui/ui/tooltip';
import { CreateSummaryStep } from '../ui/CreateSummaryStep';
import { notifyAgendaItemCreated } from '@/features/notifications/utils/notification-helpers.ts';
import type { CreateFormConfig } from '../types/create-form.types';

type AgendaItemType = 'election' | 'vote' | 'speech' | 'discussion';

export function useCreateAgendaItemForm(): CreateFormConfig {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });
  const { user } = useAuth();
  const { createAgendaItem, createElection } = useAgendaActions();

  const eventIdParam = (searchParams as { eventId?: string }).eventId;
  const typeParam = (searchParams as { type?: AgendaItemType }).type;

  const { events: userEvents } = useAllEvents();
  const { amendments: userAmendments } = useAllAmendments();
  const { positions: userPositions } = usePositionsWithGroups();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AgendaItemType>(typeParam || 'discussion');
  const [order, setOrder] = useState(1);
  const [hasCustomOrder, setHasCustomOrder] = useState(false);
  const [duration, setDuration] = useState('');
  const [eventId, setEventId] = useState(eventIdParam || '');
  const [amendmentId, setAmendmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { agendaItems: eventAgendaItems } = useEventAgenda(eventId || undefined);

  const nextOrder = useMemo(
    () =>
      eventAgendaItems.reduce((highestOrder, agendaItem) => {
        return Math.max(highestOrder, agendaItem.order_index ?? 0);
      }, 0) + 1,
    [eventAgendaItems]
  );

  useEffect(() => {
    if (eventIdParam && eventIdParam !== eventId) {
      setEventId(eventIdParam);
    }
  }, [eventIdParam, eventId]);

  useEffect(() => {
    if (typeParam && typeParam !== type) {
      setType(typeParam);
    }
  }, [typeParam, type]);

  useEffect(() => {
    setHasCustomOrder(false);
  }, [eventId]);

  useEffect(() => {
    if (!hasCustomOrder) {
      setOrder(nextOrder);
    }
  }, [hasCustomOrder, nextOrder]);

  const resolvedOrder = hasCustomOrder ? order : nextOrder;

  const selectedEvent = userEvents.find(e => e.id === eventId);

  const handleSubmit = async () => {
    if (!user?.id || !eventId || !title.trim()) return;
    setIsSubmitting(true);

    try {
      const agendaItemId = crypto.randomUUID();

      await createAgendaItem({
        id: agendaItemId,
        title: title.trim(),
        description: description.trim() || '',
        type,
        order_index: resolvedOrder,
        duration: duration ? parseInt(duration) : 0,
        status: 'pending',
        forwarding_status: '',
        scheduled_time: '',
        start_time: 0,
        end_time: 0,
        activated_at: 0,
        completed_at: 0,
        event_id: eventId || null,
        amendment_id: amendmentId || null,
      });

      if (type === 'election') {
        const electionId = crypto.randomUUID();
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
          position_id: positionId || null,
          amendment_id: null,
        });
      }

      await notifyAgendaItemCreated({
        senderId: user.id,
        eventId,
        eventTitle: selectedEvent?.title || 'Event',
        agendaItemTitle: title.trim(),
      });

      toast.success(t('pages.create.success.created'));
      navigate({ to: `/event/${eventId}/agenda` });
    } catch {
      toast.error(t('pages.create.error.createFailed'));
      setIsSubmitting(false);
    }
  };

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
                <TypeaheadSearch
                  items={toTypeaheadItems(
                    userEvents,
                    'event',
                    e => e.title || 'Event',
                    e => e.description?.substring(0, 60)
                  )}
                  value={eventId}
                  onChange={(item: TypeaheadItem | null) => setEventId(item?.id ?? '')}
                  placeholder={t('pages.create.agendaItem.eventPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('pages.create.agendaItem.titleLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('pages.create.agendaItem.titlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.agendaItem.descriptionLabel')}</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                    onChange={e => {
                      setHasCustomOrder(true);
                      setOrder(parseInt(e.target.value) || 1);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pages.create.agendaItem.durationLabel')}</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={t('pages.create.agendaItem.durationPlaceholder')}
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
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
                  <TypeaheadSearch
                    items={toTypeaheadItems(
                      userAmendments,
                      'amendment',
                      a => a.title || 'Amendment'
                    )}
                    value={amendmentId}
                    onChange={(item: TypeaheadItem | null) => setAmendmentId(item?.id ?? '')}
                    placeholder={t('pages.create.agendaItem.amendmentPlaceholder')}
                  />
                </div>
              )}
              {type === 'election' && (
                <div className="space-y-2">
                  <Label>{t('pages.create.agendaItem.positionOptional')}</Label>
                  <TypeaheadSearch
                    items={toTypeaheadItems(
                      userPositions,
                      'position',
                      p => p.title || 'Position',
                      p => p.description?.substring(0, 60)
                    )}
                    value={positionId}
                    onChange={(item: TypeaheadItem | null) => setPositionId(item?.id ?? '')}
                    placeholder={t('pages.create.agendaItem.positionPlaceholder')}
                  />
                </div>
              )}
              {type !== 'vote' && type !== 'election' && (
                <div className="text-muted-foreground py-8 text-center">
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
                { label: t('pages.create.agendaItem.orderLabel'), value: `#${resolvedOrder}` },
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
                        value: userAmendments.find(a => a.id === amendmentId)?.title || amendmentId,
                      },
                    ]
                  : []),
                ...(positionId
                  ? [
                      {
                        label: t('pages.create.agendaItem.positionLabel'),
                        value: userPositions.find(p => p.id === positionId)?.title || positionId,
                      },
                    ]
                  : []),
              ]}
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
    ]
  );

  return config;
}
