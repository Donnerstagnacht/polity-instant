import React from 'react';
import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupsListTab } from './GroupListTab';
import { getRoleBadgeColor } from '../utils/userWiki.utils';

const meta: Meta = {
  component: GroupsListTab,
};

export default meta;

type Story = StoryObj;

export const GroupsListTabDefault: Story = {
  render: args => {
    const [searchValue, setSearchValue] = React.useState('');
    return (
      <GroupsListTab
        groups={USER.groups}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        getRoleBadgeColor={getRoleBadgeColor}
        {...args}
      />
    );
  },
};
