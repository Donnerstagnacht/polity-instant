import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUserMutations } from './useUserMutations';
import type { User } from '../types/user.types';

// Co-located types
export interface UserProfileFormData {
  name: string;
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
  const router = useRouter();
  const { updateCompleteProfile } = useUserMutations();

  const [formData, setFormData] = useState<UserProfileFormData>({
    name: '',
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

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
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
        name: formData.name,
        subtitle: formData.subtitle,
        about: formData.about,
        avatar: formData.avatar,
        contactEmail: formData.email,
        contactTwitter: formData.twitter,
        contactWebsite: formData.website,
        contactLocation: formData.location,
        hashtags: formData.hashtags,
      });

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          // Wait a moment for the DB to update, then navigate
          setTimeout(() => {
            router.push(`/user/${userId}`);
          }, 500);
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
