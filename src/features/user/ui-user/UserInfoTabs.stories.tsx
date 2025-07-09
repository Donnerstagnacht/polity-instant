import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserInfoTabs } from './UserInfoTabs';

const meta: Meta = {
  component: UserInfoTabs,
};

export default meta;

type Story = StoryObj;

export const UserInfoTabsDefault: Story = {
  render: args => <UserInfoTabs about={USER.about} contact={USER.contact} {...args} />,
};
