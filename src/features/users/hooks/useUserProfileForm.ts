import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUserMutations } from './useUserMutations';
import type { User } from '../types/user.types';

// Co-located types
export interface UserProfileFormData {
  firstName: string;
  lastName: string;
  subtitle: string;
  about: string;
  email: string;
  twitter: string;
  website: string;
  location: string;
  avatar: string;
  hashtags: string[];
}

export interface UseUserProfileFormOptions {
  userId: string;
  user: User | null;
  onSuccess?: () => void;
}

export interface UseUserProfileFormReturn {
  formData: UserProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserProfileFormData>>;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  updateField: <K extends keyof UserProfileFormData>(
    field: K,
    value: UserProfileFormData[K]
  ) => void;
}

export function useUserProfileForm({
  userId,
  user,
  onSuccess,
}: UseUserProfileFormOptions): UseUserProfileFormReturn {
  const navigate = useNavigate();
  const { updateCompleteProfile } = useUserMutations();

  const [formData, setFormData] = useState<UserProfileFormData>({
    firstName: '',
    lastName: '',
    subtitle: '',
    about: '',
    email: '',
    twitter: '',
    website: '',
    location: '',
    avatar: '',
    hashtags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedRef = useRef(false);

  // Initialize form data only once when user data first loads
  useEffect(() => {
    if (user && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        subtitle: user.subtitle || '',
        about: user.about || '',
        email: user.contact?.email || '',
        twitter: user.contact?.twitter || '',
        website: user.contact?.website || '',
        location: user.contact?.location || '',
        avatar: user.avatar || '',
        hashtags: [], // Will be populated separately from linked hashtags
      });
    }
  }, [user]);

  const updateField = <K extends keyof UserProfileFormData>(
    field: K,
    value: UserProfileFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error('No user data to update');
        return;
      }

      // Update the user using the mutations hook
      const result = await updateCompleteProfile(userId, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        bio: formData.subtitle,
        about: formData.about,
        avatar: formData.avatar,
        x: formData.twitter,
        website: formData.website,
        location: formData.location,
        hashtags: formData.hashtags,
      });

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate({ to: `/user/${userId}` });
        }
      }
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    updateField,
  };
}
