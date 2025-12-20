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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { Calendar, MapPin, Clock, Users, AlertCircle } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { GroupSelectCard } from '@/components/ui/entity-select-cards';
import { useSearchParams } from 'next/navigation';
import { getDirectSubgroups, calculateDelegateAllocations } from '@/utils/delegate-calculations';

function CreateEventForm() {
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get('groupId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00',
    capacity: 50,
    isPublic: true,
    groupId: groupIdParam || '',
    visibility: 'public' as 'public' | 'authenticated' | 'private',
    publicParticipants: false,
    amendmentCutoffDate: new Date().toISOString().split('T')[0],
    amendmentCutoffTime: '23:59',
    eventType: 'other' as 'delegate_conference' | 'open_assembly' | 'general_assembly' | 'other',
    delegateAllocationMode: 'ratio' as 'ratio' | 'total',
    totalDelegates: 10,
    delegateRatio: 50, // 1 delegate per 50 members
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const user = useAuthStore(state => state.user);

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
          // Deduplicate by childGroup.id - a childGroup can have multiple relationships with different rights
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
  
  // Calculate total delegates based on allocation mode
  const totalDelegates = formData.eventType === 'delegate_conference' && hasSubgroups
    ? formData.delegateAllocationMode === 'total'
      ? formData.totalDelegates
      : Math.max(1, Math.floor(totalMembers / formData.delegateRatio))
    : 0;
  
  const delegateAllocations = formData.eventType === 'delegate_conference' && hasSubgroups
    ? calculateDelegateAllocations(
        subgroups.map(g => ({ id: g.id, memberCount: g.memberCount })),
        totalDelegates
      )
    : [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an event');
        setIsSubmitting(false);
        return;
      }

      if (!formData.groupId) {
        toast.error('Please select a group for this event');
        setIsSubmitting(false);
        return;
      }

      const eventId = id();
      const participantId = id();
      const organizerRoleId = id();
      const participantRoleId = id();

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const amendmentCutoffDateTime = new Date(`${formData.amendmentCutoffDate}T${formData.amendmentCutoffTime}`);

      await db.transact([
        // Create the event
        tx.events[eventId].update({
          title: formData.title,
          description: formData.description || '',
          location: formData.location || '',
          startDate: startDateTime,
          endDate: endDateTime,
          isPublic: formData.isPublic,
          capacity: formData.capacity,
          createdAt: new Date(),
          updatedAt: new Date(),
          visibility: formData.visibility,
          public_participants: formData.publicParticipants,
          amendment_cutoff_date: amendmentCutoffDateTime,
          eventType: formData.eventType,
          delegatesFinalized: false,
          delegateAllocationMode: formData.eventType === 'delegate_conference' ? formData.delegateAllocationMode : undefined,
          totalDelegates: formData.eventType === 'delegate_conference' && formData.delegateAllocationMode === 'total' ? formData.totalDelegates : undefined,
          delegateRatio: formData.eventType === 'delegate_conference' && formData.delegateAllocationMode === 'ratio' ? formData.delegateRatio : undefined,
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
      ]);

      toast.success('Event created successfully!');
      setTimeout(() => {
        window.location.href = `/event/${eventId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Basic Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Event Title</Label>
                        <Input
                          id="event-title"
                          placeholder="Enter event title"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-description">Description</Label>
                        <Textarea
                          id="event-description"
                          placeholder="Describe the purpose of this event"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Group & Location */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-group">Group</Label>
                        <TypeAheadSelect
                          items={userGroups}
                          value={formData.groupId}
                          onChange={value => setFormData({ ...formData, groupId: value })}
                          placeholder="Search for a group..."
                          searchKeys={['name', 'description']}
                          renderItem={group => <GroupSelectCard group={group} />}
                          getItemId={group => group.id}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-location">Location</Label>
                        <Input
                          id="event-location"
                          placeholder="Physical address or virtual meeting link"
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Event Type */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label>Event Type</Label>
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
                                Delegate Conference
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Subgroups send proportional delegates based on member counts
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="general_assembly" id="general-assembly" />
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="general-assembly" className="cursor-pointer font-semibold">
                                General Assembly
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                All members of the associated group can participate
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="open_assembly" id="open-assembly" />
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="open-assembly" className="cursor-pointer font-semibold">
                                Open Assembly
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Anyone can register to participate
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="other" id="other" />
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="other" className="cursor-pointer font-semibold">
                                Other
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Standard event with custom participation rules
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Delegate Allocation Settings */}
                      {formData.eventType === 'delegate_conference' && (
                        <div className="space-y-3 rounded-lg border p-3 bg-muted/50">
                          <Label className="text-sm font-semibold">Delegate Allocation</Label>
                          
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
                                  Members per Delegate
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Proportional allocation based on member counts
                                </p>
                                {formData.delegateAllocationMode === 'ratio' && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Label htmlFor="delegate-ratio" className="text-xs whitespace-nowrap">
                                      1 delegate per
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
                                    <span className="text-xs text-muted-foreground">members</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <RadioGroupItem value="total" id="mode-total" />
                              <div className="flex-1 space-y-2">
                                <Label htmlFor="mode-total" className="cursor-pointer font-medium">
                                  Fixed Total
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Set a fixed number of total delegates
                                </p>
                                {formData.delegateAllocationMode === 'total' && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Label htmlFor="total-delegates" className="text-xs">
                                      Total delegates:
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
                                  No subgroups found
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                  The selected group has no subgroups. Delegate conferences require
                                  subgroups to allocate delegates.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">Delegate Allocation Preview</Label>
                                <Badge variant="outline">
                                  {totalDelegates} total delegates
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
                                          ({subgroup.memberCount} members)
                                        </span>
                                      </div>
                                      <Badge variant="secondary">
                                        {allocation?.allocatedDelegates || 0} delegates
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formData.delegateAllocationMode === 'ratio'
                                  ? `Based on 1 delegate per ${formData.delegateRatio} members. `
                                  : `Fixed total of ${formData.totalDelegates} delegates distributed proportionally. `}
                                Subgroups can nominate more candidates than allocated. Final allocation happens at event start.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CarouselItem>

                  {/* Step 3: Date & Time */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="event-start-date">Start Date</Label>
                          <Input
                            id="event-start-date"
                            type="date"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-start-time">Start Time</Label>
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
                          <Label htmlFor="event-end-date">End Date</Label>
                          <Input
                            id="event-end-date"
                            type="date"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-end-time">End Time</Label>
                          <Input
                            id="event-end-time"
                            type="time"
                            value={formData.endTime}
                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 5: Settings */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-capacity">Event Capacity</Label>
                        <Input
                          id="event-capacity"
                          type="number"
                          min="1"
                          placeholder="Maximum number of participants"
                          value={formData.capacity}
                          onChange={e =>
                            setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="cutoff-date">Amendment Cutoff Date</Label>
                          <Input
                            id="cutoff-date"
                            type="date"
                            value={formData.amendmentCutoffDate}
                            onChange={e => setFormData({ ...formData, amendmentCutoffDate: e.target.value })}
                            max={formData.startDate}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cutoff-time">Cutoff Time</Label>
                          <Input
                            id="cutoff-time"
                            type="time"
                            value={formData.amendmentCutoffTime}
                            onChange={e => setFormData({ ...formData, amendmentCutoffTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="event-public"
                          checked={formData.isPublic}
                          onCheckedChange={checked =>
                            setFormData({ ...formData, isPublic: checked })
                          }
                        />
                        <Label htmlFor="event-public" className="cursor-pointer">
                          Make this event public
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="public-participants"
                          checked={formData.publicParticipants}
                          onCheckedChange={checked =>
                            setFormData({ ...formData, publicParticipants: checked })
                          }
                        />
                        <Label htmlFor="public-participants" className="cursor-pointer">
                          Make participant list public
                        </Label>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 6: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              {formData.eventType === 'delegate_conference' && 'Delegate Conference'}
                              {formData.eventType === 'general_assembly' && 'General Assembly'}
                              {formData.eventType === 'open_assembly' && 'Open Assembly'}
                              {formData.eventType === 'other' && 'Event'}
                            </Badge>
                            {formData.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                Public
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">
                            {formData.title || 'Untitled Event'}
                          </CardTitle>
                          {formData.description && (
                            <CardDescription>{formData.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {formData.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{formData.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formData.startDate} at {formData.startTime}
                            </span>
                          </div>
                          {formData.endDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                Ends: {formData.endDate} at {formData.endTime}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Max {formData.capacity} participants</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Amendment deadline: {formData.amendmentCutoffDate} at {formData.amendmentCutoffTime}
                            </span>
                          </div>
                          {formData.publicParticipants && (
                            <Badge variant="outline" className="text-xs">
                              Public Participant List
                            </Badge>
                          )}
                          {formData.groupId && (
                            <p className="text-xs text-muted-foreground">
                              Organized by{' '}
                              {userGroups.find(g => g.id === formData.groupId)?.name ||
                                'Unknown Group'}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
              <div className="mt-4 flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map(index => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      currentStep === index ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
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
                Previous
              </Button>
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={() => carouselApi?.scrollNext()}
                  disabled={currentStep === 0 && !formData.title}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
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
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        </PageWrapper>
      }
    >
      <CreateEventForm />
    </Suspense>
  );
}
