import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@/hooks/use-translation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { HashtagEditor } from '@/components/ui/hashtag-editor';
import { VisibilityInput } from '../ui/inputs/VisibilityInput';
import { CreateSummaryStep } from '../ui/CreateSummaryStep';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import type { CreateFormConfig } from '../types/create-form.types';

export function useCreateAmendmentForm(): CreateFormConfig {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createAmendment } = useAmendmentActions();
  const commonActions = useCommonActions();

  const [amendmentId] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'authenticated' | 'private'>('public');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { allHashtags } = useCommonState({ loadAllHashtags: true });

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await createAmendment({
        id: amendmentId,
        title: title.trim(),
        code: subtitle || null,
        status: 'Drafting',
        workflow_status: 'collaborative_editing',
        reason: null,
        category: null,
        preamble: null,
        group_id: null,
        event_id: null,
        clone_source_id: null,
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

      if (hashtags.length > 0) {
        await commonActions.syncEntityHashtags(
          'amendment',
          amendmentId,
          hashtags,
          [],
          allHashtags ?? []
        );
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
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('pages.create.amendment.titlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.amendment.subtitleOptional')}</Label>
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
                {
                  label: t('pages.create.common.visibility'),
                  value: visibility,
                },
              ]}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          ),
        },
      ],
    }),
    [title, subtitle, imageURL, visibility, hashtags, isSubmitting, amendmentId, t]
  );

  return config;
}
