'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
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
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { TypeSelector } from '@/components/ui/type-selector';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  EventSelectCard,
  AmendmentSelectCard,
  PositionSelectCard,
} from '@/components/ui/entity-select-cards';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import {
  useAllEvents,
  useAllAmendments,
  usePositionsWithGroups,
} from '@/zero/events/useEventState';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { notifyAgendaItemCreated } from '@/utils/notification-helpers';

export function CreateAgendaItemForm() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });
  const { user } = useAuth();
  const { createAgendaItem, createElection } = useAgendaActions();

  const eventIdParam = searchParams.eventId as string | undefined;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'discussion' as 'election' | 'vote' | 'speech' | 'discussion',
    order: 1,
    duration: '',
    eventId: eventIdParam || '',
    amendmentId: '', // For vote type
    positionId: '', // For election type
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentStep(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Query available events for the dropdown
  const { events: userEvents } = useAllEvents();

  // Query available amendments for the dropdown (when type is vote)
  const { amendments: userAmendments } = useAllAmendments();

  // Query available positions for the dropdown (when type is election)
  const { positions: userPositions } = usePositionsWithGroups();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an agenda item');
        setIsSubmitting(false);
        return;
      }

      if (!formData.eventId) {
        toast.error('Please select an event for this agenda item');
        setIsSubmitting(false);
        return;
      }

      const agendaItemId = crypto.randomUUID();

      // Create the agenda item
      await createAgendaItem({
        id: agendaItemId,
        title: formData.title,
        description: formData.description || '',
        type: formData.type,
        order_index: formData.order,
        duration: formData.duration ? parseInt(formData.duration) : 0,
        status: 'pending',
        forwarding_status: '',
        scheduled_time: '',
        start_time: 0,
        end_time: 0,
        activated_at: 0,
        completed_at: 0,
        event_id: formData.eventId,
        amendment_id: formData.amendmentId || '',
      });

      // If creating an election, also create the election entity
      if (formData.type === 'election') {
        const electionId = crypto.randomUUID();
        await createElection({
          id: electionId,
          title: formData.title,
          description: formData.description || '',
          majority_type: 'relative',
          is_multiple_choice: false,
          max_selections: 1,
          status: 'pending',
          voting_start_time: 0,
          voting_end_time: 0,
          agenda_item_id: agendaItemId,
          position_id: formData.positionId || '',
          amendment_id: null,
        });
      }

      // Send notification to event participants
      const selectedEvent = userEvents.find((e: any) => e.id === formData.eventId);
      await notifyAgendaItemCreated({
        senderId: user.id,
        eventId: formData.eventId,
        eventTitle: selectedEvent?.title || 'Event',
        agendaItemTitle: formData.title,
      });

      await Promise.resolve(); // mutations already committed above

      toast.success('Agenda item created successfully!');
      navigate({ to: `/event/${formData.eventId}/agenda` });
    } catch (error) {
      console.error('Failed to create agenda item:', error);
      toast.error('Failed to create agenda item. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Agenda Item</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
            <CarouselContent>
              {/* Step 1: Basic Information */}
              <CarouselItem>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="agenda-event">Event</Label>
                    <TypeAheadSelect
                      items={userEvents}
                      value={formData.eventId}
                      onChange={value => setFormData({ ...formData, eventId: value })}
                      placeholder="Search for an event..."
                      searchKeys={['title', 'description', 'location_name']}
                      renderItem={event => <EventSelectCard event={event} />}
                      getItemId={event => event.id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agenda-title">Title</Label>
                    <Input
                      id="agenda-title"
                      placeholder="Enter agenda item title"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agenda-description">Description</Label>
                    <Textarea
                      id="agenda-description"
                      placeholder="Describe this agenda item (optional)"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </CarouselItem>

              {/* Step 2: Type & Settings */}
              <CarouselItem>
                <div className="space-y-4 p-4">
                  <TooltipProvider>
                    <TypeSelector
                      value={formData.type}
                      onChange={type => setFormData({ ...formData, type })}
                    />
                  </TooltipProvider>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="agenda-order">Order</Label>
                      <Input
                        id="agenda-order"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.order}
                        onChange={e =>
                          setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agenda-duration">Duration (minutes)</Label>
                      <Input
                        id="agenda-duration"
                        type="number"
                        min="1"
                        placeholder="Optional"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Step 3: Additional Links */}
              <CarouselItem>
                <div className="space-y-4 p-4">
                  {formData.type === 'vote' && (
                    <div className="space-y-2">
                      <Label htmlFor="agenda-amendment">Amendment (optional)</Label>
                      <TypeAheadSelect
                        items={userAmendments}
                        value={formData.amendmentId}
                        onChange={value => setFormData({ ...formData, amendmentId: value })}
                        placeholder="Search for an amendment..."
                        searchKeys={['title', 'reason']}
                        renderItem={amendment => <AmendmentSelectCard amendment={amendment} />}
                        getItemId={amendment => amendment.id}
                      />
                    </div>
                  )}
                  {formData.type === 'election' && (
                    <div className="space-y-2">
                      <Label htmlFor="agenda-position">Position (optional)</Label>
                      <TypeAheadSelect
                        items={userPositions}
                        value={formData.positionId}
                        onChange={value => setFormData({ ...formData, positionId: value })}
                        placeholder="Search for a position..."
                        searchKeys={['title', 'description']}
                        renderItem={position => <PositionSelectCard position={position} />}
                        getItemId={position => position.id}
                      />
                    </div>
                  )}
                  {formData.type !== 'vote' && formData.type !== 'election' && (
                    <div className="text-muted-foreground py-8 text-center">
                      No additional configuration needed for this agenda item type.
                    </div>
                  )}
                </div>
              </CarouselItem>

              {/* Step 4: Review */}
              <CarouselItem>
                <div className="p-4">
                  <Card className="overflow-hidden border-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50">
                    <CardHeader>
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="default" className="text-xs">
                          Agenda Item
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formData.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {formData.title || 'Untitled Agenda Item'}
                      </CardTitle>
                      {formData.description && (
                        <CardDescription>{formData.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <strong>Event:</strong>
                        <span className="text-muted-foreground">
                          {userEvents.find(e => e.id === formData.eventId)?.title || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <strong>Order:</strong>
                        <span className="text-muted-foreground">#{formData.order}</span>
                      </div>
                      {formData.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <strong>Duration:</strong>
                          <span className="text-muted-foreground">{formData.duration} minutes</span>
                        </div>
                      )}
                      {formData.amendmentId && (
                        <div className="flex items-center gap-2 text-sm">
                          <strong>Amendment:</strong>
                          <span className="text-muted-foreground">
                            {userAmendments.find(a => a.id === formData.amendmentId)?.title}
                          </span>
                        </div>
                      )}
                      {formData.positionId && (
                        <div className="flex items-center gap-2 text-sm">
                          <strong>Position:</strong>
                          <span className="text-muted-foreground">
                            {userPositions.find(p => p.id === formData.positionId)?.title}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3].map(index => (
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
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={() => carouselApi?.scrollNext()}
              disabled={currentStep === 0 && !formData.title}
            >
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Agenda Item'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}
