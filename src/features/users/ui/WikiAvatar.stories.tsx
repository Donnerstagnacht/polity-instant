import type { Meta, StoryObj } from '@storybook/react-vite';
import { WikiAvatar } from './WikiAvatar';

const meta: Meta = {
  component: WikiAvatar,
};

export default meta;

type Story = StoryObj;

import { USER } from '../state/user.data';

export const WikiAvatarDefault: Story = {
  render: args => <WikiAvatar name={USER.name} avatar={USER.avatar} {...args} />,
};
