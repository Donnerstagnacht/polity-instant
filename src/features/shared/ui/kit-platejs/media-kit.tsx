import { CaptionPlugin } from '@platejs/caption/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@platejs/media/react';
import { KEYS } from 'platejs';

import { AudioElement } from '@/features/shared/ui/ui-platejs/media-audio-node.tsx';
import { MediaEmbedElement } from '@/features/shared/ui/ui-platejs/media-embed-node.tsx';
import { FileElement } from '@/features/shared/ui/ui-platejs/media-file-node.tsx';
import { ImageElement } from '@/features/shared/ui/ui-platejs/media-image-node.tsx';
import { PlaceholderElement } from '@/features/shared/ui/ui-platejs/media-placeholder-node.tsx';
import { MediaPreviewDialog } from '@/features/shared/ui/ui-platejs/media-preview-dialog.tsx';
import { MediaUploadToast } from '@/features/shared/ui/ui-platejs/media-upload-toast.tsx';
import { VideoElement } from '@/features/shared/ui/ui-platejs/media-video-node.tsx';

export const MediaKit = [
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog, node: ImageElement },
  }),
  MediaEmbedPlugin.withComponent(MediaEmbedElement),
  VideoPlugin.withComponent(VideoElement),
  AudioPlugin.withComponent(AudioElement),
  FilePlugin.withComponent(FileElement),
  PlaceholderPlugin.configure({
    options: { disableEmptyPlaceholder: true },
    render: { afterEditable: MediaUploadToast, node: PlaceholderElement },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
];
