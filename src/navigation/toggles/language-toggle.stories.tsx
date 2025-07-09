import type { Meta, StoryObj } from '@storybook/react-vite';
import { LanguageToggle } from './language-toggle';

const meta: Meta = {
  component: LanguageToggle,
};

export default meta;

type Story = StoryObj;

export const LanguageToggleDefault: Story = {
  render: args => <LanguageToggle {...args} />,
};
