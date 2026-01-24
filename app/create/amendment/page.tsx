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
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState, useEffect, Suspense } from 'react';
import { db, tx, id } from 'db/db';
import { DEFAULT_AMENDMENT_ROLES } from 'db/rbac/constants';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { HashtagInput } from '@/components/ui/hashtag-input';
import { useSearchParams, useRouter } from 'next/navigation';
import { VisibilitySelector } from '@/components/ui/visibility-selector';
import { TargetGroupEventSelector } from '@/features/amendments/ui/TargetGroupEventSelector';
import { VideoUpload } from '@/components/shared/VideoUpload';
import { CalendarIcon, Target, Video, ChevronRight } from 'lucide-react';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { useTranslation } from '@/hooks/use-translation';

function CreateAmendmentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupIdParam = searchParams.get('groupId');
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    hashtags: [] as string[],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
    videoURL: '',
    videoThumbnailURL: '',
    // Target group and event
    targetGroupId: groupIdParam || '',
    targetGroupData: null as any,
    targetEventId: '',
    targetEventData: null as any,
    pathWithEvents: [] as any[],
    pathUserId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const user = useAuthStore(state => state.user);

  const totalSteps = 5; // Basic Info, Target Group/Event, Visibility, Video, Review

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentStep(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const handleTargetSelect = (data: {
    groupId: string;
    groupData: any;
    eventId: string;
    eventData: any;
    pathWithEvents: any[];
    selectedUserId: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      targetGroupId: data.groupId,
      targetGroupData: data.groupData,
      targetEventId: data.eventId,
      targetEventData: data.eventData,
      pathWithEvents: data.pathWithEvents,
      pathUserId: data.selectedUserId,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error(t('pages.create.validation.loginRequired'));
        setIsSubmitting(false);
        return;
      }

      const amendmentId = id();
      const collaboratorId = id();
      const authorRoleId = id();
      const collaboratorRoleId = id();

      const transactions = [
        // Create the amendment with status set to 'Drafting'
        tx.amendments[amendmentId].update({
          title: formData.title,
          subtitle: formData.subtitle || '',
          status: 'Drafting',
          supporters: 0,
          date: new Date().toISOString().split('T')[0],
          code: '',
          visibility: formData.visibility,
          videoURL: formData.videoURL || '',
          videoThumbnailURL: formData.videoThumbnailURL || '',
        }),

        // Create Author role with admin permissions
        tx.roles[authorRoleId].update({
          name: 'Author',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[authorRoleId].link({ amendment: amendmentId }),

        // Create Collaborator role with basic permissions
        tx.roles[collaboratorRoleId].update({
          name: 'Collaborator',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[collaboratorRoleId].link({ amendment: amendmentId }),

        // Create collaboration for creator as Author
        tx.amendmentCollaborators[collaboratorId].update({
          status: 'admin',
          createdAt: new Date(),
        }),
        tx.amendmentCollaborators[collaboratorId].link({
          user: user.id,
          amendment: amendmentId,
          role: authorRoleId,
        }),
      ];

      // Add permissions/action rights for the Author role
      const authorTemplate = DEFAULT_AMENDMENT_ROLES.find(r => r.name === 'Author');
      if (authorTemplate) {
        authorTemplate.permissions.forEach(perm => {
          const actionRightId = id();
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: [authorRoleId], amendment: amendmentId })
          );
        });
      }

      // Add permissions/action rights for the Collaborator role
      const collaboratorTemplate = DEFAULT_AMENDMENT_ROLES.find(r => r.name === 'Collaborator');
      if (collaboratorTemplate) {
        collaboratorTemplate.permissions.forEach(perm => {
          const actionRightId = id();
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: [collaboratorRoleId], amendment: amendmentId })
          );
        });
      }

      // Link to target group and event if provided
      if (formData.targetGroupId) {
        transactions.push(
          tx.amendments[amendmentId].link({
            groups: [formData.targetGroupId],
            targetGroup: formData.targetGroupId,
          })
        );
      }

      if (formData.targetEventId) {
        transactions.push(
          tx.amendments[amendmentId].link({
            targetEvent: formData.targetEventId,
          })
        );
      }

      // Create path and segments if we have path data
      if (formData.pathWithEvents.length > 0) {
        const pathId = id();
        const pathUserId = formData.pathUserId || user.id;

        // Find the closest event (earliest start date) in the path
        const eventsWithDates = formData.pathWithEvents.filter(seg => seg.eventStartDate);
        eventsWithDates.sort((a, b) => {
          const dateA = a.eventStartDate ? new Date(a.eventStartDate).getTime() : 0;
          const dateB = b.eventStartDate ? new Date(b.eventStartDate).getTime() : 0;
          return dateA - dateB;
        });
        const closestEventId = eventsWithDates.length > 0 ? eventsWithDates[0].eventId : null;

        // Create path record
        transactions.push(
          tx.amendmentPaths[pathId]
            .update({
              pathLength: formData.pathWithEvents.length,
              createdAt: new Date(),
            })
            .link({
              amendment: amendmentId,
              user: pathUserId,
            })
        );

        // Create path segments with agenda items and votes
        formData.pathWithEvents.forEach((segment, index) => {
          const segmentId = id();
          let agendaItemId = null;
          let amendmentVoteId = null;
          let forwardingStatus = 'previous_decision_outstanding';

          // Determine forwarding status
          if (segment.eventId === closestEventId) {
            forwardingStatus = 'forward_confirmed';
          }

          // Create agenda item and vote if segment has an event
          if (segment.eventId) {
            agendaItemId = id();
            amendmentVoteId = id();

            // Create agenda item
            transactions.push(
              tx.agendaItems[agendaItemId]
                .update({
                  title: `Amendment: ${formData.title}`,
                  description: formData.subtitle || '',
                  type: 'amendment',
                  status: 'pending',
                  forwardingStatus: forwardingStatus,
                  order: 999,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .link({
                  event: segment.eventId,
                  creator: user.id,
                  amendment: amendmentId,
                })
            );

            // Create amendment vote for the agenda item
            transactions.push(
              tx.amendmentVotes[amendmentVoteId]
                .update({
                  title: formData.title,
                  description: formData.subtitle || '',
                  proposedText: formData.title,
                  originalText: '',
                  status: 'pending',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .link({
                  agendaItem: agendaItemId,
                  creator: user.id,
                })
            );
          }

          // Create segment
          const segmentLinks: any = {
            path: pathId,
            group: segment.groupId,
          };

          if (segment.eventId) segmentLinks.event = segment.eventId;
          if (agendaItemId) segmentLinks.agendaItem = agendaItemId;
          if (amendmentVoteId) segmentLinks.amendmentVote = amendmentVoteId;

          transactions.push(
            tx.amendmentPathSegments[segmentId]
              .update({
                order: index,
                forwardingStatus: forwardingStatus,
                createdAt: new Date(),
              })
              .link(segmentLinks)
          );
        });
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

      // Add timeline event for public amendments
      if (formData.visibility === 'public') {
        transactions.push(
          createTimelineEvent({
            eventType: 'created',
            entityType: 'amendment',
            entityId: amendmentId,
            actorId: user.id,
            title: `New amendment: ${formData.title}`,
            description: formData.subtitle || undefined,
            media: formData.videoURL
              ? {
                  videoURL: formData.videoURL,
                  videoThumbnailURL: formData.videoThumbnailURL || undefined,
                }
              : undefined,
          })
        );
      }

      await db.transact(transactions);

      toast.success(`Amendment ${t('pages.create.success.created')}`);
      setTimeout(() => {
        router.push(`/amendment/${amendmentId}`);
      }, 500);
    } catch (error) {
      console.error('Failed to create amendment:', error);
      toast.error(t('pages.create.error.createFailed'));
      setIsSubmitting(false);
    }
  };

  // Validation for each step
  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Information
        return formData.title.trim().length > 0;
      case 1: // Target Group & Event
        return formData.targetGroupId.length > 0 && formData.targetEventId.length > 0;
      case 2: // Visibility & Hashtags (optional)
        return true;
      case 3: // Video (optional)
        return true;
      case 4: // Review
        return true;
      default:
        return true;
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('pages.create.amendment.title')}</CardTitle>
            </CardHeader>
            <div>
              <CardContent>
                <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                  <CarouselContent>
                    {/* Step 0: Basic Information */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="space-y-2">
                          <Label htmlFor="amendment-title">
                            {t('pages.create.amendment.titleLabel')}
                          </Label>
                          <Input
                            id="amendment-title"
                            placeholder={t('pages.create.amendment.titlePlaceholder')}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amendment-subtitle">
                            {t('pages.create.amendment.subtitleOptional')}
                          </Label>
                          <Input
                            id="amendment-subtitle"
                            placeholder={t('pages.create.amendment.subtitlePlaceholder')}
                            value={formData.subtitle}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                          />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 1: Target Group & Event Selection */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {t('pages.create.amendment.targetGroupEvent')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('pages.create.amendment.targetGroupEventDesc')}
                          </p>
                        </div>
                        {user?.id && (
                          <TargetGroupEventSelector
                            userId={user.id}
                            onSelect={handleTargetSelect}
                            selectedGroupId={formData.targetGroupId}
                            selectedEventId={formData.targetEventId}
                          />
                        )}

                        {/* Show selected target */}
                        {formData.targetGroupData && formData.targetEventData && (
                          <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Target className="h-4 w-4 text-primary" />
                              {t('pages.create.amendment.selectedTarget')}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                              <Badge variant="secondary">{formData.targetGroupData.name}</Badge>
                              <ChevronRight className="h-4 w-4" />
                              <Badge variant="outline">{formData.targetEventData.title}</Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CarouselItem>

                    {/* Step 2: Visibility & Hashtags */}
                    <CarouselItem>
                      <div className="space-y-6 p-4">
                        <VisibilitySelector
                          value={formData.visibility}
                          onChange={visibility => setFormData({ ...formData, visibility })}
                        />

                        <div className="space-y-2">
                          <Label>{t('pages.create.common.hashtags')}</Label>
                          <HashtagInput
                            value={formData.hashtags}
                            onChange={hashtags => setFormData({ ...formData, hashtags })}
                            placeholder={t('pages.create.common.hashtagsPlaceholder')}
                          />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 3: Presentation Video */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div>
                          <h3 className="flex items-center gap-2 text-lg font-semibold">
                            <Video className="h-5 w-5" />
                            {t('pages.create.amendment.presentationVideoOptional')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('pages.create.amendment.presentationVideoDesc')}
                          </p>
                        </div>

                        <VideoUpload
                          currentVideo={formData.videoURL}
                          currentThumbnail={formData.videoThumbnailURL}
                          onVideoChange={(url: string) =>
                            setFormData({ ...formData, videoURL: url })
                          }
                          label="Amendment Video"
                          description="Upload a video file or provide a URL (max 100MB)"
                        />
                      </div>
                    </CarouselItem>

                    {/* Step 4: Review */}
                    <CarouselItem>
                      <div className="p-4">
                        <Card className="overflow-hidden border-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50">
                          <CardHeader>
                            <div className="mb-2 flex items-center justify-between">
                              <Badge variant="default" className="text-xs">
                                {t('pages.create.amendment.reviewBadge')}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {t('pages.create.amendment.reviewStatus')}
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
                            {/* Target Group & Event */}
                            {formData.targetGroupData && formData.targetEventData && (
                              <div className="space-y-2">
                                <strong className="text-sm">
                                  {t('pages.create.amendment.target')}
                                </strong>
                                <div className="rounded-md bg-background/50 p-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-primary" />
                                    <span className="font-medium">
                                      {formData.targetGroupData.name}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>{formData.targetEventData.title}</span>
                                    {formData.targetEventData.startDate && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          {new Date(
                                            formData.targetEventData.startDate
                                          ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Amendment Path */}
                            {formData.pathWithEvents.length > 0 && (
                              <div className="space-y-2">
                                <strong className="text-sm">
                                  {t('pages.create.amendment.path')}{' '}
                                  {t('pages.create.amendment.pathGroups', {
                                    count: formData.pathWithEvents.length,
                                  })}
                                </strong>
                                <div className="flex flex-wrap items-center gap-1">
                                  {formData.pathWithEvents.map((segment, index) => (
                                    <div key={segment.groupId} className="flex items-center gap-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {segment.groupName}
                                      </Badge>
                                      {index < formData.pathWithEvents.length - 1 && (
                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm">
                              <strong>{t('pages.create.common.visibility')}:</strong>
                              <Badge variant="outline">{formData.visibility}</Badge>
                            </div>

                            {formData.videoURL && (
                              <div className="flex items-center gap-2 text-sm">
                                <Video className="h-4 w-4" />
                                <span className="text-muted-foreground">
                                  {t('pages.create.amendment.videoAttached')}
                                </span>
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

                        <div className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                          <p className="font-semibold">
                            {t('pages.create.amendment.whatWillHappen')}
                          </p>
                          <ul className="ml-4 mt-1 list-disc space-y-1">
                            <li>{t('pages.create.amendment.willBeCreated')}</li>
                            <li>{t('pages.create.amendment.willBeAssignedAuthor')}</li>
                            {formData.pathWithEvents.length > 0 && (
                              <>
                                <li>
                                  {t('pages.create.amendment.agendaItemsWillBeCreated', {
                                    count: formData.pathWithEvents.filter(s => s.eventId).length,
                                  })}
                                </li>
                                <li>{t('pages.create.amendment.pathWillBeSetUp')}</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        currentStep === index ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                      aria-label={t('pages.create.goToStep', { step: index + 1 })}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => carouselApi?.scrollPrev()}
                  disabled={currentStep === 0 || isSubmitting}
                >
                  {t('pages.create.previous')}
                </Button>
                {currentStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    onClick={() => carouselApi?.scrollNext()}
                    disabled={!canProceedFromStep(currentStep)}
                  >
                    {t('pages.create.next')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting || !formData.title}
                  >
                    {isSubmitting
                      ? t('pages.create.creating')
                      : t('pages.create.amendment.createButton')}
                  </Button>
                )}
              </CardFooter>
            </div>
          </Card>
        </TooltipProvider>
      </PageWrapper>
    </AuthGuard>
  );
}

export default function CreateAmendmentPage() {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <PageWrapper className="flex min-h-screen items-center justify-center p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('pages.create.loading')}</CardTitle>
            </CardHeader>
          </Card>
        </PageWrapper>
      }
    >
      <CreateAmendmentForm />
    </Suspense>
  );
}
