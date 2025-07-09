import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SocialBar } from './SocialBar';

const meta: Meta = {
  component: SocialBar,
};

export default meta;

type Story = StoryObj;

export const SocialBarDefault: Story = {
  render: args => <SocialBar socialMedia={USER.socialMedia} {...args} />,
};
