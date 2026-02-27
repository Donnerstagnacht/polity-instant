'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { VideoUpload } from '@/components/shared/VideoUpload';
import { HashtagEditor } from '@/components/ui/hashtag-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import type { WorkflowStatus } from '@/zero/rbac/workflow-constants';
import {
  WORKFLOW_STATUS_METADATA,
  COLLABORATOR_SELECTABLE_STATUSES,
  isEventPhase,
} from '@/zero/rbac/workflow-constants';
import { useTranslation } from '@/hooks/use-translation';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { notifyAmendmentProfileUpdated } from '@/utils/notification-helpers';
import { CreateReviewCard, SummaryField } from '@/components/ui/create-review-card';

interface AmendmentEditContentProps {
  amendmentId: string;
  amendment: any;
  collaborators: any[];
  currentUserId: string;
  isLoading: boolean;
  mode?: 'create' | 'edit';
}

export function AmendmentEditContent({
  amendmentId,
  amendment,
  collaborators,
  currentUserId,
  isLoading,
  mode,
}: AmendmentEditContentProps) {
  const isCreating = mode === 'create' || !amendment;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateAmendment, createAmendment } = useAmendmentActions();
  const commonActions = useCommonActions();
  const { amendmentHashtags, allHashtags } = useCommonState({
    amendment_id: amendmentId,
    loadAllHashtags: true,
  });

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    code: '',
    imageURL: '',
    videoURL: '',
    videoThumbnailURL: '',
    status: 'Drafting',
    workflowStatus: 'collaborative_editing' as WorkflowStatus,
    autoCloseVoting: false,
    date: '',
    supporters: 0,
    hashtags: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const initializedRef = useRef(false);
  const hashtagsInitializedRef = useRef(false);

  // Initialize hashtags from junction data once available
  useEffect(() => {
    if (amendmentHashtags && amendmentHashtags.length > 0 && !hashtagsInitializedRef.current) {
      hashtagsInitializedRef.current = true;
      const tags = amendmentHashtags.map(j => j.hashtag?.tag).filter((t): t is string => !!t);
      setFormData(prev => ({ ...prev, hashtags: tags }));
    }
  }, [amendmentHashtags]);

  useEffect(() => {
    if (amendment && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        title: amendment.title || '',
        subtitle: amendment.subtitle || '',
        code: amendment.code || '',
        imageURL: amendment.image_url || '',
        videoURL: amendment.videoURL || '',
        videoThumbnailURL: amendment.videoThumbnailURL || '',
        status: amendment.status || 'Drafting',
        workflowStatus: (amendment.workflowStatus as WorkflowStatus) || 'collaborative_editing',
        autoCloseVoting: false, // Will be loaded from document settings
        date: amendment.date || new Date().toLocaleDateString(),
        supporters: amendment.supporters || 0,
        tags: Array.isArray(amendment.tags) ? amendment.tags : [],
        hashtags: amendmentHashtags
          ? amendmentHashtags.map(j => j.hashtag?.tag).filter((t): t is string => !!t)
          : Array.isArray(amendment.tags) ? amendment.tags : [],
      });
    }
  }, [amendment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isCreating) {
        await createAmendment({
          id: amendmentId,
          title: formData.title || null,
          code: formData.code || null,
          status: formData.status || null,
          workflow_status: formData.workflowStatus || null,
          reason: null,
          category: null,
          preamble: null,
          group_id: null,
          event_id: null,
          clone_source_id: null,
          tags: formData.hashtags.length > 0 ? formData.hashtags : null,
          visibility: 'public',
          is_public: true,
          editing_mode: null,
          discussions: null,
          image_url: formData.imageURL || null,
          x: null,
          youtube: null,
          linkedin: null,
          website: null,
        });
      } else {
        if (!amendment) {
          toast.error(t('features.amendments.editContent.updateFailed'));
          return;
        }
        await updateAmendment({
          id: amendmentId,
          title: formData.title,
          code: formData.code,
          status: formData.status,
          workflow_status: formData.workflowStatus,
          supporters: formData.supporters,
          tags: formData.hashtags,
          image_url: formData.imageURL || null,
        });
      }

      // Sync hashtags via junction tables
      await commonActions.syncEntityHashtags(
        'amendment',
        amendmentId,
        formData.hashtags,
        amendmentHashtags ?? [],
        allHashtags ?? []
      );

      // Only create timeline events for public amendments in edit mode
      if (!isCreating && amendment?.visibility === 'public') {
        if (formData.imageURL && formData.imageURL !== amendment.imageURL) {
          await createTimelineEvent({ data: {
            eventType: 'image_uploaded',
            entityType: 'amendment',
            entityId: amendmentId,
            actorId: currentUserId,
            title: t('features.timeline.imageUploadedTitle'),
            description: t('features.timeline.imageUploadedDescription', {
              title: formData.title,
            }),
            contentType: 'image',
            status: {},
          } });
        }
        if (formData.videoURL && formData.videoURL !== amendment.videoURL) {
          await createTimelineEvent({ data: {
            eventType: 'video_uploaded',
            entityType: 'amendment',
            entityId: amendmentId,
            actorId: currentUserId,
            title: t('features.timeline.videoUploadedTitle'),
            description: t('features.timeline.videoUploadedDescription', {
              title: formData.title,
            }),
            contentType: 'video',
            status: {},
          } });
        }
      }
      // Notify about profile update (edit mode only)
      if (!isCreating) {
        await notifyAmendmentProfileUpdated({
          senderId: currentUserId,
          amendmentId,
          amendmentTitle: formData.title,
        });
      }
      toast.success(
        isCreating
          ? t('pages.create.success.created')
          : t('features.amendments.editContent.updateSuccess')
      );
      navigate({ to: `/amendment/${amendmentId}` });
    } catch (error) {
      toast.error(t('features.amendments.editContent.updateFailed'));
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('features.amendments.editContent.loading')}</p>
      </div>
    );
  }

  if (!isCreating && !amendment) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">{t('features.amendments.editContent.notFound')}</p>
          <p className="text-muted-foreground">
            {t('features.amendments.editContent.noDataExists')}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate({ to: `/` })} variant="default">
              {t('features.amendments.editContent.backToHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onFormSubmit = (e: React.FormEvent) => {
    if (isCreating && !showReview) {
      e.preventDefault();
      setShowReview(true);
      return;
    }
    handleSubmit(e);
  };

  const confirmCreate = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  if (isCreating && showReview) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('pages.create.common.review')}</h1>
        </div>
        <div className="max-w-2xl">
          <CreateReviewCard
            badge={t('pages.create.amendment.reviewBadge')}
            secondaryBadge={formData.status}
            title={formData.title || 'Untitled Amendment'}
            subtitle={formData.subtitle || undefined}
            hashtags={formData.hashtags}
            gradient="from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/50"
          >
            {formData.code && <SummaryField label={t('features.amendments.editContent.codeLabel')} value={formData.code.length > 200 ? formData.code.slice(0, 200) + '…' : formData.code} />}
            <SummaryField label={t('features.amendments.editContent.workflowStatusLabel')} value={WORKFLOW_STATUS_METADATA[formData.workflowStatus]?.label || formData.workflowStatus} />
          </CreateReviewCard>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowReview(false)}>
              {t('pages.create.previous')}
            </Button>
            <Button onClick={confirmCreate} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('pages.create.common.creating')}
                </>
              ) : (
                t('pages.create.amendment.createButton')
              )}
            </Button>
          </div>
        </div>
        {/* Hidden form to allow real submission */}
        <form ref={formRef} onSubmit={handleSubmit} className="hidden" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isCreating ? t('pages.create.amendment.title') : t('features.amendments.editContent.pageTitle')}
        </h1>
        <p className="text-muted-foreground">
          {isCreating ? t('pages.create.amendment.description') : t('features.amendments.editContent.pageDescription')}
        </p>
      </div>

      <form ref={formRef} onSubmit={onFormSubmit} className="space-y-6">
        <ImageUpload
          currentImage={formData.imageURL}
          onImageChange={(url: string) => setFormData({ ...formData, imageURL: url })}
          entityType="amendments"
          entityId={amendmentId}
          label={t('features.amendments.editContent.amendmentImage')}
          description={t('features.amendments.editContent.amendmentImageDescription')}
        />

        <VideoUpload
          currentVideo={formData.videoURL}
          currentThumbnail={formData.videoThumbnailURL}
          onVideoChange={(url: string) => setFormData({ ...formData, videoURL: url })}
          label={t('features.amendments.editContent.amendmentVideo')}
          description={t('features.amendments.editContent.amendmentVideoDescription')}
        />

        {formData.videoURL && (
          <ImageUpload
            currentImage={formData.videoThumbnailURL}
            onImageChange={(url: string) => setFormData({ ...formData, videoThumbnailURL: url })}
            entityType="amendments"
            entityId={amendmentId}
            label={t('features.amendments.editContent.videoThumbnail')}
            description={t('features.amendments.editContent.videoThumbnailDescription')}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('features.amendments.editContent.basicInfo')}</CardTitle>
            <CardDescription>
              {t('features.amendments.editContent.basicInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('features.amendments.editContent.titleLabel')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('features.amendments.editContent.titlePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">{t('features.amendments.editContent.subtitleLabel')}</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder={t('features.amendments.editContent.subtitlePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">{t('features.amendments.editContent.codeLabel')}</Label>
              <Textarea
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('features.amendments.editContent.codePlaceholder')}
                rows={10}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('features.amendments.editContent.statusMetadata')}</CardTitle>
            <CardDescription>
              {t('features.amendments.editContent.statusMetadataDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t('features.amendments.editContent.statusLabel')}</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('features.amendments.editContent.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Drafting">
                    {t('features.amendments.editContent.statusDrafting')}
                  </SelectItem>
                  <SelectItem value="Under Review">
                    {t('features.amendments.editContent.statusUnderReview')}
                  </SelectItem>
                  <SelectItem value="Passed">
                    {t('features.amendments.editContent.statusPassed')}
                  </SelectItem>
                  <SelectItem value="Rejected">
                    {t('features.amendments.editContent.statusRejected')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">{t('features.amendments.editContent.dateLabel')}</Label>
              <Input
                id="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                placeholder={t('features.amendments.editContent.datePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supporters">
                {t('features.amendments.editContent.supportersLabel')}
              </Label>
              <Input
                id="supporters"
                type="number"
                min="0"
                value={formData.supporters}
                onChange={e =>
                  setFormData({ ...formData, supporters: parseInt(e.target.value, 10) || 0 })
                }
                placeholder={t('features.amendments.editContent.supportersPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('features.amendments.editContent.workflowSettings')}</CardTitle>
            <CardDescription>
              {t('features.amendments.editContent.workflowSettingsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflowStatus">
                {t('features.amendments.editContent.workflowStatusLabel')}
              </Label>
              <Select
                value={formData.workflowStatus}
                onValueChange={value =>
                  setFormData({ ...formData, workflowStatus: value as WorkflowStatus })
                }
                disabled={isEventPhase(formData.workflowStatus)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('features.amendments.editContent.selectWorkflowStatus')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {COLLABORATOR_SELECTABLE_STATUSES.map(status => {
                    const config = WORKFLOW_STATUS_METADATA[status];
                    return (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {WORKFLOW_STATUS_METADATA[formData.workflowStatus].description}
              </p>
              {isEventPhase(formData.workflowStatus) && (
                <p className="text-xs text-amber-600">
                  {t('features.amendments.editContent.eventPhaseWarning')}
                </p>
              )}
            </div>

            {formData.workflowStatus === 'internal_voting' && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoCloseVoting">
                      {t('features.amendments.editContent.autoCloseVoting')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('features.amendments.editContent.autoCloseVotingDescription')}
                    </p>
                  </div>
                  <Switch
                    id="autoCloseVoting"
                    checked={formData.autoCloseVoting}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, autoCloseVoting: checked })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.autoCloseVoting
                    ? t('features.amendments.editContent.autoCloseEnabled')
                    : t('features.amendments.editContent.autoCloseDisabled')}
                </p>
              </div>
            )}

            {amendment?.currentEventId && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {t('features.amendments.editContent.eventPhase')}
                </p>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  {t('features.amendments.editContent.eventPhaseDescription', {
                    eventId: amendment.currentEventId,
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('features.amendments.editContent.tagsTitle')}</CardTitle>
            <CardDescription>
              {t('features.amendments.editContent.tagsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HashtagEditor
              value={formData.hashtags}
              onChange={(tags) => setFormData({ ...formData, hashtags: tags })}
              placeholder={t('features.amendments.editContent.addTagPlaceholder')}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: isCreating ? '/create' : `/amendment/${amendmentId}` })}
            disabled={isSubmitting}
          >
            {t('features.amendments.editContent.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreating ? t('pages.create.common.creating') : t('features.amendments.editContent.saving')}
              </>
            ) : (
              isCreating ? t('pages.create.next') : t('features.amendments.editContent.saveChanges')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
