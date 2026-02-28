import type { Meta, StoryObj } from '@storybook/react-vite';
import { StateToggle } from './state-toggle.tsx';
import { useArgs } from 'storybook/preview-api';
import type { NavigationView } from '../types/navigation.types.tsx';

const meta: Meta = {
  component: StateToggle,
};

export default meta;

type Story = StoryObj;

export const StateToggleDefault: Story = {
  render: args => {
    const [{ currentState = 'asButton' }, updateArgs] = useArgs();

    function handleClick(newState: NavigationView): void {
      updateArgs({ currentState: newState });
    }

    return <StateToggle currentState={currentState} onStateChange={handleClick} {...args} />;
  },
};
