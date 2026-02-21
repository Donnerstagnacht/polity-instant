import { MessageSquare } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SocialItem } from './SocialItem';

const meta: Meta = {
  component: SocialItem,
};

export default meta;

export const SocialItemDefault: StoryObj = {
  render: args => (
    <SocialItem href="#" label="WhatsApp" icon={<MessageSquare size={24} />} {...args} />
  ),
};
