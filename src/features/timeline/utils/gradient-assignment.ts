import {
  ContentType,
  CONTENT_TYPE_CONFIG,
  getContentTypeGradient,
} from '../constants/content-type-config';

/**
 * Extended gradients array with 15 total gradients for visual variety
 * Includes warm, cool, and neutral spectrum options
 */
export const EXTENDED_GRADIENTS = [
  // Warm Spectrum
  'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50', // Soft Bloom
  'bg-gradient-to-br from-coral-100 to-peach-100 dark:from-orange-900/40 dark:to-amber-900/50', // Sunrise (using orange/amber fallback)
  'bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/40 dark:to-yellow-900/50', // Citrus
  'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/50', // Rose

  // Cool Spectrum
  'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50', // Twilight
  'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/50', // Ocean
  'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/50', // Forest
  'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/50', // Sage

  // Neutral/Earth Spectrum
  'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900/40 dark:to-slate-900/50', // Cloud
  'bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-900/40 dark:to-stone-900/50', // Sand
  'bg-gradient-to-br from-indigo-100 to-slate-100 dark:from-indigo-900/40 dark:to-slate-900/50', // Night

  // Additional variety
  'bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/50', // Lavender
  'bg-gradient-to-br from-lime-100 to-green-100 dark:from-lime-900/40 dark:to-green-900/50', // Spring
  'bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/50', // Azure
  'bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/40 dark:to-amber-900/50', // Sunset
] as const;

/**
 * Get gradient by index (deterministic but varied)
 */
export function getGradientByIndex(index: number): string {
  return EXTENDED_GRADIENTS[index % EXTENDED_GRADIENTS.length];
}

/**
 * Get gradient for a specific content type
 * Uses the content type's default gradient
 */
export function getGradientForContentType(type: ContentType): string {
  return getContentTypeGradient(type);
}

/**
 * Get gradient by entity ID (deterministic based on ID hash)
 * This ensures the same entity always gets the same gradient
 */
export function getGradientByEntityId(entityId: string): string {
  // Simple hash function to convert ID to a number
  let hash = 0;
  for (let i = 0; i < entityId.length; i++) {
    const char = entityId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % EXTENDED_GRADIENTS.length;
  return EXTENDED_GRADIENTS[index];
}

/**
 * Get gradient for timeline card based on content type and entity ID
 * Uses content type gradient as primary, falls back to entity-based for variety
 */
export function getTimelineCardGradient(
  contentType: ContentType,
  entityId?: string,
  useContentTypeDefault: boolean = true
): string {
  if (useContentTypeDefault) {
    return getGradientForContentType(contentType);
  }

  if (entityId) {
    return getGradientByEntityId(entityId);
  }

  return EXTENDED_GRADIENTS[0];
}

/**
 * Timeline card shadow classes
 */
export const CARD_SHADOWS = {
  default: 'shadow-sm',
  hover: 'hover:shadow-md',
  elevated: 'shadow-md hover:shadow-lg',
  transition: 'transition-shadow duration-300',
} as const;

/**
 * Get combined shadow classes for timeline cards
 */
export function getCardShadowClasses(elevated: boolean = false): string {
  if (elevated) {
    return `${CARD_SHADOWS.elevated} ${CARD_SHADOWS.transition}`;
  }
  return `${CARD_SHADOWS.default} ${CARD_SHADOWS.hover} ${CARD_SHADOWS.transition}`;
}

/**
 * Card rounded corner standards
 */
export const CARD_RADIUS = {
  card: 'rounded-2xl',
  inner: 'rounded-xl',
  badge: 'rounded-full',
} as const;

/**
 * Card aspect ratios for different content types
 */
export const CARD_ASPECT_RATIOS = {
  video: 'aspect-video', // 16:9
  image: 'aspect-auto', // Flexible based on image
  default: 'aspect-auto', // Flexible with minimum heights
} as const;
