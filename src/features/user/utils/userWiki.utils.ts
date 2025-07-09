import type { UserAmendment } from '../types/user.types';

// Helper function to get appropriate styling based on amendment status
export function getStatusStyles(status: UserAmendment['status']) {
  switch (status) {
    case 'Passed':
      return {
        badge: 'primary',
        bgColor:
          'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/50',
        textColor: 'text-green-800 dark:text-green-300',
        badgeTextColor: 'bg-green-600 text-white hover:bg-green-700',
      };
    case 'Rejected':
      return {
        badge: 'destructive',
        bgColor:
          'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/40 dark:to-rose-900/50',
        textColor: 'text-red-800 dark:text-red-300',
        badgeTextColor: 'text-white',
      };
    case 'Under Review':
      return {
        badge: 'secondary',
        bgColor:
          'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/50',
        textColor: 'text-blue-800 dark:text-blue-300',
      };
    case 'Drafting':
    default:
      return {
        badge: 'outline',
        bgColor:
          'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/40 dark:to-slate-900/50',
        textColor: 'text-gray-800 dark:text-gray-300',
      };
  }
}

// Function to format numbers with appropriate units (k, M)
export const formatNumberWithUnit = (num: number): { value: number; unit: string } => {
  if (num >= 1000000) {
    return { value: +(num / 1000000).toFixed(1), unit: 'M' };
  } else if (num >= 1000) {
    return { value: +(num / 1000).toFixed(1), unit: 'k' };
  }
  return { value: num, unit: '' };
};

// Function to get a deterministic color based on tag text to ensure consistency
export function getTagColor(
  tag: string,
  badgeColorVariants: { bg: string; text: string }[]
): { bg: string; text: string } {
  const hashCode = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return badgeColorVariants[hashCode % badgeColorVariants.length];
}

// Helper function to get badge color based on role
export function getRoleBadgeColor(role: string) {
  switch (role.toLowerCase()) {
    case 'founder':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/40',
        text: 'text-purple-800 dark:text-purple-300',
        badge: 'purple',
      };
    case 'advisor':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/40',
        text: 'text-blue-800 dark:text-blue-300',
        badge: 'blue',
      };
    case 'member':
      return {
        bg: 'bg-green-100 dark:bg-green-900/40',
        text: 'text-green-800 dark:text-green-300',
        badge: 'green',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800/40',
        text: 'text-gray-800 dark:text-gray-300',
        badge: 'gray',
      };
  }
}

// Function to get a deterministic gradient based on blog ID
export function getBlogGradient(blogId: number, gradientVariants: string[]) {
  return gradientVariants[blogId % gradientVariants.length];
}
