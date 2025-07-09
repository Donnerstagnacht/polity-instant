import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserAbout } from './UserAbout';

const meta: Meta = {
  component: UserAbout,
};

export default meta;

type Story = StoryObj;

import { USER } from '../state/user.data';

export const UserAboutDefault: Story = {
  render: args => <UserAbout about={USER.about} {...args} />,
};
