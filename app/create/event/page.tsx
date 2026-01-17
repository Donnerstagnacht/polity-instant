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

// Recurring pattern options
const recurringPatternOptions = [
  { value: 'none', label: 'Einmalig', description: 'Das Event findet nur einmal statt' },
  { value: 'daily', label: 'Täglich', description: 'Wiederholung jeden Tag' },
  { value: 'weekly', label: 'Wöchentlich', description: 'Wiederholung jede Woche' },
  { value: 'monthly', label: 'Monatlich', description: 'Wiederholung jeden Monat' },
  { value: 'yearly', label: 'Jährlich', description: 'Wiederholung jedes Jahr' },
  { value: 'four-yearly', label: '4 Jährig', description: 'Wiederholung alle 4 Jahre' },
];

// Visibility options (reused pattern from create group)
const visibilityOptions = [
  {
    value: 'public' as const,
    label: 'Public',
    description: 'Jeder kann dieses Event sehen',
  },
  {
    value: 'authenticated' as const,
    label: 'Authenticated',
    description: 'Nur eingeloggte Nutzer können dieses Event sehen',
  },
  {
    value: 'private' as const,
    label: 'Private',
    description: 'Nur Teilnehmer können dieses Event sehen',
  },
];

// Location type options
const locationTypeOptions = [
  { value: 'online', label: 'Online', icon: Video },
  { value: 'physical', label: 'Vor Ort', icon: Building2 },
];

function CreateEventForm() {
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get('groupId');

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
        toast.error('Du musst eingeloggt sein, um ein Event zu erstellen');
        setIsSubmitting(false);
        return;
      }

      if (!formData.groupId) {
        toast.error('Bitte wähle eine Gruppe für dieses Event');
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

      toast.success('Event erfolgreich erstellt!');
      setTimeout(() => {
        window.location.href = `/event/${eventId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Fehler beim Erstellen des Events. Bitte versuche es erneut.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Neues Event erstellen</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                  <CarouselContent>
                    {/* Step 0: Basic Information */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-title">Event Titel</Label>
                          <Input
                            id="event-title"
                            placeholder="Gib einen Titel ein"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-description">Beschreibung</Label>
                          <Textarea
                            id="event-description"
                            placeholder="Beschreibe den Zweck dieses Events"
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
                            <Label htmlFor="event-start-date">Startdatum</Label>
                            <Input
                              id="event-start-date"
                              type="date"
                              value={formData.startDate}
                              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-start-time">Startzeit</Label>
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
                            <Label htmlFor="event-end-date">Enddatum</Label>
                            <Input
                              id="event-end-date"
                              type="date"
                              value={formData.endDate}
                              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-end-time">Endzeit</Label>
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
                          <Label>Wiederholung</Label>
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
                              <Label htmlFor="recurring-end">Wiederholung endet am</Label>
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
                          <Label htmlFor="event-group">Gruppe</Label>
                          <p className="text-sm text-muted-foreground">
                            Wähle die Gruppe, die dieses Event organisiert
                          </p>
                          <TypeAheadSelect
                            items={userGroups}
                            value={formData.groupId}
                            onChange={value => setFormData({ ...formData, groupId: value })}
                            placeholder="Suche nach einer Gruppe..."
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
                          <Label>Event Typ</Label>
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
                                  Delegiertenkonferenz
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Untergruppen senden proportionale Delegierte basierend auf Mitgliederzahlen
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2 rounded-lg border p-3">
                              <RadioGroupItem value="general_assembly" id="general-assembly" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="general-assembly" className="cursor-pointer font-semibold">
                                  Mitgliederversammlung
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Alle Mitglieder der zugehörigen Gruppe können teilnehmen
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2 rounded-lg border p-3">
                              <RadioGroupItem value="open_assembly" id="open-assembly" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="open-assembly" className="cursor-pointer font-semibold">
                                  Offene Versammlung
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Jeder kann sich zur Teilnahme registrieren
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2 rounded-lg border p-3">
                              <RadioGroupItem value="other" id="other" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="other" className="cursor-pointer font-semibold">
                                  Sonstiges
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Standard-Event mit individuellen Teilnahmeregeln
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Delegate Allocation Settings */}
                        {formData.eventType === 'delegate_conference' && (
                          <div className="space-y-3 rounded-lg border p-3 bg-muted/50">
                            <Label className="text-sm font-semibold">Delegiertenzuweisung</Label>
                            
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
                                    Mitglieder pro Delegierter
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Proportionale Zuweisung basierend auf Mitgliederzahlen
                                  </p>
                                  {formData.delegateAllocationMode === 'ratio' && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Label htmlFor="delegate-ratio" className="text-xs whitespace-nowrap">
                                        1 Delegierter pro
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
                                      <span className="text-xs text-muted-foreground">Mitglieder</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="total" id="mode-total" />
                                <div className="flex-1 space-y-2">
                                  <Label htmlFor="mode-total" className="cursor-pointer font-medium">
                                    Feste Anzahl
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Feste Gesamtzahl an Delegierten festlegen
                                  </p>
                                  {formData.delegateAllocationMode === 'total' && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Label htmlFor="total-delegates" className="text-xs">
                                        Gesamte Delegierte:
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
                                    Keine Untergruppen gefunden
                                  </p>
                                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    Die ausgewählte Gruppe hat keine Untergruppen. Delegiertenkonferenzen benötigen
                                    Untergruppen zur Zuweisung von Delegierten.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-semibold">Delegiertenzuweisung Vorschau</Label>
                                  <Badge variant="outline">
                                    {totalDelegatesCalc} Delegierte gesamt
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
                                            ({subgroup.memberCount} Mitglieder)
                                          </span>
                                        </div>
                                        <Badge variant="secondary">
                                          {allocation?.allocatedDelegates || 0} Delegierte
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
                          <Label>Veranstaltungsort</Label>
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
                              <Label htmlFor="meeting-link">Meeting Link</Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    id="meeting-link"
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    value={formData.onlineMeetingLink}
                                    onChange={e => setFormData({ ...formData, onlineMeetingLink: e.target.value })}
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="meeting-code">Zugangscode (optional)</Label>
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
                              <Label htmlFor="location-name">Name des Veranstaltungsortes</Label>
                              <Input
                                id="location-name"
                                placeholder="z.B. Rathaus, Bürgerzentrum"
                                value={formData.locationName}
                                onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-4 grid-cols-3">
                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="street">Straße</Label>
                                <Input
                                  id="street"
                                  placeholder="Musterstraße"
                                  value={formData.street}
                                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="house-number">Hausnummer</Label>
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
                                <Label htmlFor="postal-code">Postleitzahl</Label>
                                <Input
                                  id="postal-code"
                                  placeholder="12345"
                                  value={formData.postalCode}
                                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                              </div>
                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="city">Ort</Label>
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
                          <Label className="text-lg font-semibold">Fristen</Label>
                        </div>

                        {/* Delegate Nomination Deadline */}
                        {formData.eventType === 'delegate_conference' && (
                          <div className="space-y-2 p-3 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                              <Label className="font-medium">Frist für Delegiertennominierung</Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Bis wann können Untergruppen ihre Delegierten nominieren?
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
                            <Label className="font-medium">Frist für Antragseingabe</Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Bis wann können Anträge eingereicht werden?
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
                            <Label className="font-medium">Änderungsantrags-Frist</Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Bis wann können Änderungsanträge zu bestehenden Anträgen eingereicht werden?
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
                            <Label>Event Sichtbarkeit</Label>
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
                            <Label>Teilnehmerliste Sichtbarkeit</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                  Wer kann die Liste der Teilnehmer sehen?
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
                          <Label htmlFor="event-capacity">Maximale Teilnehmerzahl</Label>
                          <Input
                            id="event-capacity"
                            type="number"
                            min="1"
                            placeholder="Maximale Anzahl der Teilnehmer"
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
                                {formData.eventType === 'delegate_conference' && 'Delegiertenkonferenz'}
                                {formData.eventType === 'general_assembly' && 'Mitgliederversammlung'}
                                {formData.eventType === 'open_assembly' && 'Offene Versammlung'}
                                {formData.eventType === 'other' && 'Event'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {formData.visibility === 'public' && 'Öffentlich'}
                                {formData.visibility === 'authenticated' && 'Nur Eingeloggte'}
                                {formData.visibility === 'private' && 'Privat'}
                              </Badge>
                              {formData.recurringPattern !== 'none' && (
                                <Badge variant="secondary" className="text-xs">
                                  {recurringPatternOptions.find(r => r.value === formData.recurringPattern)?.label}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">
                              {formData.title || 'Unbenanntes Event'}
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
                                    <span>{formData.onlineMeetingLink || 'Online Meeting'}</span>
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
                                      ].filter(Boolean).join(', ') || 'Vor Ort'}
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
                                  Endet: {formData.endDate} um {formData.endTime}
                                </span>
                              </div>
                            )}
                            
                            {/* Capacity */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>Max. {formData.capacity} Teilnehmer</span>
                            </div>

                            {/* Deadlines */}
                            {formData.delegateNominationDeadline && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserCheck className="h-4 w-4" />
                                <span>
                                  Delegiertennominierung: {formData.delegateNominationDeadline} {formData.delegateNominationTime}
                                </span>
                              </div>
                            )}
                            {formData.proposalSubmissionDeadline && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>
                                  Antragseingabe: {formData.proposalSubmissionDeadline} {formData.proposalSubmissionTime}
                                </span>
                              </div>
                            )}
                            {formData.amendmentCutoffDate && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Änderungsanträge: {formData.amendmentCutoffDate} {formData.amendmentCutoffTime}
                                </span>
                              </div>
                            )}

                            {/* Participant List Visibility */}
                            <Badge variant="outline" className="text-xs">
                              Teilnehmerliste: {formData.participantListVisibility === 'public' ? 'Öffentlich' : formData.participantListVisibility === 'authenticated' ? 'Nur Eingeloggte' : 'Privat'}
                            </Badge>

                            {/* Group */}
                            {formData.groupId && (
                              <p className="text-xs text-muted-foreground">
                                Organisiert von{' '}
                                {userGroups.find(g => g.id === formData.groupId)?.name || 'Unbekannte Gruppe'}
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
                      aria-label={`Gehe zu Schritt ${index + 1}`}
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
                  Zurück
                </Button>
                {currentStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    onClick={() => carouselApi?.scrollNext()}
                    disabled={currentStep === 0 && !formData.title}
                  >
                    Weiter
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird erstellt...' : 'Event erstellen'}
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
  return (
    <Suspense
      fallback={
        <PageWrapper className="flex min-h-screen items-center justify-center p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Laden...</CardTitle>
            </CardHeader>
          </Card>
        </PageWrapper>
      }
    >
      <CreateEventForm />
    </Suspense>
  );
}
