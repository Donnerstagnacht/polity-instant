import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface UploadOptions {
  contentType?: string;
  contentDisposition?: string;
}

const STORAGE_BUCKET = 'uploads';

export function useInstantUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (path: string, file: File, opts?: UploadOptions) => {
    setIsUploading(true);
    setError(null);

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          contentType: opts?.contentType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      return { data: { id: data.path, url: urlData.publicUrl } };
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Upload failed');
      setError(uploadError);
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (path: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (deleteError) throw deleteError;
    } catch (err) {
      const delError = err instanceof Error ? err : new Error('Delete failed');
      setError(delError);
      throw delError;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
    error,
  };
}
