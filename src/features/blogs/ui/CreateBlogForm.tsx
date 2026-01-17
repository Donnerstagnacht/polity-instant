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
import { HashtagInput } from '@/components/ui/hashtag-input';
import { VisibilitySelector } from '@/components/ui/visibility-selector';
import { TooltipProvider } from '@/components/ui/tooltip';
import { db, tx, id } from 'db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

export function CreateBlogForm() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
    hashtags: [] as string[],
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

  const handleSubmit = async () => {
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
      const ownerManageBlogsId = id();
      const ownerManageBloggersId = id();

      // Create action right for Writer role
      const writerUpdateRightId = id();

      const transactions = [
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

        // Create action rights for Owner role - 'manage' implies view, create, update, delete
        tx.actionRights[ownerManageBlogsId].update({
          resource: 'blogs',
          action: 'manage',
        }),
        tx.actionRights[ownerManageBlogsId].link({ roles: [ownerRoleId], blog: blogId }),

        tx.actionRights[ownerManageBloggersId].update({
          resource: 'blogBloggers',
          action: 'manage',
        }),
        tx.actionRights[ownerManageBloggersId].link({ roles: [ownerRoleId], blog: blogId }),

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
      ];

      // Add hashtags
      const hashtagTransactions = formData.hashtags.map(tag => {
        const hashtagId = id();
        return [
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ blog: blogId }),
        ];
      }).flat();

      // Add timeline event for public blogs
      const timelineTransactions = [];
      if (formData.visibility === 'public') {
        timelineTransactions.push(
          createTimelineEvent({
            eventType: 'created',
            entityType: 'blog',
            entityId: blogId,
            actorId: user.id,
            title: `New blog post: ${formData.title}`,
            description: 'A new blog post has been published',
          })
        );
      }

      await db.transact([...transactions, ...hashtagTransactions, ...timelineTransactions]);

      toast.success('Blog post created successfully!');
      router.push(`/blog/${blogId}`);
    } catch (error) {
      console.error('Failed to create blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Blog Post</CardTitle>
        </CardHeader>
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

                {/* Step 2: Visibility & Hashtags */}
                <CarouselItem>
                  <div className="space-y-4 p-4">
                    <TooltipProvider>
                      <VisibilitySelector
                        value={formData.visibility}
                        onChange={visibility => setFormData({ ...formData, visibility })}
                      />

                      {/* Hashtags */}
                      <div className="space-y-2 mt-4">
                        <HashtagInput
                          value={formData.hashtags}
                          onChange={hashtags => setFormData({ ...formData, hashtags })}
                          placeholder="Add hashtags (e.g., politics, community)"
                        />
                      </div>
                    </TooltipProvider>
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
                        {formData.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {formData.hashtags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
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
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Blog Post'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </PageWrapper>
    );
  }
