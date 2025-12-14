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
import { GroupSelectCard } from '@/components/ui/entity-select-cards';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

function CreatePositionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore(state => state.user);

  const groupIdParam = searchParams.get('groupId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    term: 12,
    firstTermStart: '',
    groupId: groupIdParam || '',
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

  // Fetch user's owned/admin groups
  const { data, isLoading } = db.useQuery({
    groups: {
      $: {
        where: {
          'owner.id': user?.id,
        },
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a position');
        setIsSubmitting(false);
        return;
      }

      if (!formData.groupId) {
        toast.error('Please select a group');
        setIsSubmitting(false);
        return;
      }

      const positionId = id();

      await db.transact([
        tx.positions[positionId]
          .update({
            title: formData.title,
            description: formData.description || '',
            term: formData.term,
            firstTermStart: new Date(formData.firstTermStart),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .link({ group: formData.groupId }),
      ]);

      toast.success('Position created successfully!');
      router.push(`/group/${formData.groupId}`);
    } catch (error) {
      console.error('Failed to create position:', error);
      toast.error('Failed to create position. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Position</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Group Selection */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="position-group">Group</Label>
                        {isLoading ? (
                          <p className="text-sm text-muted-foreground">Loading groups...</p>
                        ) : data?.groups && data.groups.length > 0 ? (
                          <TypeAheadSelect
                            items={data.groups}
                            value={formData.groupId}
                            onChange={value => setFormData({ ...formData, groupId: value })}
                            placeholder="Search for a group..."
                            searchKeys={['name', 'description']}
                            renderItem={group => <GroupSelectCard group={group} />}
                            getItemId={group => group.id}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No groups found. You need to create or own a group first.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position-title">Position Title</Label>
                        <Input
                          id="position-title"
                          placeholder="e.g., President, Secretary, Treasurer"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Position Details */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="position-description">Description</Label>
                        <Textarea
                          id="position-description"
                          placeholder="Describe the responsibilities and role"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position-term">Term Length (months)</Label>
                        <Input
                          id="position-term"
                          type="number"
                          min="1"
                          max="120"
                          value={formData.term}
                          onChange={e =>
                            setFormData({ ...formData, term: parseInt(e.target.value) })
                          }
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          How long does each term last? (e.g., 6 = 6 months, 12 = 1 year, 24 = 2
                          years)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position-firstTermStart">First Term Start Date</Label>
                        <Input
                          id="position-firstTermStart"
                          type="date"
                          value={formData.firstTermStart}
                          onChange={e =>
                            setFormData({ ...formData, firstTermStart: e.target.value })
                          }
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          When did or will the first term for this position start?
                        </p>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              Position
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {formData.term} months
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formData.title || 'Untitled Position'}
                          </CardTitle>
                          {formData.description && (
                            <CardDescription>{formData.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Group:</strong>
                            <span className="text-muted-foreground">
                              {data?.groups?.find(g => g.id === formData.groupId)?.name ||
                                'Not selected'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Term Length:</strong>
                            <span className="text-muted-foreground">{formData.term} months</span>
                          </div>
                          {formData.firstTermStart && (
                            <div className="flex items-center gap-2 text-sm">
                              <strong>First Term Starts:</strong>
                              <span className="text-muted-foreground">
                                {formData.firstTermStart}
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
                  disabled={
                    (currentStep === 0 && !formData.title) ||
                    !data?.groups ||
                    data.groups.length === 0
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !data?.groups || data.groups.length === 0}
                >
                  {isSubmitting ? 'Creating...' : 'Create Position'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}

export default function CreatePositionPage() {
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
      <CreatePositionForm />
    </Suspense>
  );
}
