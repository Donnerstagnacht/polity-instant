'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Calendar, Clock, Users, AlertCircle, Video, Building2, Info, Check, Link as LinkIcon, FileText, UserCheck } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { db, tx, id } from 'db/db';
import { DEFAULT_EVENT_ROLES } from 'db/rbac/constants';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { GroupSelectCard } from '@/components/ui/entity-select-cards';
import { useSearchParams } from 'next/navigation';
import { getDirectSubgroups, calculateDelegateAllocations } from '@/utils/delegate-calculations';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { notifyGroupEventCreated } from '@/utils/notification-helpers';
import { useTranslation } from '@/hooks/use-translation';

// Recurring pattern options - labels need to be resolved at render time
const getRecurringPatternOptions = (t: (key: string) => string) => [
  { value: 'none', label: t('pages.create.event.recurringPatterns.none'), description: t('pages.create.event.recurringPatterns.noneDesc') },
  { value: 'daily', label: t('pages.create.event.recurringPatterns.daily'), description: t('pages.create.event.recurringPatterns.dailyDesc') },
  { value: 'weekly', label: t('pages.create.event.recurringPatterns.weekly'), description: t('pages.create.event.recurringPatterns.weeklyDesc') },
  { value: 'monthly', label: t('pages.create.event.recurringPatterns.monthly'), description: t('pages.create.event.recurringPatterns.monthlyDesc') },
  { value: 'yearly', label: t('pages.create.event.recurringPatterns.yearly'), description: t('pages.create.event.recurringPatterns.yearlyDesc') },
  { value: 'four-yearly', label: t('pages.create.event.recurringPatterns.fourYearly'), description: t('pages.create.event.recurringPatterns.fourYearlyDesc') },
];

// Visibility options - labels need to be resolved at render time
const getVisibilityOptions = (t: (key: string) => string) => [
  {
    value: 'public' as const,
    label: t('pages.create.common.public'),
    description: t('pages.create.event.visibility.publicDesc'),
  },
  {
    value: 'authenticated' as const,
    label: t('pages.create.common.authenticated'),
    description: t('pages.create.event.visibility.authenticatedDesc'),
  },
  {
    value: 'private' as const,
    label: t('pages.create.common.private'),
    description: t('pages.create.event.visibility.privateDesc'),
  },
];

// Location type options - labels need to be resolved at render time
const getLocationTypeOptions = (t: (key: string) => string) => [
  { value: 'online', label: t('pages.create.event.locationTypes.online'), icon: Video },
  { value: 'physical', label: t('pages.create.event.locationTypes.physical'), icon: Building2 },
];

function CreateEventForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get('groupId');

  // Get translated options
  const recurringPatternOptions = getRecurringPatternOptions(t);
  const visibilityOptions = getVisibilityOptions(t);
  const locationTypeOptions = getLocationTypeOptions(t);

  const [formData, setFormData] = useState({
    // Basic info
    title: '',
    description: '',
    
    // Date & Time
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00',
    
    // Recurring
    recurringPattern: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'four-yearly',
    recurringEndDate: '',
    
    // Group
    groupId: groupIdParam || '',
    
    // Event Type
    eventType: 'other' as 'delegate_conference' | 'open_assembly' | 'general_assembly' | 'other',
    delegateAllocationMode: 'ratio' as 'ratio' | 'total',
    totalDelegates: 10,
    delegateRatio: 50,
    
    // Location
    locationType: '' as '' | 'online' | 'physical',
    // Online fields
    onlineMeetingLink: '',
    meetingCode: '',
    // Physical fields
    locationName: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    
    // Deadlines
    delegateNominationDeadline: '',
    delegateNominationTime: '23:59',
    proposalSubmissionDeadline: '',
    proposalSubmissionTime: '23:59',
    amendmentCutoffDate: '',
    amendmentCutoffTime: '23:59',
    
    // Settings / Visibility
    capacity: 50,
    visibility: 'public' as 'public' | 'authenticated' | 'private',
    participantListVisibility: 'public' as 'public' | 'authenticated' | 'private',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const user = useAuthStore(state => state.user);

  // Total number of steps
  const totalSteps = 8;

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentStep(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Query user's groups for the dropdown
  const { data: groupsData } = db.useQuery({
    groups: {
      $: {
        where: {
          or: [{ 'owner.id': user?.id }, { 'memberships.user.id': user?.id }],
        },
      },
    },
  });

  const userGroups = groupsData?.groups || [];

  // Query group relationships to check for subgroups (for delegate conference)
  const { data: relationshipsData } = db.useQuery(
    formData.groupId
      ? {
          groupRelationships: {
            $: {
              where: {
                'parentGroup.id': formData.groupId,
              },
            },
            childGroup: {
              memberships: {},
            },
            parentGroup: {},
          },
        }
      : null
  );

  // Calculate delegate allocations for preview
  const subgroups = formData.groupId
    ? getDirectSubgroups(
        formData.groupId,
        (relationshipsData?.groupRelationships || [])
          .filter((rel: any) => rel.childGroup && rel.parentGroup)
          .map((rel: any) => ({
            id: rel.id,
            childGroup: {
              id: rel.childGroup.id,
              name: rel.childGroup.name,
              memberCount: rel.childGroup.memberships?.filter((m: any) => m.status === 'member').length || 0,
            },
            parentGroup: {
              id: rel.parentGroup.id,
            },
          }))
          .reduce((acc: any[], rel: any) => {
            if (!acc.find(r => r.childGroup.id === rel.childGroup.id)) {
              acc.push(rel);
            }
            return acc;
          }, [])
      )
    : [];

  const hasSubgroups = subgroups.length > 0;
  const totalMembers = subgroups.reduce((sum, g) => sum + g.memberCount, 0);
  
  const totalDelegatesCalc = formData.eventType === 'delegate_conference' && hasSubgroups
    ? formData.delegateAllocationMode === 'total'
      ? formData.totalDelegates
      : Math.max(1, Math.floor(totalMembers / formData.delegateRatio))
    : 0;
  
  const delegateAllocations = formData.eventType === 'delegate_conference' && hasSubgroups
    ? calculateDelegateAllocations(
        subgroups.map(g => ({ id: g.id, memberCount: g.memberCount })),
        totalDelegatesCalc
      )
    : [];

  // Build location string for legacy field
  const buildLocationString = () => {
    if (formData.locationType === 'online') {
      return formData.onlineMeetingLink || 'Online';
    } else if (formData.locationType === 'physical') {
      const parts = [
        formData.locationName,
        formData.street && formData.houseNumber ? `${formData.street} ${formData.houseNumber}` : formData.street,
        formData.postalCode && formData.city ? `${formData.postalCode} ${formData.city}` : formData.city,
      ].filter(Boolean);
      return parts.join(', ') || '';
    }
    return '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error(t('pages.create.validation.loginRequired'));
        setIsSubmitting(false);
        return;
      }

      if (!formData.groupId) {
        toast.error(t('pages.create.validation.groupRequired'));
        setIsSubmitting(false);
        return;
      }

      const eventId = id();
      const participantId = id();
      const organizerRoleId = id();
      const participantRoleId = id();

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      // Parse optional dates
      const amendmentCutoffDateTime = formData.amendmentCutoffDate 
        ? new Date(`${formData.amendmentCutoffDate}T${formData.amendmentCutoffTime}`)
        : undefined;
      const delegateNominationDateTime = formData.delegateNominationDeadline
        ? new Date(`${formData.delegateNominationDeadline}T${formData.delegateNominationTime}`)
        : undefined;
      const proposalSubmissionDateTime = formData.proposalSubmissionDeadline
        ? new Date(`${formData.proposalSubmissionDeadline}T${formData.proposalSubmissionTime}`)
        : undefined;
      const recurringEndDateTime = formData.recurringEndDate
        ? new Date(formData.recurringEndDate)
        : undefined;

      const transactions = [
        // Create the event
        tx.events[eventId].update({
          title: formData.title,
          description: formData.description || '',
          location: buildLocationString(),
          startDate: startDateTime,
          endDate: endDateTime,
          isPublic: formData.visibility === 'public',
          capacity: formData.capacity,
          createdAt: new Date(),
          updatedAt: new Date(),
          visibility: formData.visibility,
          participantListVisibility: formData.participantListVisibility,
          public_participants: formData.participantListVisibility === 'public',
          amendment_cutoff_date: amendmentCutoffDateTime,
          eventType: formData.eventType,
          delegatesFinalized: false,
          delegateAllocationMode: formData.eventType === 'delegate_conference' ? formData.delegateAllocationMode : undefined,
          totalDelegates: formData.eventType === 'delegate_conference' && formData.delegateAllocationMode === 'total' ? formData.totalDelegates : undefined,
          delegateRatio: formData.eventType === 'delegate_conference' && formData.delegateAllocationMode === 'ratio' ? formData.delegateRatio : undefined,
          
          // Recurring fields
          recurringPattern: formData.recurringPattern !== 'none' ? formData.recurringPattern : undefined,
          recurringInterval: formData.recurringPattern !== 'none' ? 1 : undefined,
          recurringEndDate: recurringEndDateTime,
          
          // Location fields
          locationType: formData.locationType || undefined,
          onlineMeetingLink: formData.locationType === 'online' ? formData.onlineMeetingLink : undefined,
          meetingCode: formData.locationType === 'online' ? formData.meetingCode : undefined,
          locationName: formData.locationType === 'physical' ? formData.locationName : undefined,
          street: formData.locationType === 'physical' ? formData.street : undefined,
          houseNumber: formData.locationType === 'physical' ? formData.houseNumber : undefined,
          postalCode: formData.locationType === 'physical' ? formData.postalCode : undefined,
          city: formData.locationType === 'physical' ? formData.city : undefined,
          
          // Deadline fields
          delegateNominationDeadline: delegateNominationDateTime,
          proposalSubmissionDeadline: proposalSubmissionDateTime,
        }),
        tx.events[eventId].link({ organizer: user.id, group: formData.groupId }),

        // Create Organizer role with admin permissions
        tx.roles[organizerRoleId].update({
          name: 'Organizer',
          scope: 'event',
          createdAt: new Date(),
        }),
        tx.roles[organizerRoleId].link({ event: eventId }),

        // Create Participant role with basic permissions
        tx.roles[participantRoleId].update({
          name: 'Participant',
          scope: 'event',
          createdAt: new Date(),
        }),
        tx.roles[participantRoleId].link({ event: eventId }),

        // Create participation for creator as Organizer
        tx.eventParticipants[participantId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.eventParticipants[participantId].link({
          user: user.id,
          event: eventId,
          role: organizerRoleId,
        }),
      ];

      // Add permissions/action rights for the Organizer role
      const organizerTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Organizer');
      if (organizerTemplate) {
        organizerTemplate.permissions.forEach(perm => {
          const actionRightId = id();
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: [organizerRoleId], event: eventId })
          );
        });
      }

      // Add permissions/action rights for the Participant role
      const participantTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Participant');
      if (participantTemplate) {
        participantTemplate.permissions.forEach(perm => {
          const actionRightId = id();
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: [participantRoleId], event: eventId })
          );
        });
      }

      // Add timeline event for public events
      if (formData.visibility === 'public') {
        transactions.push(
          createTimelineEvent({
            eventType: 'created',
            entityType: 'event',
            entityId: eventId,
            actorId: user.id,
            title: `New event created: ${formData.title}`,
            description: formData.description || 'A new event has been created',
          })
        );
      }

      // Get group members and send notifications
      const selectedGroup = userGroups.find(g => g.id === formData.groupId);
      if (selectedGroup) {
        // Query group memberships to get member IDs
        const { data: membersData } = await db.queryOnce({
          groupMemberships: {
            $: {
              where: {
                'group.id': formData.groupId,
                status: 'member',
              },
            },
            user: {},
          },
        });

        const memberUserIds = (membersData?.groupMemberships || [])
          .map((m: any) => m.user?.[0]?.id)
          .filter((id: string | undefined) => id && id !== user.id);

        // Send notifications to group members
        for (const memberId of memberUserIds) {
          const notificationTxs = notifyGroupEventCreated({
            senderId: user.id,
            recipientUserId: memberId,
            groupId: formData.groupId,
            groupName: selectedGroup.name || 'Unknown Group',
            eventId,
            eventTitle: formData.title,
          });
          transactions.push(...notificationTxs);
        }
      }

      await db.transact(transactions);

      toast.success(`Event ${t('pages.create.success.created')}`);
      setTimeout(() => {
        window.location.href = `/event/${eventId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error(t('pages.create.error.createFailed'));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('pages.create.event.title')}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                  <CarouselContent>
                    {/* Step 0: Basic Information */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-title">{t('pages.create.event.titleLabel')}</Label>
                          <Input
                            id="event-title"
                            placeholder={t('pages.create.event.titlePlaceholder')}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-description">{t('pages.create.event.descriptionLabel')}</Label>
                          <Textarea
                            id="event-description"
                            placeholder={t('pages.create.event.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 1: Date & Time + Recurring */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="event-start-date">{t('pages.create.event.startDate')}</Label>
                            <Input
                              id="event-start-date"
                              type="date"
                              value={formData.startDate}
                              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-start-time">{t('pages.create.event.startTime')}</Label>
                            <Input
                              id="event-start-time"
                              type="time"
                              value={formData.startTime}
                              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="event-end-date">{t('pages.create.event.endDate')}</Label>
                            <Input
                              id="event-end-date"
                              type="date"
                              value={formData.endDate}
                              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-end-time">{t('pages.create.event.endTime')}</Label>
                            <Input
                              id="event-end-time"
                              type="time"
                              value={formData.endTime}
                              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        {/* Recurring Pattern */}
                        <div className="space-y-3 pt-4 border-t">
                          <Label>{t('pages.create.event.recurring')}</Label>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {recurringPatternOptions.map(option => (
                              <Tooltip key={option.value}>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant={formData.recurringPattern === option.value ? 'default' : 'outline'}
                                    onClick={() => setFormData({ ...formData, recurringPattern: option.value as any })}
                                    className="flex items-center gap-2"
                                  >
                                    {formData.recurringPattern === option.value && (
                                      <Check className="h-4 w-4" />
                                    )}
                                    {option.label}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{option.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          
                          {formData.recurringPattern !== 'none' && (
                            <div className="space-y-2 pt-2">
                              <Label htmlFor="recurring-end">{t('pages.create.event.recurringEnds')}</Label>
                              <Input
                                id="recurring-end"
                                type="date"
                                value={formData.recurringEndDate}
                                onChange={e => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                min={formData.startDate}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 2: Group Selection */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-group">{t('pages.create.event.groupLabel')}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t('pages.create.event.groupDescription')}
                          </p>
                          <TypeAheadSelect
                            items={userGroups}
                            value={formData.groupId}
                            onChange={value => setFormData({ ...formData, groupId: value })}
                            placeholder={t('pages.create.common.searchGroup')}
                            searchKeys={['name', 'description']}
                            renderItem={group => <GroupSelectCard group={group} />}
                            getItemId={group => group.id}
                          />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 3: Event Type */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="space-y-2">
                          <Label>{t('pages.create.event.eventType')}</Label>
                          <RadioGroup
                            value={formData.eventType}
                            onValueChange={(value: typeof formData.eventType) =>
                              setFormData({ ...formData, eventType: value })
                            }
                          >
                            <div className="flex items-start space-x-2 rounded-lg border p-3">
                              <RadioGroupItem value="delegate_conference" id="delegate-conference" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="delegate-conference" className="cursor-pointer font-semibold">
                                  {t('pages.create.event.eventTypes.delegateConference')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {t('pages.create.event.eventTypes.delegateConferenceDesc')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2 rounded-lg border p-3">
                              <RadioGroupItem value="general_assembly" id="general-assembly" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="general-assembly" className="cursor-pointer font-semibold">
                                  {t('pages.create.event.eventTypes.generalAssembly')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {t('pages.create.event.eventTypes.generalAssemblyDesc')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2 rounded-lg border p-3">
                              <RadioGroupItem value="open_assembly" id="open-assembly" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="open-assembly" className="cursor-pointer font-semibold">
                                  {t('pages.create.event.eventTypes.openAssembly')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {t('pages.create.event.eventTypes.openAssemblyDesc')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2 rounded-lg border p-3">
                              <RadioGroupItem value="other" id="other" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="other" className="cursor-pointer font-semibold">
                                  {t('pages.create.event.eventTypes.other')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {t('pages.create.event.eventTypes.otherDesc')}
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Delegate Allocation Settings */}
                        {formData.eventType === 'delegate_conference' && (
                          <div className="space-y-3 rounded-lg border p-3 bg-muted/50">
                            <Label className="text-sm font-semibold">{t('pages.create.event.delegateAllocation')}</Label>
                            
                            <RadioGroup
                              value={formData.delegateAllocationMode}
                              onValueChange={(value: 'ratio' | 'total') =>
                                setFormData({ ...formData, delegateAllocationMode: value })
                              }
                            >
                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="ratio" id="mode-ratio" />
                                <div className="flex-1 space-y-2">
                                  <Label htmlFor="mode-ratio" className="cursor-pointer font-medium">
                                    {t('pages.create.event.delegateAllocationMode.ratio')}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {t('pages.create.event.delegateAllocationMode.ratioDesc')}
                                  </p>
                                  {formData.delegateAllocationMode === 'ratio' && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Label htmlFor="delegate-ratio" className="text-xs whitespace-nowrap">
                                        {t('pages.create.event.delegateAllocationMode.ratioLabel')}
                                      </Label>
                                      <Input
                                        id="delegate-ratio"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={formData.delegateRatio}
                                        onChange={e =>
                                          setFormData({
                                            ...formData,
                                            delegateRatio: parseInt(e.target.value) || 50,
                                          })
                                        }
                                        className="w-20"
                                      />
                                      <span className="text-xs text-muted-foreground">{t('pages.create.event.delegateAllocationMode.ratioMembers')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="total" id="mode-total" />
                                <div className="flex-1 space-y-2">
                                  <Label htmlFor="mode-total" className="cursor-pointer font-medium">
                                    {t('pages.create.event.delegateAllocationMode.total')}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {t('pages.create.event.delegateAllocationMode.totalDesc')}
                                  </p>
                                  {formData.delegateAllocationMode === 'total' && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Label htmlFor="total-delegates" className="text-xs">
                                        {t('pages.create.event.delegateAllocationMode.totalLabel')}
                                      </Label>
                                      <Input
                                        id="total-delegates"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={formData.totalDelegates}
                                        onChange={e =>
                                          setFormData({
                                            ...formData,
                                            totalDelegates: parseInt(e.target.value) || 10,
                                          })
                                        }
                                        className="w-20"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        {/* Delegate Conference Preview */}
                        {formData.eventType === 'delegate_conference' && formData.groupId && (
                          <div className="mt-4 space-y-3">
                            {!hasSubgroups ? (
                              <div className="flex items-start gap-2 rounded-lg border border-yellow-500/50 bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    {t('pages.create.event.noSubgroups')}
                                  </p>
                                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    {t('pages.create.event.noSubgroupsDesc')}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-semibold">{t('pages.create.event.delegatePreview')}</Label>
                                  <Badge variant="outline">
                                    {totalDelegatesCalc} {t('pages.create.event.delegates')}
                                  </Badge>
                                </div>
                                <div className="space-y-2 rounded-lg border p-3">
                                  {subgroups.map(subgroup => {
                                    const allocation = delegateAllocations.find(
                                      a => a.groupId === subgroup.id
                                    );
                                    return (
                                      <div
                                        key={subgroup.id}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <div>
                                          <span className="font-medium">{subgroup.name}</span>
                                          <span className="ml-2 text-muted-foreground">
                                            ({subgroup.memberCount} {t('pages.create.event.members')})
                                          </span>
                                        </div>
                                        <Badge variant="secondary">
                                          {allocation?.allocatedDelegates || 0} {t('pages.create.event.delegates')}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CarouselItem>

                    {/* Step 4: Location */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="space-y-3">
                          <Label>{t('pages.create.event.location')}</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {locationTypeOptions.map(option => {
                              const IconComponent = option.icon;
                              return (
                                <Button
                                  key={option.value}
                                  type="button"
                                  variant={formData.locationType === option.value ? 'default' : 'outline'}
                                  onClick={() => setFormData({ ...formData, locationType: option.value as any })}
                                  className="h-20 flex-col gap-2"
                                >
                                  <IconComponent className="h-6 w-6" />
                                  {option.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Online Meeting Fields */}
                        {formData.locationType === 'online' && (
                          <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="meeting-link">{t('pages.create.event.meetingLink')}</Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    id="meeting-link"
                                    type="url"
                                    placeholder={t('pages.create.event.meetingLinkPlaceholder')}
                                    value={formData.onlineMeetingLink}
                                    onChange={e => setFormData({ ...formData, onlineMeetingLink: e.target.value })}
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="meeting-code">{t('pages.create.event.accessCodeOptional')}</Label>
                              <Input
                                id="meeting-code"
                                placeholder="123456"
                                value={formData.meetingCode}
                                onChange={e => setFormData({ ...formData, meetingCode: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        {/* Physical Location Fields */}
                        {formData.locationType === 'physical' && (
                          <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="location-name">{t('pages.create.event.venueName')}</Label>
                              <Input
                                id="location-name"
                                placeholder={t('pages.create.event.venueNamePlaceholder')}
                                value={formData.locationName}
                                onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-4 grid-cols-3">
                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="street">{t('pages.create.event.street')}</Label>
                                <Input
                                  id="street"
                                  placeholder="Musterstraße"
                                  value={formData.street}
                                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="house-number">{t('pages.create.event.houseNumber')}</Label>
                                <Input
                                  id="house-number"
                                  placeholder="123"
                                  value={formData.houseNumber}
                                  onChange={e => setFormData({ ...formData, houseNumber: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="grid gap-4 grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor="postal-code">{t('pages.create.event.postalCode')}</Label>
                                <Input
                                  id="postal-code"
                                  placeholder="12345"
                                  value={formData.postalCode}
                                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                              </div>
                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="city">{t('pages.create.event.city')}</Label>
                                <Input
                                  id="city"
                                  placeholder="Musterstadt"
                                  value={formData.city}
                                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CarouselItem>

                    {/* Step 5: Deadlines */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="h-5 w-5" />
                          <Label className="text-lg font-semibold">{t('pages.create.event.deadlines')}</Label>
                        </div>

                        {/* Delegate Nomination Deadline */}
                        {formData.eventType === 'delegate_conference' && (
                          <div className="space-y-2 p-3 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                              <Label className="font-medium">{t('pages.create.event.delegateNominationDeadline')}</Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t('pages.create.event.delegateNominationDeadlineDesc')}
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                              <Input
                                type="date"
                                value={formData.delegateNominationDeadline}
                                onChange={e => setFormData({ ...formData, delegateNominationDeadline: e.target.value })}
                                max={formData.startDate}
                              />
                              <Input
                                type="time"
                                value={formData.delegateNominationTime}
                                onChange={e => setFormData({ ...formData, delegateNominationTime: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        {/* Proposal Submission Deadline */}
                        <div className="space-y-2 p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <Label className="font-medium">{t('pages.create.event.proposalSubmissionDeadline')}</Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t('pages.create.event.proposalSubmissionDeadlineDesc')}
                          </p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Input
                              type="date"
                              value={formData.proposalSubmissionDeadline}
                              onChange={e => setFormData({ ...formData, proposalSubmissionDeadline: e.target.value })}
                              max={formData.startDate}
                            />
                            <Input
                              type="time"
                              value={formData.proposalSubmissionTime}
                              onChange={e => setFormData({ ...formData, proposalSubmissionTime: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Amendment Cutoff */}
                        <div className="space-y-2 p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Label className="font-medium">{t('pages.create.event.amendmentCutoffDeadline')}</Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t('pages.create.event.amendmentCutoffDeadlineDesc')}
                          </p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Input
                              type="date"
                              value={formData.amendmentCutoffDate}
                              onChange={e => setFormData({ ...formData, amendmentCutoffDate: e.target.value })}
                              max={formData.startDate}
                            />
                            <Input
                              type="time"
                              value={formData.amendmentCutoffTime}
                              onChange={e => setFormData({ ...formData, amendmentCutoffTime: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 6: Settings / Visibility */}
                    <CarouselItem>
                      <div className="space-y-6 p-4">
                        {/* Event Visibility */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label>{t('pages.create.event.eventVisibility')}</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                  {visibilityOptions.find(opt => opt.value === formData.visibility)?.description}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {visibilityOptions.map(option => (
                              <Button
                                key={option.value}
                                type="button"
                                variant={formData.visibility === option.value ? 'default' : 'outline'}
                                onClick={() => setFormData({ ...formData, visibility: option.value })}
                                className="flex items-center gap-2"
                              >
                                {formData.visibility === option.value && (
                                  <Check className="h-4 w-4" />
                                )}
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Participant List Visibility */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label>{t('pages.create.event.participantListVisibility')}</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                  {t('pages.create.event.participantListVisibilityDesc')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {visibilityOptions.map(option => (
                              <Button
                                key={option.value}
                                type="button"
                                variant={formData.participantListVisibility === option.value ? 'default' : 'outline'}
                                onClick={() => setFormData({ ...formData, participantListVisibility: option.value })}
                                className="flex items-center gap-2"
                              >
                                {formData.participantListVisibility === option.value && (
                                  <Check className="h-4 w-4" />
                                )}
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                          <Label htmlFor="event-capacity">{t('pages.create.event.maxParticipants')}</Label>
                          <Input
                            id="event-capacity"
                            type="number"
                            min="1"
                            placeholder={t('pages.create.event.maxParticipantsPlaceholder')}
                            value={formData.capacity}
                            onChange={e =>
                              setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })
                            }
                            required
                          />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 7: Review */}
                    <CarouselItem>
                      <div className="p-4">
                        <Card className="overflow-hidden border-2 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50">
                          <CardHeader>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge variant="default" className="text-xs">
                                {formData.eventType === 'delegate_conference' && t('pages.create.event.eventTypes.delegateConference')}
                                {formData.eventType === 'general_assembly' && t('pages.create.event.eventTypes.generalAssembly')}
                                {formData.eventType === 'open_assembly' && t('pages.create.event.eventTypes.openAssembly')}
                                {formData.eventType === 'other' && t('pages.create.event.eventTypes.other')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {formData.visibility === 'public' && t('pages.create.common.public')}
                                {formData.visibility === 'authenticated' && t('pages.create.common.authenticated')}
                                {formData.visibility === 'private' && t('pages.create.common.private')}
                              </Badge>
                              {formData.recurringPattern !== 'none' && (
                                <Badge variant="secondary" className="text-xs">
                                  {recurringPatternOptions.find(r => r.value === formData.recurringPattern)?.label}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">
                              {formData.title || t('pages.create.event.untitledEvent')}
                            </CardTitle>
                            {formData.description && (
                              <CardDescription>{formData.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Location */}
                            {formData.locationType && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {formData.locationType === 'online' ? (
                                  <>
                                    <Video className="h-4 w-4" />
                                    <span>{formData.onlineMeetingLink || t('pages.create.event.onlineMeeting')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Building2 className="h-4 w-4" />
                                    <span>
                                      {[
                                        formData.locationName,
                                        formData.street && formData.houseNumber 
                                          ? `${formData.street} ${formData.houseNumber}` 
                                          : formData.street,
                                        formData.postalCode && formData.city 
                                          ? `${formData.postalCode} ${formData.city}` 
                                          : formData.city,
                                      ].filter(Boolean).join(', ') || t('pages.create.event.inPerson')}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {/* Date & Time */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formData.startDate} um {formData.startTime}
                              </span>
                            </div>
                            {formData.endDate && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {t('pages.create.event.ends')} {formData.endDate} um {formData.endTime}
                                </span>
                              </div>
                            )}
                            
                            {/* Capacity */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{t('pages.create.event.max')} {formData.capacity} {t('pages.create.event.participants')}</span>
                            </div>

                            {/* Deadlines */}
                            {formData.delegateNominationDeadline && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserCheck className="h-4 w-4" />
                                <span>
                                  {t('pages.create.event.delegateNomination')}: {formData.delegateNominationDeadline} {formData.delegateNominationTime}
                                </span>
                              </div>
                            )}
                            {formData.proposalSubmissionDeadline && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>
                                  {t('pages.create.event.proposalSubmission')}: {formData.proposalSubmissionDeadline} {formData.proposalSubmissionTime}
                                </span>
                              </div>
                            )}
                            {formData.amendmentCutoffDate && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {t('pages.create.event.amendmentCutoff')}: {formData.amendmentCutoffDate} {formData.amendmentCutoffTime}
                                </span>
                              </div>
                            )}

                            {/* Participant List Visibility */}
                            <Badge variant="outline" className="text-xs">
                              {t('pages.create.event.participantList')} {formData.participantListVisibility === 'public' ? t('pages.create.common.public') : formData.participantListVisibility === 'authenticated' ? t('pages.create.common.authenticated') : t('pages.create.common.private')}
                            </Badge>

                            {/* Group */}
                            {formData.groupId && (
                              <p className="text-xs text-muted-foreground">
                                {t('pages.create.event.organizedBy').replace('{{group}}', userGroups.find(g => g.id === formData.groupId)?.name || t('pages.create.event.unknownGroup'))}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        currentStep === index ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                      aria-label={t('pages.create.goToStep').replace('{{step}}', String(index + 1))}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => carouselApi?.scrollPrev()}
                  disabled={currentStep === 0}
                >
                  {t('pages.create.common.previous')}
                </Button>
                {currentStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    onClick={() => carouselApi?.scrollNext()}
                    disabled={currentStep === 0 && !formData.title}
                  >
                    {t('pages.create.common.next')}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('pages.create.common.creating') : t('pages.create.event.createButton')}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </TooltipProvider>
      </PageWrapper>
    </AuthGuard>
  );
}

export default function CreateEventPage() {
  const { t } = useTranslation();
  
  return (
    <Suspense
      fallback={
        <PageWrapper className="flex min-h-screen items-center justify-center p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('pages.create.loading')}</CardTitle>
            </CardHeader>
          </Card>
        </PageWrapper>
      }
    >
      <CreateEventForm />
    </Suspense>
  );
}
