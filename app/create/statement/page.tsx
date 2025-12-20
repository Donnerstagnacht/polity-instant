'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useStatementMutations } from '@/features/statements/hooks/useStatementData';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function CreateStatementPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { createStatement, isLoading: isSubmitting } = useStatementMutations();

  const [formData, setFormData] = useState({
    text: '',
    tag: '',
    visibility: 'public' as 'public' | 'authenticated' | 'private',
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      return;
    }

    const result = await createStatement(user.id, formData.text, formData.tag);
    if (result.success && result.statementId) {
      router.push(`/statement/${result.statementId}`);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Statement</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Statement Text */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="statement-text">Statement</Label>
                        <Textarea
                          id="statement-text"
                          placeholder="Enter your statement"
                          value={formData.text}
                          onChange={e => setFormData({ ...formData, text: e.target.value })}
                          rows={6}
                          required
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Tag & Visibility */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="statement-tag">Tag</Label>
                        <Input
                          id="statement-tag"
                          placeholder="e.g., policy, opinion, announcement"
                          value={formData.tag}
                          onChange={e => setFormData({ ...formData, tag: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="statement-visibility">Visibility</Label>
                        <select
                          id="statement-visibility"
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
                          <option value="private">Private - Only you</option>
                        </select>
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
                              Statement
                            </Badge>
                            {formData.tag && (
                              <Badge variant="secondary" className="text-xs">
                                #{formData.tag}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">Statement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm">{formData.text || 'No statement text provided'}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Visibility:</strong>
                            <span className="text-muted-foreground">{formData.visibility}</span>
                          </div>
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
                  disabled={currentStep === 0 && !formData.text}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Statement'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
