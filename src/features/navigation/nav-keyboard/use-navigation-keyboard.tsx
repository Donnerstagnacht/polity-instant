import { useEffect } from 'react';
import { isShortcutMatch } from '@/features/navigation/nav-keyboard/keyboard-navigation.ts';
import type { NavigationItem } from '@/features/navigation/types/navigation.types.tsx';

/**
 * Hook for handling keyboard shortcuts in navigation
 */
export function useNavigationKeyboard({
  isActive,
  onNavigate,
  onThemeToggle,
  onKeyboardShortcutsOpen,
  onClose,
  items,
}: {
  isActive: boolean;
  onNavigate: (itemId: string) => void;
  onThemeToggle: () => void;
  onKeyboardShortcutsOpen: () => void;
  onClose: () => void;
  items: NavigationItem[];
}) {
  useEffect(() => {
    // Only listen for shortcuts when navigation is active
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette toggle with Ctrl+K/Cmd+K is handled separately

      // Handle navigation item shortcuts (Alt+Shift+Key)
      if (e.altKey && e.shiftKey) {
        // Check if key matches navigation items
        const matchedItem = items.find(item => isShortcutMatch(e, item.id));

        if (matchedItem) {
          e.preventDefault();
          onNavigate(matchedItem.id);
          onClose?.();
          return;
        }

        // Handle theme toggle shortcut
        if (e.key.toLowerCase() === 't' && onThemeToggle) {
          e.preventDefault();
          onThemeToggle();
          onClose?.();
          return;
        }

        // Handle keyboard shortcuts help
        if (e.key.toLowerCase() === 'k' && onKeyboardShortcutsOpen) {
          e.preventDefault();
          onKeyboardShortcutsOpen();
          onClose?.();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, items, onNavigate, onThemeToggle, onKeyboardShortcutsOpen, onClose]);
}

export function useCommandDialogShortcut(setOpen: (open: boolean) => void, isOpen: boolean) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to toggle command dialog
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen); // Toggle based on current state
        return;
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen, isOpen]);
}
