// store.ts
import { create } from 'zustand';

interface FollowState {
  isFollowing: boolean;
  toggle: () => void;
  set: (value: boolean) => void;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  isFollowing: false,
  toggle: () => {
    console.log('Toggling follow state');
    set({
      isFollowing: !get().isFollowing,
    });
    console.log('New follow state:', !get().isFollowing);
  },
  set: val => set({ isFollowing: val }),
}));
