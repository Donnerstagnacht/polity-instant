/**
 * Group Edit Form Component
 *
 * Complete form for editing group information including basic info,
 * location, social media, and image upload.
 */

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { HashtagEditor } from '@/components/ui/hashtag-editor';
import { BasicInfoSection } from './BasicInfoSection';
import { LocationInfoSection } from './LocationInfoSection';
import { SocialMediaSection } from './SocialMediaSection';
import { useGroupUpdate } from '../hooks/useGroupUpdate';
import type { GroupFormData } from '../hooks/useGroupUpdate';
import { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { CreateReviewCard, SummaryField } from '@/components/ui/create-review-card';

interface GroupEditFormProps {
  groupId: string;
  initialData?: Partial<GroupFormData>;
  onCancel?: () => void;
  actorId?: string;
  visibility?: 'public' | 'private' | 'authenticated';
}

export function GroupEditForm({ groupId, initialData, onCancel, actorId, visibility }: GroupEditFormProps) {
  const { t } = useTranslation();
  const isCreating = !initialData;
  const [showReview, setShowReview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { formData, setFormData, updateField, handleSubmit, isSubmitting } = useGroupUpdate(
    groupId,
    initialData,
    { actorId, visibility }
  );

  const onFormSubmit = (e: React.FormEvent) => {
    if (isCreating && !showReview) {
      e.preventDefault();
      if (!formData.name.trim()) return;
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
            badge={t('pages.create.group.reviewBadge')}
            title={formData.name || 'Untitled Group'}
            subtitle={formData.description || undefined}
            hashtags={formData.hashtags}
            gradient="from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/50"
          >
            {formData.location && <SummaryField label={t('pages.create.common.group')} value={formData.location} />}
            {formData.country && <SummaryField label="Country" value={formData.country} />}
            {formData.region && <SummaryField label="Region" value={formData.region} />}
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
                t('pages.create.group.createButton')
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
    <form ref={formRef} onSubmit={onFormSubmit} className="space-y-6">
      {/* Group Image Section */}
      <ImageUpload
        currentImage={formData.imageURL}
        onImageChange={(url: string) => updateField('imageURL', url)}
        entityType="groups"
        entityId={groupId}
        label="Group Image"
        description="Upload a group image or provide a URL"
      />

      {/* Basic Information */}
      <BasicInfoSection formData={formData} onChange={updateField} />

      {/* Location Information */}
      <LocationInfoSection formData={formData} onChange={updateField} />

      {/* Social Media Links */}
      <SocialMediaSection formData={formData} onChange={updateField} />

      {/* Hashtags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Hashtags</label>
        <HashtagEditor
          value={formData.hashtags}
          onChange={(tags) => setFormData({ ...formData, hashtags: tags })}
          placeholder="Add hashtags..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isCreating ? t('pages.create.common.creating') : 'Saving...'}
            </>
          ) : (
            isCreating ? t('pages.create.next') : 'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
