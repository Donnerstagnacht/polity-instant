import React from 'react';
import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AmendmentListTab } from './AmendmentListTab';
import { getStatusStyles } from '../utils/userWiki.utils';

const meta: Meta = {
  component: AmendmentListTab,
};

export default meta;

type Story = StoryObj;

export const AmendmentListTabDefault: Story = {
  render: args => {
    // Example state for demonstration
    const [searchValue, setSearchValue] = React.useState('');
    return (
      <AmendmentListTab
        amendments={USER.amendments}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        getStatusStyles={getStatusStyles}
        {...args}
      />
    );
  },
};
