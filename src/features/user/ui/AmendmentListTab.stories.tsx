import React from 'react';
import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AmendmentListTab } from './AmendmentListTab';

const meta: Meta = {
  component: AmendmentListTab,
};

export default meta;

type Story = StoryObj;

export const AmendmentListTabDefault: Story = {
  render: args => {
    // Example state for demonstration
    const [searchValue, setSearchValue] = React.useState('');
    // Note: getStatusStyles is no longer needed since AmendmentSearchCard handles it internally
    return (
      <AmendmentListTab
        amendments={USER.amendments}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        getStatusStyles={() => ({
          badge: 'outline',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
        })}
        {...args}
      />
    );
  },
};
