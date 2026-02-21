import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserContact } from './UserContact';

const meta: Meta = {
  component: UserContact,
};

export default meta;

type Story = StoryObj;

export const UserContactDefault: Story = {
  render: args => <UserContact contact={USER.contact} {...args} />,
};
