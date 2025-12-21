/**
 * Group Update Hook
 *
 * Manages form state and mutations for updating group information.
 * Handles group profile updates including basic info, location, and social media.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import db, { tx } from '../../../../db/db';
import { syncGroupNameToConversation } from '@/utils/groupConversationSync';

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
};

/**
 * Hook for managing group update form state and mutations
 *
 * @param groupId - ID of the group to update
 * @param initialData - Initial form data (usually from fetched group data)
 * @returns Form state, handlers, and submission logic
 *
 * @example
 * const { formData, updateField, handleSubmit, isSubmitting } = useGroupUpdate(groupId, group);
 */
export function useGroupUpdate(
  groupId: string,
  initialData?: Partial<GroupFormData>
): UseGroupUpdateResult {
  const router = useRouter();
  const [formData, setFormData] = useState<GroupFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalName, setOriginalName] = useState('');

  // Initialize form data when initial data is provided
  useEffect(() => {
    if (initialData) {
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

      // Update the group in Instant DB
      await db.transact([
        tx.groups[groupId].update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          region: formData.region,
          country: formData.country,
          imageURL: formData.imageURL,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook,
          snapchat: formData.snapchat,
          updatedAt: new Date(),
        }),
      ]);

      // Sync name to group conversation if it changed
      if (nameChanged) {
        await syncGroupNameToConversation(groupId, formData.name);
      }

      toast.success('Group updated successfully');

      // Wait a moment for the DB to update, then navigate
      setTimeout(() => {
        router.push(`/group/${groupId}`);
      }, 500);
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
