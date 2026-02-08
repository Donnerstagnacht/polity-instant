import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
// import { AmendmentsCard } from './AmendmentsCard';
import { getStatusStyles } from '../utils/userWiki.utils';

// Component not found, story disabled
const meta: Meta = {
  // component: AmendmentsCard,
};

export default meta;

type Story = StoryObj;

/*
export const AmendmentsCardDefault: Story = {
  render: args => {
    const amendment = USER.amendments[0];
    const statusStyle = getStatusStyles(amendment.status);
    // return <AmendmentsCard amendment={amendment} statusStyle={statusStyle} {...args} />;
    return null;
  },
};

export const UnderReview: Story = {
  render: args => {
    const amendment = USER.amendments.find(a => a.status === 'Under Review') ?? USER.amendments[0];
    const statusStyle = getStatusStyles(amendment.status);
    // return <AmendmentsCard amendment={amendment} statusStyle={statusStyle} {...args} />;
    return null;
  },
};

export const Passed: Story = {
  render: args => {
    const amendment = USER.amendments.find(a => a.status === 'Passed') ?? USER.amendments[0];
    const statusStyle = getStatusStyles(amendment.status);
    // return <AmendmentsCard amendment={amendment} statusStyle={statusStyle} {...args} />;
    return null;
  },
};

export const Drafting: Story = {
  render: args => {
    const amendment = USER.amendments.find(a => a.status === 'Drafting') ?? USER.amendments[0];
    const statusStyle = getStatusStyles(amendment.status);
    // return <AmendmentsCard amendment={amendment} statusStyle={statusStyle} {...args} />;
    return null;
  },
};

export const Rejected: Story = {
  render: args => {
    const amendment = USER.amendments.find(a => a.status === 'Rejected') ?? USER.amendments[0];
    const statusStyle = getStatusStyles(amendment.status);
    // return <AmendmentsCard amendment={amendment} statusStyle={statusStyle} {...args} />;
    return null;
  },
};
*/
