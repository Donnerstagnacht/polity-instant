import React from 'react';
import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WikiFollowButton } from './WikiFollowButton';

const meta: Meta = {
  component: WikiFollowButton,
};

export default meta;

type Story = StoryObj;

export const WikiFollowButtonDefault: Story = {
  render: args => {
    // Toggle state for following to allow interaction in Storybook
    const [following, setFollowing] = React.useState(USER.stats.some(s => s.label === 'Followers'));
    const handleClick = () => setFollowing(f => !f);

    return <WikiFollowButton following={following} onClick={handleClick} {...args} />;
  },
};
