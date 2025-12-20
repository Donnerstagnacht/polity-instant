import { toast } from 'sonner';
import { useInstantUpload } from '@/hooks/use-instant-upload';
import { useUserMutations } from './useUserMutations';

// Co-located types
export interface UseAvatarUploadOptions {
  userId: string;
}

export interface UseAvatarUploadReturn {
  isUploading: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function useAvatarUpload({ userId }: UseAvatarUploadOptions): UseAvatarUploadReturn {
  const { uploadFile, isUploading } = useInstantUpload();
  const { linkAvatarFile } = useUserMutations();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      // Upload to InstantDB Storage using user ID as path
      const avatarPath = `${userId}/avatar`;
      const result = await uploadFile(avatarPath, file, {
        contentType: file.type,
      });

      // Link the uploaded file to the user
      if (result?.data?.id) {
        await linkAvatarFile(userId, result.data.id);
        // The avatar URL will be automatically updated through the real-time query
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Avatar upload error:', error);
    }
  };

  return {
    isUploading,
    handleAvatarUpload,
  };
}
