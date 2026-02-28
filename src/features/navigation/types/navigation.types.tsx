import type { IconName } from '../nav-items/icon-map.tsx';

export type ScreenType = 'mobile' | 'desktop' | 'automatic';

export type NavigationType = 'primary' | 'secondary' | 'combined';

export type NavigationView = 'asButton' | 'asButtonList' | 'asLabeledButtonList';

export type Size = 'default' | 'small';

export interface NavigationItem {
  id: string;
  icon: IconName;
  label: string;
  badge?: number;
  href?: string;
  onClick?: () => void;
}

export interface NavigationProps {
  navigationItems: NavigationItem[];
  isMobile: boolean;
  navigationView: NavigationView;
  navigationType: NavigationType;
}

/**
 * Shortcut representation with display text and keys array
 */
export interface KeyboardShortcut {
  display: string;
  keys: string[];
}
