import { useState } from 'react';
import { toast } from 'sonner';
import { useUserActions } from '@/zero/users/useUserActions';
import { createClient } from '@/lib/supabase/client';

// Co-located types
export interface UseAvatarUploadOptions {
  userId: string;
}

export interface UseAvatarUploadReturn {
  isUploading: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function useAvatarUpload({ userId }: UseAvatarUploadOptions): UseAvatarUploadReturn {
  const userActions = useUserActions();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const avatarPath = `${userId}/avatar`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(avatarPath);

      // Update user's avatar URL
      await userActions.updateProfile({
        avatar: urlData.publicUrl,
      });
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleAvatarUpload,
  };
}
