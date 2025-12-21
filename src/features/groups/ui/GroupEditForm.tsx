/**
 * Group Edit Form Component
 *
 * Complete form for editing group information including basic info,
 * location, social media, and image upload.
 */

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { BasicInfoSection } from './BasicInfoSection';
import { LocationInfoSection } from './LocationInfoSection';
import { SocialMediaSection } from './SocialMediaSection';
import { useGroupUpdate } from '../hooks/useGroupUpdate';
import type { GroupFormData } from '../hooks/useGroupUpdate';

interface GroupEditFormProps {
  groupId: string;
  initialData?: Partial<GroupFormData>;
  onCancel?: () => void;
}

export function GroupEditForm({ groupId, initialData, onCancel }: GroupEditFormProps) {
  const { formData, updateField, handleSubmit, isSubmitting } = useGroupUpdate(
    groupId,
    initialData
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Image Section */}
      <ImageUpload
        currentImage={formData.imageURL}
        onImageChange={(url: string) => updateField('imageURL', url)}
        label="Group Image"
        description="Upload a group image or provide a URL"
      />

      {/* Basic Information */}
      <BasicInfoSection formData={formData} onChange={updateField} />

      {/* Location Information */}
      <LocationInfoSection formData={formData} onChange={updateField} />

      {/* Social Media Links */}
      <SocialMediaSection formData={formData} onChange={updateField} />

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
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
