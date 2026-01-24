import {
  Building2,
  Calendar,
  ScrollText,
  Vote,
  Award,
  Video,
  Image,
  Quote,
  CheckSquare,
  BookOpen,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Content type configuration for the Pinterest-style timeline
 * Each content type has an icon, label key, default gradient, and accent color
 */

export type ContentType =
  | 'group'
  | 'event'
  | 'amendment'
  | 'vote'
  | 'election'
  | 'video'
  | 'image'
  | 'statement'
  | 'todo'
  | 'blog'
  | 'action';

export interface ContentTypeConfig {
  icon: LucideIcon;
  labelKey: string;
  gradient: string;
  gradientDark: string;
  accentColor: string;
  borderColor: string;
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  group: {
    icon: Building2,
    labelKey: 'features.timeline.contentTypes.group',
    gradient: 'from-green-100 to-blue-100',
    gradientDark: 'dark:from-green-900/40 dark:to-blue-900/50',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500',
  },
  event: {
    icon: Calendar,
    labelKey: 'features.timeline.contentTypes.event',
    gradient: 'from-orange-100 to-yellow-100',
    gradientDark: 'dark:from-orange-900/40 dark:to-yellow-900/50',
    accentColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500',
  },
  amendment: {
    icon: ScrollText,
    labelKey: 'features.timeline.contentTypes.amendment',
    gradient: 'from-purple-100 to-blue-100',
    gradientDark: 'dark:from-purple-900/40 dark:to-blue-900/50',
    accentColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-500',
  },
  vote: {
    icon: Vote,
    labelKey: 'features.timeline.contentTypes.vote',
    gradient: 'from-red-100 to-orange-100',
    gradientDark: 'dark:from-red-900/40 dark:to-orange-900/50',
    accentColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500',
  },
  election: {
    icon: Award,
    labelKey: 'features.timeline.contentTypes.election',
    gradient: 'from-rose-100 to-pink-100',
    gradientDark: 'dark:from-rose-900/40 dark:to-pink-900/50',
    accentColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500',
  },
  video: {
    icon: Video,
    labelKey: 'features.timeline.contentTypes.video',
    gradient: 'from-pink-100 to-red-100',
    gradientDark: 'dark:from-pink-900/40 dark:to-red-900/50',
    accentColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500',
  },
  image: {
    icon: Image,
    labelKey: 'features.timeline.contentTypes.image',
    gradient: 'from-cyan-100 to-blue-100',
    gradientDark: 'dark:from-cyan-900/40 dark:to-blue-900/50',
    accentColor: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-500',
  },
  statement: {
    icon: Quote,
    labelKey: 'features.timeline.contentTypes.statement',
    gradient: 'from-indigo-100 to-purple-100',
    gradientDark: 'dark:from-indigo-900/40 dark:to-purple-900/50',
    accentColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-500',
  },
  todo: {
    icon: CheckSquare,
    labelKey: 'features.timeline.contentTypes.todo',
    gradient: 'from-yellow-100 to-orange-100',
    gradientDark: 'dark:from-yellow-900/40 dark:to-orange-900/50',
    accentColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-500',
  },
  blog: {
    icon: BookOpen,
    labelKey: 'features.timeline.contentTypes.blog',
    gradient: 'from-teal-100 to-green-100',
    gradientDark: 'dark:from-teal-900/40 dark:to-green-900/50',
    accentColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-500',
  },
  action: {
    icon: Zap,
    labelKey: 'features.timeline.contentTypes.action',
    gradient: 'from-gray-100 to-slate-100',
    gradientDark: 'dark:from-gray-900/40 dark:to-slate-900/50',
    accentColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-500',
  },
};

/**
 * Get the full gradient class for a content type
 */
export function getContentTypeGradient(type: ContentType): string {
  const config = CONTENT_TYPE_CONFIG[type];
  return `bg-gradient-to-br ${config.gradient} ${config.gradientDark}`;
}

/**
 * Content type labels for i18n
 */
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  group: 'features.timeline.contentTypes.group',
  event: 'features.timeline.contentTypes.event',
  amendment: 'features.timeline.contentTypes.amendment',
  vote: 'features.timeline.contentTypes.vote',
  election: 'features.timeline.contentTypes.election',
  video: 'features.timeline.contentTypes.video',
  image: 'features.timeline.contentTypes.image',
  statement: 'features.timeline.contentTypes.statement',
  todo: 'features.timeline.contentTypes.todo',
  blog: 'features.timeline.contentTypes.blog',
  action: 'features.timeline.contentTypes.action',
};
