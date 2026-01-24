'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { VideoUpload } from '@/components/shared/VideoUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import db, { tx } from '../../../../db/db';
import type { WorkflowStatus } from '@db/rbac/workflow-constants';
import {
  WORKFLOW_STATUS_METADATA,
  COLLABORATOR_SELECTABLE_STATUSES,
  isEventPhase,
} from '@db/rbac/workflow-constants';
import { useTranslation } from '@/hooks/use-translation';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

interface AmendmentEditContentProps {
  amendmentId: string;
  amendment: any;
  collaborators: any[];
  currentUserId: string;
  isLoading: boolean;
}

export function AmendmentEditContent({
  amendmentId,
  amendment,
  collaborators,
  currentUserId,
  isLoading,
}: AmendmentEditContentProps) {
  const router = useRouter();
  const { t } = useTranslation();

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
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (amendment) {
      setFormData({
        title: amendment.title || '',
        subtitle: amendment.subtitle || '',
        code: amendment.code || '',
        imageURL: amendment.imageURL || '',
        videoURL: amendment.videoURL || '',
        videoThumbnailURL: amendment.videoThumbnailURL || '',
        status: amendment.status || 'Drafting',
        workflowStatus: (amendment.workflowStatus as WorkflowStatus) || 'collaborative_editing',
        autoCloseVoting: false, // Will be loaded from document settings
        date: amendment.date || new Date().toLocaleDateString(),
        supporters: amendment.supporters || 0,
        tags: Array.isArray(amendment.tags) ? amendment.tags : [],
      });
    }
  }, [amendment]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!amendment) {
        toast.error(t('features.amendments.editContent.updateFailed'));
        return;
      }
      const transactions: any[] = [];
      // Only push update if something changed
      transactions.push(
        tx.amendments[amendmentId].update({
          title: formData.title,
          subtitle: formData.subtitle,
          code: formData.code,
          imageURL: formData.imageURL,
          videoURL: formData.videoURL,
          videoThumbnailURL: formData.videoThumbnailURL,
          status: formData.status,
          workflowStatus: formData.workflowStatus,
          date: formData.date,
          supporters: formData.supporters,
          tags: formData.tags,
        })
      );
      // Only create timeline events for public amendments
      if (amendment.visibility === 'public') {
        if (formData.imageURL && formData.imageURL !== amendment.imageURL) {
          transactions.push(
            createTimelineEvent({
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
            })
          );
        }
        if (formData.videoURL && formData.videoURL !== amendment.videoURL) {
          transactions.push(
            createTimelineEvent({
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
            })
          );
        }
      }
      await db.transact(transactions);
      toast.success(t('features.amendments.editContent.updateSuccess'));
      setTimeout(() => {
        router.push(`/amendment/${amendmentId}`);
      }, 500);
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

  if (!amendment) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">{t('features.amendments.editContent.notFound')}</p>
          <p className="text-muted-foreground">
            {t('features.amendments.editContent.noDataExists')}
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push(`/`)} variant="default">
              {t('features.amendments.editContent.backToHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('features.amendments.editContent.pageTitle')}</h1>
        <p className="text-muted-foreground">
          {t('features.amendments.editContent.pageDescription')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUpload
          currentImage={formData.imageURL}
          onImageChange={(url: string) => setFormData({ ...formData, imageURL: url })}
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
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={t('features.amendments.editContent.addTagPlaceholder')}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                {t('features.amendments.editContent.addButton')}
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/amendment/${amendmentId}`)}
            disabled={isSubmitting}
          >
            {t('features.amendments.editContent.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('features.amendments.editContent.saving')}
              </>
            ) : (
              t('features.amendments.editContent.saveChanges')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
