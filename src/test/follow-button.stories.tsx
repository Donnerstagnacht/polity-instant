// FollowButton.stories.tsx
import { useArgs } from 'storybook/preview-api';
import { useFollowStore } from './store';
import { FollowButton } from './follow-button.tsx';
import { useEffect } from 'react';

export default {
  title: 'Test/FollowButton',
  component: FollowButton,
  argTypes: {
    isFollowing: {
      control: 'boolean',
      description: 'Whether the user is currently following',
      defaultValue: false,
    },
  },
};

export const WithZustand = {
  args: {
    isFollowing: false,
  },
  render: function Render() {
    const [{ isFollowing }, updateArgs] = useArgs();
    const state = useFollowStore(s => s.isFollowing);

    // Sync Storybook args → Zustand store (only when args change)
    useEffect(() => {
      if (state !== isFollowing) {
        useFollowStore.getState().set(isFollowing);
      }
       
    }, [isFollowing]);

    // Sync Zustand store → Storybook args (only when Zustand changes)
    useEffect(() => {
      if (state !== isFollowing) {
        updateArgs({ isFollowing: state });
      }
       
    }, [state]);

    function onClick() {
      useFollowStore.getState().toggle();
    }

    return <FollowButton isFollowing={state} onClick={onClick} />;
  },
};
