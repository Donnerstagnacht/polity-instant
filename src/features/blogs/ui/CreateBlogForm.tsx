'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
import { HashtagEditor } from '@/components/ui/hashtag-editor';
import { VisibilitySelector } from '@/components/ui/visibility-selector';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useCommonState, useCommonActions } from '@/zero/common';

export function CreateBlogForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBlogFull } = useBlogActions();
  const commonActions = useCommonActions();
  const { allHashtags } = useCommonState({ loadAllHashtags: true });

  const [blogId] = useState(() => crypto.randomUUID());
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
    hashtags: [] as string[],
    imageURL: '',
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

      // blogId already generated upfront for ImageUpload path

      // Create roles for the blog
      const ownerRoleId = crypto.randomUUID();
      const writerRoleId = crypto.randomUUID();

      // Create the blogger entry for the creator (as Owner)
      const bloggerId = crypto.randomUUID();

      // Create action rights for Owner role
      const ownerManageBlogsId = crypto.randomUUID();
      const ownerManageBloggersId = crypto.randomUUID();

      // Create action right for Writer role
      const writerUpdateRightId = crypto.randomUUID();

      await createBlogFull({
        blog: {
          id: blogId,
          title: formData.title,
          description: '',
          content: null,
          date: formData.date,
          image_url: formData.imageURL,
          is_public: formData.visibility === 'public',
          visibility: formData.visibility,
          like_count: 0,
          comment_count: 0,
          upvotes: 0,
          downvotes: 0,
          editing_mode: '',
          discussions: null,
          group_id: null,
        },
        roles: [
          {
            id: ownerRoleId,
            name: 'Owner',
            description: 'Blog owner with full permissions',
            scope: 'blog',
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
          {
            id: writerRoleId,
            name: 'Writer',
            description: 'Blog writer with edit access',
            scope: 'blog',
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
        ],
        actionRights: [
          {
            id: ownerManageBlogsId,
            resource: 'blogs',
            action: 'manage',
            role_id: ownerRoleId,
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
          {
            id: ownerManageBloggersId,
            resource: 'blogBloggers',
            action: 'manage',
            role_id: ownerRoleId,
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
          {
            id: writerUpdateRightId,
            resource: 'blogs',
            action: 'update',
            role_id: writerRoleId,
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
        ],
        entry: {
          id: bloggerId,
          blog_id: blogId,
          user_id: user.id,
          role_id: ownerRoleId,
          status: 'member',
          visibility: formData.visibility,
        },
        hashtags: [],
      });

      // Sync hashtags via junction tables
      if (formData.hashtags.length > 0) {
        await commonActions.syncEntityHashtags(
          'blog',
          blogId,
          formData.hashtags,
          [],
          allHashtags ?? []
        );
      }

      // Add timeline event for public blogs
      if (formData.visibility === 'public') {
        await createTimelineEvent({ data: {
          eventType: 'created',
          entityType: 'blog',
          entityId: blogId,
          actorId: user.id,
          title: `New blog post: ${formData.title}`,
          description: 'A new blog post has been published',
        } });
      }

      toast.success('Blog post created successfully!');
      navigate({ to: `/blog/${blogId}` });
    } catch (error) {
      console.error('Failed to create blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="flex min-h-screen items-center justify-center">
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
                    <ImageUpload
                      currentImage={formData.imageURL}
                      onImageChange={(url: string) => setFormData({ ...formData, imageURL: url })}
                      entityType="blogs"
                      entityId={blogId}
                      label="Cover Image"
                      description="Upload a cover image for your blog post"
                    />
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
                        <HashtagEditor
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
