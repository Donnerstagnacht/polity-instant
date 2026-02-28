/**
 * Keyboard Navigation Utils
 *
 * This module provides utility functions for keyboard shortcuts management
 * in the navigation system.
 */

import type { KeyboardShortcut } from '@/features/navigation/types/navigation.types.tsx';

/**
 * Maps navigation item IDs to keyboard shortcuts
 * Using Alt+Shift+letter combinations to avoid conflicts with common system shortcuts
 */
export const navigationShortcuts: Record<string, KeyboardShortcut> = {
  // Primary navigation items
  home: { display: 'Alt+Shift+H', keys: ['Alt', 'Shift', 'h'] },
  dashboard: { display: 'Alt+Shift+D', keys: ['Alt', 'Shift', 'd'] },
  messages: { display: 'Alt+Shift+M', keys: ['Alt', 'Shift', 'm'] },
  settings: { display: 'Alt+Shift+S', keys: ['Alt', 'Shift', 's'] },
  files: { display: 'Alt+Shift+F', keys: ['Alt', 'Shift', 'f'] },
  projects: { display: 'Alt+Shift+P', keys: ['Alt', 'Shift', 'p'] },
  calendar: { display: 'Alt+Shift+C', keys: ['Alt', 'Shift', 'c'] },
  notifications: { display: 'Alt+Shift+N', keys: ['Alt', 'Shift', 'n'] },
  flow: { display: 'Alt+Shift+L', keys: ['Alt', 'Shift', 'l'] },

  // Settings shortcut items
  theme: { display: 'Alt+Shift+T', keys: ['Alt', 'Shift', 't'] },
  keyboard: { display: 'Alt+Shift+K', keys: ['Alt', 'Shift', 'k'] },
};

/**
 * Get keyboard shortcut for a navigation item by ID
 */
export function getShortcutForItem(id: string): KeyboardShortcut {
  return navigationShortcuts[id] || { display: '', keys: [] };
}

/**
 * Check if a keyboard event matches a shortcut by item ID
 */
export function isShortcutMatch(event: KeyboardEvent, itemId: string): boolean {
  const shortcut = getShortcutForItem(itemId);
  return event.altKey && event.shiftKey && shortcut.keys.includes(event.key.toLowerCase());
}
