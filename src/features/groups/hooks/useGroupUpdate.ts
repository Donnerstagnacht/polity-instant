/**
 * Group Update Hook
 *
 * Manages form state and mutations for updating group information.
 * Handles group profile updates including basic info, location, and social media.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import { syncGroupNameToConversation } from '@/features/shared/utils/groupConversationSync';
import { notifyGroupProfileUpdated } from '@/features/shared/utils/notification-helpers';

export interface GroupFormData {
  name: string;
  description: string;
  location: string;
  region: string;
  country: string;
  imageURL: string;
  whatsapp: string;
  instagram: string;
  twitter: string;
  facebook: string;
  snapchat: string;
  hashtags: string[];
}

interface UseGroupUpdateResult {
  formData: GroupFormData;
  setFormData: (data: GroupFormData) => void;
  updateField: (field: keyof GroupFormData, value: string) => void;
  isSubmitting: boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

const initialFormState: GroupFormData = {
  name: '',
  description: '',
  location: '',
  region: '',
  country: '',
  imageURL: '',
  whatsapp: '',
  instagram: '',
  twitter: '',
  facebook: '',
  snapchat: '',
  hashtags: [],
};

/**
 * Hook for managing group update form state and mutations
 *
 * @param groupId - ID of the group to update
 * @param initialData - Initial form data (usually from fetched group data)
 * @param options - Additional options like actorId and visibility
 * @returns Form state, handlers, and submission logic
 *
 * @example
 * const { formData, updateField, handleSubmit, isSubmitting } = useGroupUpdate(groupId, group, { actorId: userId, visibility: 'public' });
 */
export function useGroupUpdate(
  groupId: string,
  initialData?: Partial<GroupFormData>,
  options?: { actorId?: string; visibility?: 'public' | 'private' | 'authenticated' }
): UseGroupUpdateResult {
  const navigate = useNavigate();
  const { createGroup, updateGroup, setupGroupAdminRoles } = useGroupActions();
  const isCreating = !initialData;
  const commonActions = useCommonActions();
  const { groupHashtags, allHashtags } = useCommonState({
    group_id: groupId,
    loadAllHashtags: true,
  });
  const [formData, setFormData] = useState<GroupFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalName, setOriginalName] = useState('');

  const initializedRef = useRef(false);
  const hashtagsInitializedRef = useRef(false);

  // Derive existing tags from junction data
  const existingTags = useMemo(
    () => (groupHashtags ?? []).map(j => j.hashtag?.tag).filter((t): t is string => !!t),
    [groupHashtags]
  );

  // Initialize hashtags from junction data once available
  useEffect(() => {
    if (existingTags.length > 0 && !hashtagsInitializedRef.current) {
      hashtagsInitializedRef.current = true;
      setFormData(prev => ({ ...prev, hashtags: existingTags }));
    }
  }, [existingTags]);

  // Initialize form data only once when initial data first becomes available
  useEffect(() => {
    if (initialData && !initializedRef.current) {
      initializedRef.current = true;
      const newFormData = {
        name: initialData.name || '',
        description: initialData.description || '',
        location: initialData.location || '',
        region: initialData.region || '',
        country: initialData.country || '',
        imageURL: initialData.imageURL || '',
        whatsapp: initialData.whatsapp || '',
        instagram: initialData.instagram || '',
        twitter: initialData.twitter || '',
        facebook: initialData.facebook || '',
        snapchat: initialData.snapchat || '',
        hashtags: initialData.hashtags || existingTags,
      };
      setFormData(newFormData);
      setOriginalName(initialData.name || '');
    }
  }, [initialData]);

  /**
   * Update a single form field
   */
  const updateField = (field: keyof GroupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    if (initialData) {
      const resetData = {
        name: initialData.name || '',
        description: initialData.description || '',
        location: initialData.location || '',
        region: initialData.region || '',
        country: initialData.country || '',
        imageURL: initialData.imageURL || '',
        whatsapp: initialData.whatsapp || '',
        instagram: initialData.instagram || '',
        twitter: initialData.twitter || '',
        facebook: initialData.facebook || '',
        snapchat: initialData.snapchat || '',
        hashtags: existingTags,
      };
      setFormData(resetData);
    } else {
      setFormData(initialFormState);
    }
  };

  /**
   * Handle form submission and group update
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if name changed
      const nameChanged = formData.name !== originalName;

      if (isCreating) {
        await createGroup({
          id: groupId,
          name: formData.name,
          description: formData.description || null,
          location: formData.location || null,
          image_url: formData.imageURL || null,
          x: formData.twitter || null,
          youtube: null,
          linkedin: null,
          website: null,
          is_public: true,
          visibility: options?.visibility ?? 'public',
          owner_id: null,
        });
        await setupGroupAdminRoles(groupId);
      } else {
        await updateGroup({
          id: groupId,
          name: formData.name,
          description: formData.description,
          location: formData.location,
          image_url: formData.imageURL || null,
          x: formData.twitter,
        });

        // Sync name to group conversation if it changed
        if (nameChanged) {
          await syncGroupNameToConversation(groupId, formData.name);
        }
      }

      // Sync hashtags
      await commonActions.syncEntityHashtags(
        'group',
        groupId,
        formData.hashtags,
        groupHashtags ?? [],
        allHashtags ?? []
      );

      toast.success('Group updated successfully');
      navigate({ to: `/group/${groupId}` });
    } catch (error) {
      toast.error('Failed to update group');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    isSubmitting,
    handleSubmit,
    resetForm,
  };
}
