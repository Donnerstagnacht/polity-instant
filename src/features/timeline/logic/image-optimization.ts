/**
 * Image optimization utilities for timeline cards
 * Handles responsive images, thumbnails, and lazy loading
 */

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface OptimizedImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  placeholder?: string;
  dimensions?: ImageDimensions;
}

export interface ImageOptimizationOptions {
  /** Target widths for srcset generation */
  widths?: number[];
  /** Maximum width to serve */
  maxWidth?: number;
  /** Quality (1-100) */
  quality?: number;
  /** Whether to generate blur placeholder */
  withPlaceholder?: boolean;
  /** Format to convert to */
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
}

/**
 * Default image optimization options
 */
const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  widths: [320, 640, 960, 1280, 1920],
  maxWidth: 1920,
  quality: 80,
  withPlaceholder: true,
  format: 'auto',
};

/**
 * Card size presets for timeline images
 */
export const CARD_IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  full: { width: 1920, height: 1080 },
} as const;

/**
 * Generate srcset string for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[], quality = 80): string {
  // For InstantDB/external URLs, we can't generate srcset dynamically
  // This function would work with an image CDN or Next.js Image optimization

  // If using a CDN like Cloudinary or Imgix:
  // return widths.map(w => `${baseUrl}?w=${w}&q=${quality} ${w}w`).join(', ');

  // For now, return the base URL as single source
  return baseUrl;
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints?: Record<string, string>): string {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    default: '33vw',
  };

  const bp = breakpoints || defaultBreakpoints;
  const entries = Object.entries(bp);

  return entries
    .map(([query, size]) => (query === 'default' ? size : `${query} ${size}`))
    .join(', ');
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get aspect ratio CSS class
 */
export function getAspectRatioClass(ratio: number): string {
  if (ratio >= 1.7) return 'aspect-video'; // 16:9
  if (ratio >= 1.4) return 'aspect-[3/2]'; // 3:2
  if (ratio >= 1.2) return 'aspect-[4/3]'; // 4:3
  if (ratio >= 0.9) return 'aspect-square'; // 1:1
  if (ratio >= 0.7) return 'aspect-[3/4]'; // 3:4
  return 'aspect-[9/16]'; // Portrait
}

/**
 * Determine if an image should be lazy loaded
 * based on its position in the viewport
 */
export function shouldLazyLoad(index: number, visibleCount = 6): boolean {
  return index >= visibleCount;
}

/**
 * Generate a blur placeholder data URL
 * This is a tiny base64 placeholder for instant loading
 */
export function generateBlurPlaceholder(color: string = '#f3f4f6'): string {
  // Simple SVG blur placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
      <filter id="blur" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="2" edgeMode="duplicate"/>
      </filter>
      <rect fill="${color}" width="8" height="5" filter="url(#blur)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Get image dimensions from URL (requires fetch)
 */
export async function getImageDimensions(url: string): Promise<ImageDimensions | null> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Optimize an image URL for display
 */
export function optimizeImage(url: string, options: ImageOptimizationOptions = {}): OptimizedImage {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return {
    src: url,
    srcSet: generateSrcSet(url, opts.widths!, opts.quality),
    sizes: generateSizes(),
    placeholder: opts.withPlaceholder ? generateBlurPlaceholder() : undefined,
  };
}

/**
 * Get appropriate image size for card type
 */
export function getImageSizeForCard(
  cardType: 'thumbnail' | 'small' | 'medium' | 'large' | 'full'
): { width: number; height: number } {
  return CARD_IMAGE_SIZES[cardType];
}

/**
 * Check if URL is an image
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.bmp'];
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
}

/**
 * Get image format from URL
 */
export function getImageFormat(url: string): string | null {
  const match = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)/);
  return match ? match[1] : null;
}
