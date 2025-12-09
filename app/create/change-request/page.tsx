'use client';

import { useState, useEffect } from 'react';
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
import { AmendmentVoteSelectCard } from '@/components/ui/entity-select-cards';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function CreateChangeRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore(state => state.user);

  const amendmentIdParam = searchParams.get('amendmentId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposedChange: '',
    justification: '',
    amendmentId: amendmentIdParam || '',
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

  // Query available amendment votes for the dropdown
  const { data: amendmentVotesData } = db.useQuery({
    amendmentVotes: {},
  });

  const userAmendmentVotes = amendmentVotesData?.amendmentVotes || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a change request');
        setIsSubmitting(false);
        return;
      }

      if (!formData.amendmentId) {
        toast.error('Please select an amendment for this change request');
        setIsSubmitting(false);
        return;
      }

      const changeRequestId = id();
      const now = new Date();

      await db.transact([
        tx.changeRequests[changeRequestId].update({
          title: formData.title,
          description: formData.description,
          proposedChange: formData.proposedChange,
          justification: formData.justification || '',
          status: 'proposed',
          votingStartTime: null,
          votingEndTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.changeRequests[changeRequestId].link({
          amendmentVote: formData.amendmentId,
          creator: user.id,
        }),
      ]);

      toast.success('Change request created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Failed to create change request:', error);
      toast.error('Failed to create change request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Change Request</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Basic Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="change-request-amendment">Amendment</Label>
                        <TypeAheadSelect
                          items={userAmendmentVotes}
                          value={formData.amendmentId}
                          onChange={value => setFormData({ ...formData, amendmentId: value })}
                          placeholder="Search for an amendment..."
                          searchKeys={['title', 'description']}
                          renderItem={amendment => (
                            <AmendmentVoteSelectCard amendmentVote={amendment} />
                          )}
                          getItemId={amendment => amendment.id}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="change-request-title">Title</Label>
                        <Input
                          id="change-request-title"
                          placeholder="Enter change request title"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="change-request-description">Description</Label>
                        <Textarea
                          id="change-request-description"
                          placeholder="Describe this change request"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Proposed Changes */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="change-request-proposed">Proposed Change</Label>
                        <Textarea
                          id="change-request-proposed"
                          placeholder="Enter the proposed change"
                          value={formData.proposedChange}
                          onChange={e =>
                            setFormData({ ...formData, proposedChange: e.target.value })
                          }
                          rows={6}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="change-request-justification">
                          Justification (optional)
                        </Label>
                        <Textarea
                          id="change-request-justification"
                          placeholder="Explain why this change is needed"
                          value={formData.justification}
                          onChange={e =>
                            setFormData({ ...formData, justification: e.target.value })
                          }
                          rows={4}
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              Change Request
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Proposed
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formData.title || 'Untitled Change Request'}
                          </CardTitle>
                          {formData.description && (
                            <CardDescription>{formData.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Amendment:</strong>
                            <span className="text-muted-foreground">
                              {userAmendmentVotes.find(a => a.id === formData.amendmentId)?.title ||
                                'Not selected'}
                            </span>
                          </div>
                          {formData.proposedChange && (
                            <div className="space-y-1">
                              <strong className="text-sm">Proposed Change:</strong>
                              <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                                {formData.proposedChange}
                              </p>
                            </div>
                          )}
                          {formData.justification && (
                            <div className="space-y-1">
                              <strong className="text-sm">Justification:</strong>
                              <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                                {formData.justification}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
              <div className="mt-4 flex justify-center gap-2">
                {[0, 1, 2].map(index => (
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
              {currentStep < 2 ? (
                <Button
                  type="button"
                  onClick={() => carouselApi?.scrollNext()}
                  disabled={currentStep === 0 && !formData.title}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Change Request'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
