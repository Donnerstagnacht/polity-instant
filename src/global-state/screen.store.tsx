import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useEffect } from 'react';
import type { ScreenType } from '@/navigation/types/navigation.types';

const MOBILE_BREAKPOINT = 768;

interface ScreenState {
  screenType: ScreenType;
  isMobileScreen: boolean;
}

interface ScreenActions {
  setScreenType: (screenType: ScreenType) => void;
  setIsMobile: (isMobile: boolean) => void;
}

// Create the screen store with zustand and immer
export const useScreenStore = create<ScreenState & ScreenActions>()(
  immer(set => ({
    // Initial state
    screenType: 'automatic',
    isMobileScreen: false,

    // Actions
    setScreenType: screenType => {
      set(state => {
        state.screenType = screenType;
      });
    },

    setIsMobile: mobile => {
      set(state => {
        state.isMobileScreen = mobile;
      });
    },
  }))
);

/**
 * Hook that initializes responsive screen detection
 * This should be used in your app's root component
 */
export function useScreenResponsiveDetector(): void {
  const setIsMobile = useScreenStore(state => state.setIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
    };

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Subscribe to changes
    mql.addEventListener('change', onChange);

    // Cleanup on unmount
    return () => mql.removeEventListener('change', onChange);
  }, [setIsMobile]);
}
