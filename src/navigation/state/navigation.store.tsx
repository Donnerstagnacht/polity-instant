import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { NavigationView, NavigationType } from '@/navigation/types/navigation.types';

interface NavigationState {
  navigationType: NavigationType;
  navigationView: NavigationView;
}

interface NavigationActions {
  setNavigationType: (navigationType: NavigationType) => void;
  setNavigationView: (navigationView: NavigationView) => void;
}

// Create the navigation store with zustand and immer
export const useNavigationStore = create<NavigationState & NavigationActions>()(
  immer(set => ({
    // Initial state
    navigationType: 'combined',
    navigationView: 'asButtonList',

    // Actions
    setNavigationType: navigationType => {
      set(state => {
        state.navigationType = navigationType;
      });
    },

    setNavigationView: navigationView => {
      set(state => {
        state.navigationView = navigationView;
      });
    },
  }))
);
