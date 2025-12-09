'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function CreateBlogPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a blog post');
        setIsSubmitting(false);
        return;
      }

      const blogId = id();

      // Create roles for the blog
      const ownerRoleId = id();
      const writerRoleId = id();

      // Create the blogger entry for the creator (as Owner)
      const bloggerId = id();

      // Create action rights for Owner role
      const ownerUpdateRightId = id();
      const ownerDeleteRightId = id();
      const ownerManageRightId = id();

      // Create action right for Writer role
      const writerUpdateRightId = id();

      await db.transact([
        // Create the blog
        tx.blogs[blogId].update({
          title: formData.title,
          date: formData.date,
          likeCount: 0,
          commentCount: 0,
          visibility: formData.visibility,
        }),

        // Create Owner role
        tx.roles[ownerRoleId].update({
          name: 'Owner',
          description: 'Blog owner with full permissions',
          scope: 'blog',
        }),
        tx.roles[ownerRoleId].link({ blog: blogId }),

        // Create Writer role
        tx.roles[writerRoleId].update({
          name: 'Writer',
          description: 'Blog writer with edit access',
          scope: 'blog',
        }),
        tx.roles[writerRoleId].link({ blog: blogId }),

        // Create action rights for Owner role
        tx.actionRights[ownerUpdateRightId].update({
          resource: 'blogs',
          action: 'update',
        }),
        tx.actionRights[ownerUpdateRightId].link({ roles: [ownerRoleId], blog: blogId }),

        tx.actionRights[ownerDeleteRightId].update({
          resource: 'blogs',
          action: 'delete',
        }),
        tx.actionRights[ownerDeleteRightId].link({ roles: [ownerRoleId], blog: blogId }),

        tx.actionRights[ownerManageRightId].update({
          resource: 'blogBloggers',
          action: 'manage',
        }),
        tx.actionRights[ownerManageRightId].link({ roles: [ownerRoleId], blog: blogId }),

        // Create action right for Writer role
        tx.actionRights[writerUpdateRightId].update({
          resource: 'blogs',
          action: 'update',
        }),
        tx.actionRights[writerUpdateRightId].link({ roles: [writerRoleId], blog: blogId }),

        // Assign creator as Owner
        tx.blogBloggers[bloggerId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.blogBloggers[bloggerId].link({
          blog: blogId,
          user: user.id,
          role: ownerRoleId,
        }),
      ]);

      toast.success('Blog post created successfully!');
      router.push(`/blog/${blogId}`);
    } catch (error) {
      console.error('Failed to create blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Blog Post</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Basic Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="blog-title">Title</Label>
                        <Input
                          id="blog-title"
                          placeholder="Enter blog title"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blog-date">Date</Label>
                        <Input
                          id="blog-date"
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Visibility */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="blog-visibility">Visibility</Label>
                        <select
                          id="blog-visibility"
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
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              Blog Post
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formData.visibility}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formData.title || 'Untitled Blog Post'}
                          </CardTitle>
                          <CardDescription>{formData.date}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
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
                  disabled={currentStep === 0 && !formData.title}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Blog Post'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
