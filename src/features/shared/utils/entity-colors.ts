/**
 * Shared entity color definitions for use across the codebase.
 * Extracted from content-type-config.ts for reuse outside timeline code.
 */

export type EntityType = 'group' | 'event' | 'amendment' | 'blog' | 'user' | 'election' | 'position'

export interface EntityColorConfig {
  gradient: string
  gradientDark: string
  accentColor: string
  borderColor: string
  /** Left border color for notification cards */
  notificationBorderLeft: string
  /** Badge background classes (light + dark) */
  badgeBg: string
}

export const ENTITY_COLORS: Record<EntityType, EntityColorConfig> = {
  group: {
    gradient: 'from-green-100 to-blue-100',
    gradientDark: 'dark:from-green-900/40 dark:to-blue-900/50',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500',
    notificationBorderLeft: 'border-l-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  event: {
    gradient: 'from-orange-100 to-yellow-100',
    gradientDark: 'dark:from-orange-900/40 dark:to-yellow-900/50',
    accentColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500',
    notificationBorderLeft: 'border-l-amber-500',
    badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  amendment: {
    gradient: 'from-purple-100 to-blue-100',
    gradientDark: 'dark:from-purple-900/40 dark:to-blue-900/50',
    accentColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-500',
    notificationBorderLeft: 'border-l-violet-500',
    badgeBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  blog: {
    gradient: 'from-teal-100 to-green-100',
    gradientDark: 'dark:from-teal-900/40 dark:to-green-900/50',
    accentColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-500',
    notificationBorderLeft: 'border-l-teal-500',
    badgeBg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
  user: {
    gradient: 'from-blue-100 to-indigo-100',
    gradientDark: 'dark:from-blue-900/40 dark:to-indigo-900/50',
    accentColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500',
    notificationBorderLeft: 'border-l-blue-500',
    badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  election: {
    gradient: 'from-rose-100 to-pink-100',
    gradientDark: 'dark:from-rose-900/40 dark:to-pink-900/50',
    accentColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500',
    notificationBorderLeft: 'border-l-rose-500',
    badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
  position: {
    gradient: 'from-cyan-100 to-sky-100',
    gradientDark: 'dark:from-cyan-900/40 dark:to-sky-900/50',
    accentColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500',
    notificationBorderLeft: 'border-l-cyan-500',
    badgeBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  },
}
