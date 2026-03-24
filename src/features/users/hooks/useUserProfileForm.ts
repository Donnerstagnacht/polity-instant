import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUserMutations } from './useUserMutations';
import { useCommonState } from '@/zero/common/useCommonState';
import type { UserProfile } from '../types/user.types';
import { type Visibility } from '@/features/auth/logic/checkEntityAccess';

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
  visibility: Visibility;
  hashtags: string[];
}

export interface UseUserProfileFormOptions {
  userId: string;
  user: UserProfile | null;
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
  const { userHashtags, allHashtags } = useCommonState({
    user_id: userId,
    loadAllHashtags: true,
  });

  // Derive tag strings from junction data
  const existingTags = useMemo(
    () => (userHashtags ?? []).map(j => j.hashtag?.tag).filter(Boolean) as string[],
    [userHashtags]
  );

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
    visibility: 'public' as Visibility,
    hashtags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedRef = useRef(false);
  const hashtagsInitializedRef = useRef(false);

  // Initialize form data only once when user data first loads
  useEffect(() => {
    if (user && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        subtitle: user.bio || '',
        about: user.about || '',
        email: user.email || '',
        twitter: user.x || '',
        website: user.website || '',
        location: user.location || '',
        avatar: user.avatar || '',
        visibility: (user.visibility as Visibility) ?? 'public',
        hashtags: [],
      });
    }
  }, [user]);

  // Initialize hashtags once junction data loads
  useEffect(() => {
    if (existingTags.length > 0 && !hashtagsInitializedRef.current) {
      hashtagsInitializedRef.current = true;
      setFormData(prev => ({ ...prev, hashtags: existingTags }));
    }
  }, [existingTags]);

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
        visibility: formData.visibility,
        hashtags: formData.hashtags,
        existingJunctions: userHashtags ?? [],
        allHashtags: allHashtags ?? [],
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
