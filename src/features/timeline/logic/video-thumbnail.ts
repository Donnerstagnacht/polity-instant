/**
 * Video thumbnail extraction utilities
 * Extracts thumbnails from YouTube, Vimeo, and other video URLs
 */

export interface VideoMetadata {
  thumbnailUrl: string;
  title?: string;
  duration?: number;
  provider: 'youtube' | 'vimeo' | 'dailymotion' | 'wistia' | 'direct' | 'unknown';
  videoId?: string;
}

/**
 * Regular expressions for video URL patterns
 */
const VIDEO_PATTERNS = {
  youtube: [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ],
  vimeo: [/vimeo\.com\/(?:video\/)?(\d+)/, /player\.vimeo\.com\/video\/(\d+)/],
  dailymotion: [/dailymotion\.com\/video\/([a-zA-Z0-9]+)/, /dai\.ly\/([a-zA-Z0-9]+)/],
  wistia: [
    /wistia\.com\/medias\/([a-zA-Z0-9]+)/,
    /fast\.wistia\.net\/embed\/iframe\/([a-zA-Z0-9]+)/,
  ],
};

/**
 * Extract video ID and provider from URL
 */
export function parseVideoUrl(url: string): {
  provider: VideoMetadata['provider'];
  videoId?: string;
} {
  // YouTube
  for (const pattern of VIDEO_PATTERNS.youtube) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'youtube', videoId: match[1] };
    }
  }

  // Vimeo
  for (const pattern of VIDEO_PATTERNS.vimeo) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'vimeo', videoId: match[1] };
    }
  }

  // Dailymotion
  for (const pattern of VIDEO_PATTERNS.dailymotion) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'dailymotion', videoId: match[1] };
    }
  }

  // Wistia
  for (const pattern of VIDEO_PATTERNS.wistia) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'wistia', videoId: match[1] };
    }
  }

  // Check if it's a direct video URL
  if (isDirectVideoUrl(url)) {
    return { provider: 'direct' };
  }

  return { provider: 'unknown' };
}

/**
 * Check if URL points directly to a video file
 */
export function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
  const urlLower = url.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(ext));
}

/**
 * Get thumbnail URL for a YouTube video
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get thumbnail URL for a Vimeo video
 * Note: Requires API call for actual thumbnail, returns placeholder
 */
export function getVimeoThumbnailUrl(videoId: string): string {
  // Vimeo requires an API call to get thumbnails
  // Return a placeholder URL that can be resolved via API
  return `https://vumbnail.com/${videoId}.jpg`;
}

/**
 * Get thumbnail URL for a Dailymotion video
 */
export function getDailymotionThumbnail(videoId: string): string {
  return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
}

/**
 * Get embed URL for a video
 */
export function getVideoEmbedUrl(url: string): string | null {
  const { provider, videoId } = parseVideoUrl(url);

  switch (provider) {
    case 'youtube':
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    case 'vimeo':
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    case 'dailymotion':
      return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : null;
    case 'wistia':
      return videoId ? `https://fast.wistia.net/embed/iframe/${videoId}` : null;
    case 'direct':
      return url;
    default:
      return null;
  }
}

/**
 * Get video metadata including thumbnail
 */
export function getVideoMetadata(url: string): VideoMetadata {
  const { provider, videoId } = parseVideoUrl(url);

  let thumbnailUrl = '';

  switch (provider) {
    case 'youtube':
      thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : '';
      break;
    case 'vimeo':
      thumbnailUrl = videoId ? getVimeoThumbnailUrl(videoId) : '';
      break;
    case 'dailymotion':
      thumbnailUrl = videoId ? getDailymotionThumbnail(videoId) : '';
      break;
    case 'direct':
      // Direct videos don't have thumbnails by default
      // Would need to extract a frame from the video
      thumbnailUrl = '';
      break;
    default:
      thumbnailUrl = '';
  }

  return {
    thumbnailUrl,
    provider,
    videoId,
  };
}

/**
 * Format video duration to display string
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if a URL is a video URL
 */
export function isVideoUrl(url: string): boolean {
  const { provider } = parseVideoUrl(url);
  return provider !== 'unknown';
}
