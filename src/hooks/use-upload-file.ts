import * as React from 'react';

import { toast } from 'sonner';
import { z } from 'zod';
import { db } from '../../db/db';

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
  key: string;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  onUploadProgress?: (progress: number) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      // Generate a unique path for the file
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `editor-uploads/${timestamp}-${sanitizedName}`;

      // Simulate progress updates since InstantDB doesn't provide native progress tracking
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = Math.min(prev + 10, 90);
          onUploadProgress?.(next);
          return next;
        });
      }, 100);

      // Upload to InstantDB storage
      const uploadResult = await db.storage.uploadFile(path, file, {
        contentType: file.type,
      });

      clearInterval(progressInterval);
      setProgress(100);
      onUploadProgress?.(100);

      // InstantDB returns { data: { id } }
      const fileId = uploadResult.data.id;

      // Query the file to get its signed URL
      const { data: fileData } = await db.queryOnce({
        $files: {
          $: {
            where: {
              id: fileId,
            },
          },
        },
      });

      const fileUrl = fileData?.$files?.[0]?.url || '';

      const uploadedFileData: UploadedFile = {
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        key: fileId,
      };

      setUploadedFile(uploadedFileData);
      onUploadComplete?.(uploadedFileData);

      return uploadedFileData;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      const message =
        errorMessage.length > 0 ? errorMessage : 'Something went wrong, please try again later.';

      toast.error(message);

      onUploadError?.(error);

      throw error;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map(issue => {
      return issue.message;
    });

    return errors.join('\n');
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);

  return toast.error(errorMessage);
}
