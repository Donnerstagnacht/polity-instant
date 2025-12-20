'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  EventSelectCard,
  AmendmentSelectCard,
  PositionSelectCard,
} from '@/components/ui/entity-select-cards';
import { db, tx, id } from 'db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

function CreateAgendaItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore(state => state.user);

  const eventIdParam = searchParams.get('eventId');

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
  const { data: eventsData } = db.useQuery({
    events: {},
  });

  // Query available amendments for the dropdown (when type is vote)
  const { data: amendmentsData } = db.useQuery({
    amendments: {},
  });

  // Query available positions for the dropdown (when type is election)
  const { data: positionsData } = db.useQuery({
    positions: {
      group: {},
    },
  });

  const userEvents = eventsData?.events || [];
  const userAmendments = amendmentsData?.amendments || [];
  const userPositions = positionsData?.positions || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const agendaItemId = id();
      const now = new Date();

      const transactions = [
        tx.agendaItems[agendaItemId].update({
          title: formData.title,
          description: formData.description || '',
          type: formData.type,
          order: formData.order,
          duration: formData.duration ? parseInt(formData.duration) : null,
          status: 'pending',
          startTime: null,
          endTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.agendaItems[agendaItemId].link({
          event: formData.eventId,
          creator: user.id,
        }),
      ];

      // If creating an election, also create the election entity
      if (formData.type === 'election') {
        const electionId = id();
        const electionTx = tx.elections[electionId]
          .update({
            title: formData.title,
            description: formData.description || '',
            majorityType: 'relative',
            isMultipleChoice: false,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          })
          .link({ agendaItem: agendaItemId });

        // Link to position if selected
        if (formData.positionId) {
          electionTx.link({ position: formData.positionId });
        }

        transactions.push(electionTx);
      }

      await db.transact(transactions);

      toast.success('Agenda item created successfully!');
      router.push(`/event/${formData.eventId}/agenda`);
    } catch (error) {
      console.error('Failed to create agenda item:', error);
      toast.error('Failed to create agenda item. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Agenda Item</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
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
                          searchKeys={['title', 'description', 'location']}
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
                      <div className="space-y-2">
                        <Label htmlFor="agenda-type">Type</Label>
                        <select
                          id="agenda-type"
                          value={formData.type}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              type: e.target.value as typeof formData.type,
                            })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          required
                        >
                          <option value="discussion">Discussion</option>
                          <option value="speech">Speech</option>
                          <option value="election">Election</option>
                          <option value="vote">Vote</option>
                        </select>
                      </div>
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
                            searchKeys={['title', 'subtitle']}
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
                        <div className="py-8 text-center text-muted-foreground">
                          No additional configuration needed for this agenda item type.
                        </div>
                      )}
                    </div>
                  </CarouselItem>

                  {/* Step 4: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/40 dark:to-yellow-900/50">
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
                              {userEvents.find(e => e.id === formData.eventId)?.title ||
                                'Not selected'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Order:</strong>
                            <span className="text-muted-foreground">#{formData.order}</span>
                          </div>
                          {formData.duration && (
                            <div className="flex items-center gap-2 text-sm">
                              <strong>Duration:</strong>
                              <span className="text-muted-foreground">
                                {formData.duration} minutes
                              </span>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Agenda Item'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}

export default function CreateAgendaItemPage() {
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
      <CreateAgendaItemForm />
    </Suspense>
  );
}
