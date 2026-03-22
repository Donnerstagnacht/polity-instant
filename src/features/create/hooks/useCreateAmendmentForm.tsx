import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuth } from '@/providers/auth-provider';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx';
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor';
import { VisibilityInput } from '../ui/inputs/VisibilityInput';
import { CreateSummaryStep } from '../ui/CreateSummaryStep';
import { TargetGroupEventSelector, TargetGroupEventDisplay } from '@/features/amendments/ui/TargetGroupEventSelector';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import { enrichPathSegments } from '@/features/amendments/logic/amendmentPathHelpers';
import { useCreateAmendmentPath } from '@/features/amendments/hooks/useCreateAmendmentPath';
import type { CreateFormConfig } from '../types/create-form.types';

interface CreateTargetGroupData {
  id: string;
  abbr?: string | null;
  name?: string | null;
  description?: string | null;
  member_count?: number | null;
  event_count?: number | null;
  amendment_count?: number | null;
}

interface CreateTargetEventData {
  id: string;
  title?: string | null;
  is_public?: boolean | null;
  start_date?: number | null;
  location_name?: string | null;
  description?: string | null;
  participant_count?: number | null;
}

export function useCreateAmendmentForm(): CreateFormConfig {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createAmendment } = useAmendmentActions();
  const { createDocument, addCollaborator } = useDocumentActions();
  const commonActions = useCommonActions();
  const { createAmendmentPath } = useCreateAmendmentPath();

  const [amendmentId] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'authenticated' | 'private'>('public');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [targetSelection, setTargetSelection] = useState<{
    groupId: string;
    groupData: CreateTargetGroupData;
    eventId: string;
    eventData: CreateTargetEventData;
    pathWithEvents: Array<{
      groupId: string;
      groupName: string;
      eventId: string | null;
      eventTitle: string;
      eventStartDate: number | null;
    }>;
    workflowId: string | null;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { allHashtags } = useCommonState({ loadAllHashtags: true });

  const handleSubmit = async () => {
    if (!title.trim() || !user?.id) return;
    setIsSubmitting(true);
    try {
      const normalizedGroupId = targetSelection?.groupId ? targetSelection.groupId : null;
      const normalizedEventId = targetSelection?.eventId ? targetSelection.eventId : null;
      const documentId = crypto.randomUUID();

      // Create document first so amendment can reference it
      await createDocument({
        id: documentId,
        amendment_id: null,
        content: [
          { type: 'h1', children: [{ text: title.trim() }] },
          { type: 'p', children: [{ text: '' }] },
        ],
        editing_mode: 'collaborative',
      });

      await createAmendment({
        id: amendmentId,
        title: title.trim(),
        code: subtitle || null,
        status: 'Drafting',
        workflow_status: 'collaborative_editing',
        reason: null,
        category: null,
        preamble: null,
        group_id: normalizedGroupId,
        event_id: normalizedEventId,
        clone_source_id: null,
        document_id: documentId,
        tags: hashtags.length > 0 ? hashtags : null,
        visibility,
        is_public: visibility === 'public',
        editing_mode: null,
        discussions: null,
        image_url: imageURL || null,
        x: null,
        youtube: null,
        linkedin: null,
        website: null,
      });

      // Add creator as document collaborator
      await addCollaborator({
        id: crypto.randomUUID(),
        document_id: documentId,
        user_id: user.id,
        role_id: null,
        status: 'active',
        visibility: 'public',
      });

      if (hashtags.length > 0) {
        await commonActions.syncEntityHashtags(
          'amendment',
          amendmentId,
          hashtags,
          [],
          allHashtags ?? []
        );
      }

      // Create amendment path with agenda items and votes if target was selected
      if (targetSelection?.pathWithEvents && targetSelection.pathWithEvents.length > 0) {
        const enrichedPath = enrichPathSegments(
          targetSelection.pathWithEvents,
          targetSelection.groupId,
          targetSelection.eventId,
          targetSelection.eventData.title ?? null,
          targetSelection.eventData.start_date ?? null,
        );

        await createAmendmentPath({
          amendmentId,
          amendmentTitle: title.trim(),
          amendmentReason: null,
          enrichedPath,
          workflowId: targetSelection.workflowId,
        });
      }

      navigate({ to: `/amendment/${amendmentId}` });
    } catch {
      setIsSubmitting(false);
    }
  };

  const config = useMemo(
    (): CreateFormConfig => ({
      entityType: 'amendment',
      title: 'pages.create.amendment.title',
      isSubmitting,
      onSubmit: handleSubmit,
      steps: [
        {
          label: t('pages.create.amendment.basicInfo'),
          isValid: () => !!title.trim(),
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('pages.create.amendment.titleLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.amendment.tips.title')}</p>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('pages.create.amendment.titlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.amendment.subtitleOptional')}</Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.amendment.tips.subtitle')}</p>
                <Input
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder={t('pages.create.amendment.subtitlePlaceholder')}
                />
              </div>
              <ImageUpload
                currentImage={imageURL}
                onImageChange={(url: string) => setImageURL(url)}
                entityType="amendments"
                entityId={amendmentId}
                label={t('pages.create.amendment.imageLabel')}
                description={t('pages.create.amendment.imageDescription')}
              />
            </div>
          ),
        },
        {
          label: t('pages.create.amendment.targetGroupEvent'),
          isValid: () => !!targetSelection,
          content: (
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs">
                {t('pages.create.amendment.tips.targetGroupEvent')}
              </p>
              {user?.id ? (
                <TargetGroupEventSelector
                  userId={user.id}
                  onSelect={(selection) => {
                    setTargetSelection({
                      groupId: selection.groupId,
                      groupData: selection.groupData,
                      eventId: selection.eventId,
                      eventData: selection.eventData,
                      pathWithEvents: selection.pathWithEvents,
                      workflowId: selection.workflowId,
                    });
                  }}
                  selectedGroupId={targetSelection?.groupId}
                  selectedEventId={targetSelection?.eventId}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{t('pages.create.common.loading')}</p>
              )}

              {targetSelection && (
                <TargetGroupEventDisplay
                  groupData={targetSelection.groupData}
                  eventData={targetSelection.eventData}
                  pathWithEvents={targetSelection.pathWithEvents}
                />
              )}
            </div>
          ),
        },
        {
          label: t('pages.create.amendment.visibilityAndTags'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <VisibilityInput value={visibility} onChange={setVisibility} />
              <HashtagEditor
                value={hashtags}
                onChange={setHashtags}
                placeholder={t('pages.create.amendment.hashtagPlaceholder')}
              />
            </div>
          ),
        },
        {
          label: t('pages.create.common.review'),
          isValid: () => !!title.trim(),
          content: (
            <CreateSummaryStep
              entityType="amendment"
              badge={t('pages.create.amendment.reviewBadge')}
              title={title || t('pages.create.amendment.titlePlaceholder')}
              subtitle={subtitle || undefined}
              hashtags={hashtags.length > 0 ? hashtags : undefined}
              fields={[
                ...(targetSelection
                  ? [
                      {
                        label: t('pages.create.amendment.target'),
                        value: `${String(targetSelection.groupData.name ?? '')} -> ${String(targetSelection.eventData.title ?? '')}`,
                      },
                    ]
                  : []),
                {
                  label: t('pages.create.common.visibility'),
                  value: visibility,
                },
              ]}
            />
          ),
        },
      ],
    }),
    [title, subtitle, imageURL, visibility, hashtags, targetSelection, isSubmitting, amendmentId, t, user?.id]
  );

  return config;
}
