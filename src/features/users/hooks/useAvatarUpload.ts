import { useState } from 'react';
import { toast } from 'sonner';
import { useUserActions } from '@/zero/users/useUserActions';
import { createClient } from '@/lib/supabase/client';

// Co-located types
export interface UseAvatarUploadOptions {
  userId: string;
  onSuccess?: (avatarUrl: string) => void;
}

export interface UseAvatarUploadReturn {
  isUploading: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function useAvatarUpload({ userId, onSuccess }: UseAvatarUploadOptions): UseAvatarUploadReturn {
  const userActions = useUserActions();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Reset file input so picking the same file again triggers onChange
    const input = e.target;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const avatarPath = `${userId}/avatar`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      // Get public URL with cache-busting param to avoid stale browser cache
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update user's avatar URL
      await userActions.updateProfile({
        avatar: avatarUrl,
      });

      onSuccess?.(avatarUrl);
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  return {
    isUploading,
    handleAvatarUpload,
  };
}
