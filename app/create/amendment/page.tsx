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
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { HashtagInput } from '@/components/ui/hashtag-input';
import { useSearchParams } from 'next/navigation';

export default function CreateAmendmentPage() {
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get('groupId');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    status: 'Drafting',
    code: '',
    date: new Date().toISOString().split('T')[0],
    hashtags: [] as string[],
    groupId: groupIdParam || '',
    visibility: 'public' as 'public' | 'authenticated' | 'private',
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an amendment');
        setIsSubmitting(false);
        return;
      }

      const amendmentId = id();
      const collaboratorId = id();
      const applicantRoleId = id();
      const collaboratorRoleId = id();

      const transactions = [
        // Create the amendment
        tx.amendments[amendmentId].update({
          title: formData.title,
          subtitle: formData.subtitle || '',
          status: formData.status,
          supporters: 0,
          date: formData.date,
          code: formData.code || '',
          visibility: formData.visibility,
        }),

        // Create Applicant role with admin permissions
        tx.roles[applicantRoleId].update({
          name: 'Applicant',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[applicantRoleId].link({ amendment: amendmentId }),

        // Create Collaborator role with basic permissions
        tx.roles[collaboratorRoleId].update({
          name: 'Collaborator',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[collaboratorRoleId].link({ amendment: amendmentId }),

        // Create collaboration for creator as Applicant
        tx.amendmentCollaborators[collaboratorId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.amendmentCollaborators[collaboratorId].link({
          user: user.id,
          amendment: amendmentId,
          role: applicantRoleId,
        }),
      ];

      // Link to group if provided
      if (formData.groupId) {
        transactions.push(tx.amendments[amendmentId].link({ groups: [formData.groupId] }));
      }

      // Add hashtags
      formData.hashtags.forEach((tag: string) => {
        const hashtagId = id();
        transactions.push(
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ amendment: amendmentId })
        );
      });

      await db.transact(transactions);

      toast.success('Amendment created successfully!');
      setTimeout(() => {
        window.location.href = `/amendment/${amendmentId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create amendment:', error);
      toast.error('Failed to create amendment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create New Amendment</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Basic Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="amendment-title">Amendment Title</Label>
                        <Input
                          id="amendment-title"
                          placeholder="Enter the title"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amendment-subtitle">Subtitle (Optional)</Label>
                        <Input
                          id="amendment-subtitle"
                          placeholder="Add a subtitle"
                          value={formData.subtitle}
                          onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amendment-date">Amendment Date</Label>
                        <Input
                          id="amendment-date"
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Status & Code */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="amendment-status">Current Status</Label>
                        <select
                          id="amendment-status"
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="Drafting">Drafting</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Passed">Passed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amendment-code">Amendment Code (Optional)</Label>
                        <Textarea
                          id="amendment-code"
                          placeholder="Enter reference code or legal text"
                          value={formData.code}
                          onChange={e => setFormData({ ...formData, code: e.target.value })}
                          rows={6}
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Visibility & Hashtags */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="amendment-visibility">Visibility</Label>
                        <select
                          id="amendment-visibility"
                          value={formData.visibility}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              visibility: e.target.value as 'public' | 'authenticated' | 'private',
                            })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="public">Public - Anyone can see</option>
                          <option value="authenticated">
                            Authenticated - Only logged-in users
                          </option>
                          <option value="private">Private - Only collaborators</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Hashtags (Optional)</Label>
                        <HashtagInput
                          value={formData.hashtags}
                          onChange={hashtags => setFormData({ ...formData, hashtags })}
                          placeholder="Add hashtags (e.g., policy, reform)"
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 4: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              Amendment
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {formData.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formData.title || 'Untitled Amendment'}
                          </CardTitle>
                          {formData.subtitle && (
                            <CardDescription>{formData.subtitle}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Date:</strong>
                            <span className="text-muted-foreground">{formData.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Visibility:</strong>
                            <span className="text-muted-foreground">{formData.visibility}</span>
                          </div>
                          {formData.code && (
                            <div className="space-y-1">
                              <strong className="text-sm">Amendment Code:</strong>
                              <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                                {formData.code}
                              </p>
                            </div>
                          )}
                          {formData.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {formData.hashtags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
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
                  {isSubmitting ? 'Creating...' : 'Create Amendment'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
