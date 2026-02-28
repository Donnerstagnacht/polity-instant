import { BaseCaptionPlugin } from '@platejs/caption';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
  BaseVideoPlugin,
} from '@platejs/media';
import { KEYS } from 'platejs';

import { AudioElementStatic } from '@/features/shared/ui/ui-platejs/media-audio-node-static.tsx';
import { FileElementStatic } from '@/features/shared/ui/ui-platejs/media-file-node-static.tsx';
import { ImageElementStatic } from '@/features/shared/ui/ui-platejs/media-image-node-static.tsx';
import { VideoElementStatic } from '@/features/shared/ui/ui-platejs/media-video-node-static.tsx';

export const BaseMediaKit = [
  BaseImagePlugin.withComponent(ImageElementStatic),
  BaseVideoPlugin.withComponent(VideoElementStatic),
  BaseAudioPlugin.withComponent(AudioElementStatic),
  BaseFilePlugin.withComponent(FileElementStatic),
  BaseCaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
];
