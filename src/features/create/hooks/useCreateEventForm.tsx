import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Switch } from '@/features/shared/ui/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/features/shared/ui/ui/tabs';
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx';
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor';
import { DateTimeRangeInput } from '../ui/inputs/DateTimeRangeInput';
import { CreateSummaryStep } from '../ui/CreateSummaryStep';
import { EventTypeInput } from '../ui/inputs/EventTypeInput';
import { RecurringPatternInput } from '../ui/inputs/RecurringPatternInput';
import { DelegateAllocationInput, type DelegateConfig } from '../ui/inputs/DelegateAllocationInput';
import { useEventActions } from '@/zero/events/useEventActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import { useUserGroupsWithManageEvents } from '@/zero/groups/useGroupState';
import { TypeaheadSearch } from '@/features/shared/ui/typeahead';
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';
import type { CreateFormConfig } from '../types/create-form.types';
import { buildRRule, type RecurrencePattern } from '@/features/events/logic/rruleHelpers';

type EventType = 'delegate_assembly' | 'general_assembly' | 'open' | 'on_invite';

export function useCreateEventForm(): CreateFormConfig {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createEvent } = useEventActions();
  const commonActions = useCommonActions();

  const [eventId] = useState(() => crypto.randomUUID());
  const [eventType, setEventType] = useState<EventType>('open');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [delegateConfig, setDelegateConfig] = useState<DelegateConfig>({
    allocationMode: 'ratio',
    totalDelegates: 10,
    delegateRatio: 10,
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState<'physical' | 'online'>('physical');
  const [onlineLink, setOnlineLink] = useState('');
  const [capacity, setCapacity] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [delegatesNominationDeadline, setDelegatesNominationDeadline] = useState('');
  const [amendmentDeadline, setAmendmentDeadline] = useState('');

  // Recurrence state
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const isRecurring = recurrencePattern !== 'none';
  const rruleString = useMemo(
    () => buildRRule({ pattern: recurrencePattern, interval: recurrenceInterval, weekdays: recurrenceWeekdays, endDate: recurrenceEndDate || null }),
    [recurrencePattern, recurrenceInterval, recurrenceWeekdays, recurrenceEndDate]
  );

  const { allHashtags } = useCommonState({ loadAllHashtags: true });
  const { manageEventGroupIds } = useUserGroupsWithManageEvents();
  const groupRequired = eventType === 'general_assembly' || eventType === 'delegate_assembly';

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await createEvent({
        id: eventId,
        title: title.trim(),
        description: description || null,
        location_type: locationType,
        location_name: locationType === 'physical' ? (location || null) : null,
        location_url: locationType === 'online' ? (onlineLink || null) : null,
        start_date: startDate ? new Date(`${startDate}T${startTime || '00:00'}`).getTime() : null,
        end_date: endDate ? new Date(`${endDate}T${endTime || '00:00'}`).getTime() : null,
        is_public: isPublic,
        visibility: isPublic ? 'public' : 'private',
        image_url: imageURL || null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        event_type: eventType,
        group_id: groupId || null,
        creator_id: '',
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_rule: rruleString ?? null,
        recurrence_interval: isRecurring ? recurrenceInterval : null,
        recurrence_days: isRecurring && recurrencePattern === 'weekly' && recurrenceWeekdays.length > 0 ? recurrenceWeekdays : null,
        recurrence_end_date: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate).getTime() : null,
        delegates_nomination_deadline: delegatesNominationDeadline ? new Date(delegatesNominationDeadline).getTime() : null,
        amendment_deadline: amendmentDeadline ? new Date(amendmentDeadline).getTime() : null,
        has_delegates: eventType === 'delegate_assembly',
        ...(eventType === 'delegate_assembly'
          ? {
              total_delegate_seats:
                delegateConfig.allocationMode === 'total' ? delegateConfig.totalDelegates : null,
            }
          : {}),
      });

      if (hashtags.length > 0) {
        await commonActions.syncEntityHashtags('event', eventId, hashtags, [], allHashtags ?? []);
      }

      navigate({ to: `/event/${eventId}` });
    } catch {
      setIsSubmitting(false);
    }
  };

  const config = useMemo(
    (): CreateFormConfig => ({
      entityType: 'event',
      title: 'pages.create.event.title',
      isSubmitting,
      onSubmit: handleSubmit,
      steps: [
        // 1. Basic Info first — title, description, image
        {
          label: t('pages.create.event.basicInfo'),
          isValid: () => !!title.trim(),
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('pages.create.event.titleLabel')} <span className="text-destructive">*</span>
                </Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.event.tips.title')}</p>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('pages.create.event.titlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.event.descriptionLabel')}</Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.event.tips.description')}</p>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
        // 2. Event Type
        {
          label: t('pages.create.event.eventType'),
          isValid: () => true,
          content: <EventTypeInput value={eventType} onChange={setEventType} />,
        },
        // 3. Associated Group
        {
          label: t('pages.create.event.associatedGroup'),
          isValid: () => groupRequired ? !!groupId : true,
          optional: !groupRequired,
          content: (
            <div className="space-y-2">
              <Label>{t('pages.create.event.associatedGroupLabel')}{groupRequired && <span className="text-destructive"> *</span>}</Label>
              <p className="text-muted-foreground text-xs">{t('pages.create.event.tips.group')}</p>
              <TypeaheadSearch
                entityTypes={['group']}
                value={groupId || undefined}
                onChange={(item: TypeaheadItem | null) => {
                  setGroupId(item?.id ?? '');
                  setGroupName(item?.label ?? '');
                }}
                filterFn={(item: TypeaheadItem) => manageEventGroupIds.has(item.id)}
                placeholder={t('pages.create.event.associatedGroupPlaceholder')}
              />
            </div>
          ),
        },
        // 4. Delegate Allocation (only for delegate_assembly)
        ...(eventType === 'delegate_assembly'
          ? [
              {
                label: t('pages.create.event.delegateAllocation'),
                isValid: () => true,
                content: (
                  <DelegateAllocationInput value={delegateConfig} onChange={setDelegateConfig} />
                ),
              },
            ]
          : []),
        // 5. Date & Time (4 separate inputs)
        {
          label: t('pages.create.event.dateTime'),
          isValid: () => true,
          optional: true,
          content: (
            <DateTimeRangeInput
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              onChange={(field, value) => {
                if (field === 'startDate') setStartDate(value);
                else if (field === 'startTime') setStartTime(value);
                else if (field === 'endDate') setEndDate(value);
                else if (field === 'endTime') setEndTime(value);
              }}
            />
          ),
        },
        // 6. Recurring
        {
          label: t('pages.create.event.recurring'),
          isValid: () => true,
          optional: true,
          content: (
            <RecurringPatternInput
              value={recurrencePattern}
              onChange={setRecurrencePattern}
              endDate={recurrenceEndDate}
              onEndDateChange={setRecurrenceEndDate}
              interval={recurrenceInterval}
              onIntervalChange={setRecurrenceInterval}
              weekdays={recurrenceWeekdays}
              onWeekdaysChange={setRecurrenceWeekdays}
            />
          ),
        },
        // 7. Location (tabbed: Physical / Online)
        {
          label: t('pages.create.event.location'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <Tabs value={locationType} onValueChange={(v) => setLocationType(v as 'physical' | 'online')}>
                <TabsList className="w-full">
                  <TabsTrigger value="physical" className="flex-1">{t('pages.create.event.locationTypes.physical')}</TabsTrigger>
                  <TabsTrigger value="online" className="flex-1">{t('pages.create.event.locationTypes.online')}</TabsTrigger>
                </TabsList>
                <TabsContent value="physical" className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>{t('pages.create.event.venueName')}</Label>
                    <p className="text-muted-foreground text-xs">{t('pages.create.event.tips.venueName')}</p>
                    <Input
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder={t('pages.create.event.venueNamePlaceholder')}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="online" className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>{t('pages.create.event.meetingLink')}</Label>
                    <p className="text-muted-foreground text-xs">{t('pages.create.event.tips.meetingLink')}</p>
                    <Input
                      value={onlineLink}
                      onChange={e => setOnlineLink(e.target.value)}
                      placeholder={t('pages.create.event.meetingLinkPlaceholder')}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <div className="space-y-2">
                <Label>{t('pages.create.event.capacityLabel')}</Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.event.tips.capacity')}</p>
                <Input
                  type="number"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  placeholder={t('pages.create.event.capacityPlaceholder')}
                  min={1}
                />
              </div>
            </div>
          ),
        },
        // 8. Deadlines (for delegate/general assembly)
        ...(eventType === 'delegate_assembly' || eventType === 'general_assembly'
          ? [
              {
                label: t('pages.create.event.deadlines'),
                isValid: () => true,
                optional: true,
                content: (
                  <div className="space-y-4">
                    {eventType === 'delegate_assembly' && (
                      <div className="space-y-2">
                        <Label>{t('pages.create.event.delegateNominationDeadline')}</Label>
                        <p className="text-muted-foreground text-xs">{t('pages.create.event.delegateNominationDeadlineDesc')}</p>
                        <Input
                          type="datetime-local"
                          value={delegatesNominationDeadline}
                          onChange={e => setDelegatesNominationDeadline(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>{t('pages.create.event.amendmentCutoffDeadline')}</Label>
                      <p className="text-muted-foreground text-xs">{t('pages.create.event.amendmentCutoffDeadlineDesc')}</p>
                      <Input
                        type="datetime-local"
                        value={amendmentDeadline}
                        onChange={e => setAmendmentDeadline(e.target.value)}
                      />
                    </div>
                  </div>
                ),
              },
            ]
          : []),
        // 9. Settings
        {
          label: t('pages.create.event.settings'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
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
        // 10. Review
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
                ...(groupId
                  ? [{ label: t('pages.create.event.associatedGroup'), value: groupName }]
                  : []),
                ...(eventType === 'delegate_assembly'
                  ? [
                      {
                        label: t('pages.create.event.delegateAllocation'),
                        value:
                          delegateConfig.allocationMode === 'ratio'
                            ? `1:${delegateConfig.delegateRatio}`
                            : `${delegateConfig.totalDelegates} total`,
                      },
                    ]
                  : []),
                ...(startDate
                  ? [{ label: t('pages.create.event.startDate'), value: `${startDate}${startTime ? ` ${startTime}` : ''}` }]
                  : []),
                ...(endDate ? [{ label: t('pages.create.event.endDate'), value: `${endDate}${endTime ? ` ${endTime}` : ''}` }] : []),
                { label: t('pages.create.event.location'), value: locationType === 'online' ? t('pages.create.event.onlineMeeting') : (location || t('pages.create.event.inPerson')) },
                ...(locationType === 'online' && onlineLink
                  ? [{ label: t('pages.create.event.meetingLink'), value: onlineLink }]
                  : []),
                ...(capacity
                  ? [{ label: t('pages.create.event.capacityLabel'), value: capacity }]
                  : []),
                ...(isRecurring
                  ? [{ label: t('pages.create.event.recurring'), value: recurrencePattern.replace('-', ' ') }]
                  : []),
                ...(delegatesNominationDeadline
                  ? [{ label: t('pages.create.event.delegateNominationDeadline'), value: delegatesNominationDeadline }]
                  : []),
                ...(amendmentDeadline
                  ? [{ label: t('pages.create.event.amendmentCutoffDeadline'), value: amendmentDeadline }]
                  : []),
                {
                  label: t('pages.create.common.visibility'),
                  value: isPublic
                    ? t('pages.create.common.public')
                    : t('pages.create.common.private'),
                },
              ]}
            />
          ),
        },
      ],
    }),
    [
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      locationType,
      onlineLink,
      capacity,
      imageURL,
      isPublic,
      hashtags,
      eventType,
      groupId,
      groupName,
      delegateConfig,
      isSubmitting,
      recurrencePattern,
      recurrenceInterval,
      recurrenceWeekdays,
      recurrenceEndDate,
      isRecurring,
      rruleString,
      delegatesNominationDeadline,
      amendmentDeadline,
      eventId,
      groupRequired,
      manageEventGroupIds,
      t,
    ]
  );

  return config;
}
