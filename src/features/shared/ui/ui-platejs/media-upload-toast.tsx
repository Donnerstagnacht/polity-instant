import * as React from 'react';

import { PlaceholderPlugin, UploadErrorCode } from '@platejs/media/react';
import { usePluginOption } from 'platejs/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function MediaUploadToast() {
  useUploadErrorToast();

  return null;
}

const useUploadErrorToast = () => {
  const uploadError = usePluginOption(PlaceholderPlugin, 'error');
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!uploadError) return;

    const { code, data } = uploadError;

    switch (code) {
      case UploadErrorCode.INVALID_FILE_SIZE: {
        toast.error(
          t('mediaUpload.errors.invalidFileSize', {
            files: data.files.map(f => f.name).join(', '),
          })
        );
        break;
      }
      case UploadErrorCode.INVALID_FILE_TYPE: {
        toast.error(
          t('mediaUpload.errors.invalidFileType', {
            files: data.files.map(f => f.name).join(', '),
          })
        );
        break;
      }
      case UploadErrorCode.TOO_LARGE: {
        toast.error(
          t('mediaUpload.errors.tooLarge', {
            files: data.files.map(f => f.name).join(', '),
            maxFileSize: data.maxFileSize,
          })
        );
        break;
      }
      case UploadErrorCode.TOO_LESS_FILES: {
        toast.error(
          t('mediaUpload.errors.tooLessFiles', {
            minFileCount: data.minFileCount,
            fileType: data.fileType,
          })
        );
        break;
      }
      case UploadErrorCode.TOO_MANY_FILES: {
        toast.error(
          t('mediaUpload.errors.tooManyFiles', {
            maxFileCount: data.maxFileCount,
            forFileType: data.fileType ? ` for ${data.fileType}` : '',
          })
        );
        break;
      }
    }
  }, [uploadError]);
};
