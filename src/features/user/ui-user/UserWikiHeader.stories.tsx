import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserWikiHeader } from './UserWikiHeader';

const meta: Meta = {
  component: UserWikiHeader,
};

export default meta;

type Story = StoryObj;

export const UserWikiHeaderDefault: Story = {
  render: args => {
    const handleFollowClick = () => {
      // Storybook: Hier könnte ein Action-Logger oder State-Toggle stehen
    };
    return (
      <UserWikiHeader
        name={USER.name}
        avatar={USER.avatar}
        subtitle={USER.subtitle}
        following={false}
        onFollowClick={handleFollowClick}
        {...args}
      />
    );
  },
};
