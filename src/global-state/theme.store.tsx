import { useEffect } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Define our theme types for better type safety
export type ThemeType = 'dark' | 'light' | 'system';
export type SystemThemeType = 'dark' | 'light';

// Define the store state interface
interface ThemeState {
  theme: ThemeType;
  systemTheme: SystemThemeType;
  isMounted: boolean;
  isDark: boolean;
}

// Define the store actions interface
interface ThemeActions {
  setTheme: (theme: ThemeType) => void;
  setSystemTheme: (systemTheme: SystemThemeType) => void;
  setMounted: (mounted: boolean) => void;
  initializeTheme: (defaultTheme: ThemeType, storageKey: string) => void;
  applyTheme: (storageKey: string) => void;
}

// Default storage key
const DEFAULT_STORAGE_KEY = 'theme';

// Create the theme store with zustand and immer
export const useThemeStore = create<ThemeState & ThemeActions>()(
  immer((set, get) => ({
    // Initial state
    theme: 'system',
    systemTheme: 'light',
    isMounted: false,
    isDark: false,

    // Actions
    setTheme: newTheme => {
      set(state => {
        console.log('Setting theme:', newTheme);
        state.theme = newTheme;
        // Update isDark whenever theme changes
        state.isDark =
          newTheme === 'dark' || (newTheme === 'system' && state.systemTheme === 'dark');
        console.log('Updated isDark:', state.isDark);
      });

      // Apply the theme to the document
      get().applyTheme(DEFAULT_STORAGE_KEY);
    },

    setSystemTheme: newSystemTheme => {
      set(state => {
        state.systemTheme = newSystemTheme;
        // Update isDark when system theme changes and current theme is 'system'
        if (state.theme === 'system') {
          state.isDark = newSystemTheme === 'dark';
        }
      });

      // Apply the theme to the document if we're using system theme
      if (get().theme === 'system') {
        get().applyTheme(DEFAULT_STORAGE_KEY);
      }
    },

    setMounted: mounted => {
      set(state => {
        state.isMounted = mounted;
      });
    },

    // Initialize theme from localStorage
    initializeTheme: (defaultTheme, storageKey) => {
      // Safely retrieve theme from storage with type validation
      try {
        const storedValue = localStorage.getItem(storageKey);

        // Validate that the stored value is a valid theme
        if (storedValue === 'light' || storedValue === 'dark' || storedValue === 'system') {
          set(state => {
            state.theme = storedValue as ThemeType;
          });
        } else {
          set(state => {
            state.theme = defaultTheme;
          });
        }
      } catch (error) {
        console.error('Failed to read theme from localStorage:', error);
        set(state => {
          state.theme = defaultTheme;
        });
      }

      // Mark as mounted after initialization
      set(state => {
        state.isMounted = true;
        // Update isDark based on current theme and system theme
        state.isDark =
          state.theme === 'dark' || (state.theme === 'system' && state.systemTheme === 'dark');
      });
    },

    // Apply theme to document and update localStorage
    applyTheme: storageKey => {
      const { theme, systemTheme, isMounted } = get();

      if (!isMounted) return;

      // Update localStorage
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }

      // Apply theme class to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');

      const resolvedTheme = theme === 'system' ? systemTheme : theme;
      root.classList.add(resolvedTheme);
    },
  }))
);

/**
 * Hook that sets up system theme detection
 * This hook should be used in your app's root component
 */
export function useSystemThemeDetector(): void {
  const setSystemTheme = useThemeStore(state => state.setSystemTheme);

  useEffect(() => {
    // Query for dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial value based on system preference
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Handler for preference changes
    const handleChange = (event: MediaQueryListEvent): void => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    // Subscribe to changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup on unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setSystemTheme]);
}

/**
 * Hook to initialize theme settings
 * This should be called in a component that is rendered once at the app root
 */
export function useThemeInitializer({
  defaultTheme = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
}: {
  defaultTheme?: ThemeType;
  storageKey?: string;
} = {}): void {
  // Set up system theme detection
  useSystemThemeDetector();

  const { isMounted, initializeTheme, applyTheme } = useThemeStore();

  // Initialize theme from localStorage when component mounts
  useEffect(() => {
    initializeTheme(defaultTheme, storageKey);
  }, [defaultTheme, storageKey, initializeTheme]);

  // Apply theme when theme or system theme changes
  useEffect(() => {
    if (isMounted) {
      applyTheme(storageKey);
    }
  }, [isMounted, applyTheme, storageKey]);
}
