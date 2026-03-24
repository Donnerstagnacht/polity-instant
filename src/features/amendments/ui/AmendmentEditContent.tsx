'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ChevronDown, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx';
import { VideoUpload } from '@/features/file-upload/ui/VideoUpload.tsx';
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/features/shared/ui/ui/dropdown-menu.tsx';
import { Switch } from '@/features/shared/ui/ui/switch';
import { VisibilityInput } from '@/features/create/ui/inputs/VisibilityInput';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import type { EditingMode } from '@/zero/rbac/workflow-constants';
import { type Visibility } from '@/features/auth/logic/checkEntityAccess';
import {
  SELECTABLE_MODES,
  isEventPhase,
  normalizeEditingMode,
} from '@/zero/rbac/workflow-constants';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { notifyAmendmentProfileUpdated } from '@/features/notifications/utils/notification-helpers.ts';
import type { AmendmentCollaboratorRow } from '@/zero/amendments/queries';
import { CreateReviewCard, SummaryField } from '@/features/shared/ui/ui/create-review-card';
import {
  EditingModeMenuItems,
  getEditingModeOption,
  type SelectableEditingMode,
} from '@/features/shared/ui/ui/editing-mode.tsx';

interface AmendmentEditContentProps {
  amendmentId: string;
  amendment: ReturnType<typeof useAmendmentState>['amendment'];
  collaborators: readonly AmendmentCollaboratorRow[];
  currentUserId: string;
  isLoading: boolean;
  mode?: 'create' | 'edit';
  agendaItemId?: string;
}

export function AmendmentEditContent({
  amendmentId,
  amendment,
  collaborators,
  currentUserId,
  isLoading,
  mode,
  agendaItemId,
}: AmendmentEditContentProps) {
  const isCreating = mode === 'create' || !amendment;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateAmendment, createAmendment, updateEditingMode } = useAmendmentActions();
  const { initializeChangeRequestVoting } = useAgendaActions();
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
    workflowStatus: 'edit' as EditingMode,
    autoCloseVoting: false,
    visibility: 'public' as Visibility,
    date: '',
    supporters: 0,
    hashtags: [] as string[],
  });
  const workflowStatusOption = getEditingModeOption(formData.workflowStatus, t);
  const workflowMenuValue = (
    SELECTABLE_MODES.includes(formData.workflowStatus) ? formData.workflowStatus : 'view'
  ) as SelectableEditingMode;

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
        subtitle: '',
        code: amendment.code || '',
        imageURL: amendment.image_url || '',
        videoURL: '',
        videoThumbnailURL: '',
        workflowStatus: normalizeEditingMode(amendment.editing_mode),
        autoCloseVoting: false, // Will be loaded from document settings
        visibility: (amendment.visibility as Visibility) ?? 'public',
        date: new Date().toLocaleDateString(),
        supporters: 0,
        hashtags: amendmentHashtags
          ? amendmentHashtags.map(j => j.hashtag?.tag).filter((t): t is string => !!t)
          : Array.isArray(amendment.tags) ? amendment.tags : [],
      });
    }
  }, [amendment]);

  useEffect(() => {
    if (!amendment || !initializedRef.current) return;

    const workflowStatus = normalizeEditingMode(amendment.editing_mode);

    setFormData(prev =>
      prev.workflowStatus === workflowStatus ? prev : { ...prev, workflowStatus }
    );
  }, [amendment?.editing_mode]);

  const handleWorkflowStatusChange = useCallback(
    async (value: SelectableEditingMode) => {
      if (value === formData.workflowStatus) return;

      const previousWorkflowStatus = formData.workflowStatus;
      console.info('[AmendmentEditContent] Changing workflow status from settings', {
        amendmentId,
        newMode: value,
        previousMode: previousWorkflowStatus,
      });
      setFormData(prev => ({ ...prev, workflowStatus: value as EditingMode }));

      if (isCreating || !amendment) {
        return;
      }

      try {
        await updateEditingMode(amendmentId, value);
        console.info('[AmendmentEditContent] Workflow status persisted from settings', {
          amendmentId,
          newMode: value,
          previousMode: previousWorkflowStatus,
        });

        // Initialize CR voting when transitioning to vote_event
        if (value === 'vote_event' && agendaItemId) {
          console.info('[AmendmentEditContent] Initializing CR voting', {
            amendmentId,
            agendaItemId,
          });
          await initializeChangeRequestVoting({
            amendment_id: amendmentId,
            agenda_item_id: agendaItemId,
            voting_context: 'event',
          });
          console.info('[AmendmentEditContent] CR voting initialized', {
            amendmentId,
            agendaItemId,
          });
        } else if (value === 'vote_event' && !agendaItemId) {
          console.warn('[AmendmentEditContent] Cannot initialize CR voting — no agenda item linked to this amendment', {
            amendmentId,
          });
        }
      } catch (error) {
        setFormData(prev => ({ ...prev, workflowStatus: previousWorkflowStatus }));
        console.error('[AmendmentEditContent] Failed to persist workflow status from settings', {
          amendmentId,
          newMode: value,
          previousMode: previousWorkflowStatus,
          error,
        });
      }
    },
    [amendment, amendmentId, agendaItemId, formData.workflowStatus, isCreating, updateEditingMode, initializeChangeRequestVoting]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isCreating) {
        await createAmendment({
          id: amendmentId,
          title: formData.title || null,
          code: formData.code || null,
          editing_mode: formData.workflowStatus || null,
          reason: null,
          category: null,
          preamble: null,
          group_id: null,
          event_id: null,
          clone_source_id: null,
          document_id: null,
          tags: formData.hashtags.length > 0 ? formData.hashtags : null,
          visibility: formData.visibility,
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
          editing_mode: formData.workflowStatus,
          visibility: formData.visibility,
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
        if (formData.imageURL && formData.imageURL !== amendment.image_url) {
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
        if (formData.videoURL) {
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
            secondaryBadge={workflowStatusOption.label}
            title={formData.title || 'Untitled Amendment'}
            subtitle={formData.subtitle || undefined}
            hashtags={formData.hashtags}
            gradient="from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/50"
          >
            {formData.code && <SummaryField label={t('features.amendments.editContent.codeLabel')} value={formData.code.length > 200 ? formData.code.slice(0, 200) + '…' : formData.code} />}
            <SummaryField label={t('features.amendments.editContent.workflowStatusLabel')} value={workflowStatusOption.label} />
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
            <VisibilityInput value={formData.visibility} onChange={v => setFormData({ ...formData, visibility: v })} />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isEventPhase(formData.workflowStatus)}
                  >
                    <span className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${workflowStatusOption.colorClass}`} />
                      <workflowStatusOption.Icon className="h-4 w-4" />
                      <span>{workflowStatusOption.label}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <EditingModeMenuItems
                    value={workflowMenuValue}
                    onValueChange={handleWorkflowStatusChange}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-muted-foreground">
                {workflowStatusOption.description}
              </p>
              {isEventPhase(formData.workflowStatus) && (
                <p className="text-xs text-amber-600">
                  {t('features.amendments.editContent.eventPhaseWarning')}
                </p>
              )}
            </div>

            {formData.workflowStatus === 'vote_internal' && (
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
                    onCheckedChange={(checked: boolean) =>
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

            {amendment?.event_id && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {t('features.amendments.editContent.eventPhase')}
                </p>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  {t('features.amendments.editContent.eventPhaseDescription', {
                    eventId: amendment.event_id,
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
