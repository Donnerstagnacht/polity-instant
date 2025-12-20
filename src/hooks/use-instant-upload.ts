import { useState } from 'react';
import db from '../../db/db';

interface UploadOptions {
  contentType?: string;
  contentDisposition?: string;
}

export function useInstantUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (path: string, file: File, opts?: UploadOptions) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await db.storage.uploadFile(path, file, opts);
      return result;
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
      await db.storage.delete(path);
    } catch (err) {
      const deleteError = err instanceof Error ? err : new Error('Delete failed');
      setError(deleteError);
      throw deleteError;
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
