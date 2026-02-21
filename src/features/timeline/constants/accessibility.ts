/**
 * ARIA labels for timeline components
 * These provide consistent accessibility labels across the timeline
 */
export const timelineAriaLabels = {
  // Mode toggle
  modeToggle: {
    group: 'Timeline view mode',
    following: 'Show content from groups and topics you follow',
    decisions: 'View open votes and elections',
  },

  // Filter panel
  filters: {
    panel: 'Timeline filters',
    contentType: 'Filter by content type',
    dateRange: 'Filter by date range',
    topics: 'Filter by topics',
    clearAll: 'Clear all filters',
  },

  // Cards
  cards: {
    group: (name: string) => `Group: ${name}`,
    event: (name: string) => `Event: ${name}`,
    amendment: (name: string) => `Amendment: ${name}`,
    vote: (title: string) => `Vote: ${title}`,
    election: (title: string) => `Election: ${title}`,
    video: (title: string) => `Video: ${title}`,
    image: (title: string) => `Image: ${title}`,
    statement: (author: string) => `Statement by ${author}`,
    todo: (title: string) => `Task: ${title}`,
    blog: (title: string) => `Blog post: ${title}`,
  },

  // Actions
  actions: {
    follow: (name: string) => `Follow ${name}`,
    unfollow: (name: string) => `Unfollow ${name}`,
    like: 'Like this content',
    unlike: 'Remove like',
    support: 'Support this',
    oppose: 'Oppose this',
    interested: 'Mark as interested',
    share: 'Share this content',
    discuss: 'Open discussion',
    viewDetails: 'View details',
    castVote: 'Cast your vote',
    rsvp: 'RSVP for this event',
    readMore: 'Read more',
  },

  // Decision terminal
  terminal: {
    table: 'Decision tracking table',
    row: (id: string, title: string) => `Decision ${id}: ${title}`,
    status: (status: string) => `Status: ${status}`,
    timeRemaining: (time: string) => `Time remaining: ${time}`,
    support: (percentage: number) => `${percentage}% support`,
    oppose: (percentage: number) => `${percentage}% oppose`,
  },

  // Reactions
  reactions: {
    support: (count: number) => `${count} people support this`,
    oppose: (count: number) => `${count} people oppose this`,
    interested: (count: number) => `${count} people are interested`,
  },

  // Navigation
  navigation: {
    loadMore: 'Load more items',
    refresh: 'Refresh timeline',
    scrollToTop: 'Scroll to top',
  },
} as const;
