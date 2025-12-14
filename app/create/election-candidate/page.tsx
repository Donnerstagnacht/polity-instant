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
import { ElectionSelectCard } from '@/components/ui/entity-select-cards';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

function CreateElectionCandidateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore(state => state.user);

  const electionIdParam = searchParams.get('electionId');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: '',
    order: 1,
    electionId: electionIdParam || '',
    userId: '',
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

  // Query available elections for the dropdown
  const { data: electionsData } = db.useQuery({
    elections: {},
  });

  const userElections = electionsData?.elections || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an election candidate');
        setIsSubmitting(false);
        return;
      }

      if (!formData.electionId) {
        toast.error('Please select an election for this candidate');
        setIsSubmitting(false);
        return;
      }

      const candidateId = id();
      const now = new Date();

      const transactions = [
        tx.electionCandidates[candidateId].update({
          name: formData.name,
          description: formData.description || '',
          imageURL: formData.imageURL || '',
          order: formData.order,
          createdAt: now,
        }),
        tx.electionCandidates[candidateId].link({
          election: formData.electionId,
        }),
      ];

      // Optionally link to a user if userId is provided
      if (formData.userId) {
        transactions.push(
          tx.electionCandidates[candidateId].link({
            user: formData.userId,
          })
        );
      }

      await db.transact(transactions);

      toast.success('Election candidate created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Failed to create election candidate:', error);
      toast.error('Failed to create election candidate. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Election Candidate</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Election Selection */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="election-candidate-election">Election</Label>
                        <TypeAheadSelect
                          items={userElections}
                          value={formData.electionId}
                          onChange={value => setFormData({ ...formData, electionId: value })}
                          placeholder="Search for an election..."
                          searchKeys={['title', 'description']}
                          renderItem={election => <ElectionSelectCard election={election} />}
                          getItemId={election => election.id}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="election-candidate-order">Order</Label>
                        <Input
                          id="election-candidate-order"
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
                    </div>
                  </CarouselItem>

                  {/* Step 2: Candidate Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="election-candidate-name">Name</Label>
                        <Input
                          id="election-candidate-name"
                          placeholder="Enter candidate name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="election-candidate-description">Description</Label>
                        <Textarea
                          id="election-candidate-description"
                          placeholder="Describe the candidate (optional)"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="election-candidate-imageURL">Image URL (optional)</Label>
                        <Input
                          id="election-candidate-imageURL"
                          placeholder="Enter image URL"
                          value={formData.imageURL}
                          onChange={e => setFormData({ ...formData, imageURL: e.target.value })}
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              Candidate
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Order #{formData.order}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formData.name || 'Unnamed Candidate'}
                          </CardTitle>
                          {formData.description && (
                            <CardDescription>{formData.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Election:</strong>
                            <span className="text-muted-foreground">
                              {userElections.find(e => e.id === formData.electionId)?.title ||
                                'Not selected'}
                            </span>
                          </div>
                          {formData.imageURL && (
                            <div className="space-y-1">
                              <strong className="text-sm">Image:</strong>
                              <p className="break-all text-xs text-muted-foreground">
                                {formData.imageURL}
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
                  disabled={currentStep === 0 && !formData.electionId}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Election Candidate'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}

export default function CreateElectionCandidatePage() {
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
      <CreateElectionCandidateForm />
    </Suspense>
  );
}
