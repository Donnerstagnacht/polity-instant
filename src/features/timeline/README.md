# Timeline Feature Documentation

This document provides comprehensive documentation for the Polity Timeline system - a Pinterest/Instagram-style discovery feed with three distinct modes.

## Overview

The Timeline is the central hub for discovering and engaging with civic content. It transforms what was once a simple notification feed into a vibrant discovery experience.

### Three Modes

| Mode          | Icon | Purpose                                                             |
| ------------- | ---- | ------------------------------------------------------------------- |
| **Following** | 📌   | Content from groups, events, and topics you subscribe to            |
| **Explore**   | 🔭   | Discover new public content, trending topics, and your own activity |
| **Decisions** | 🖥️   | Bloomberg-style terminal for tracking active votes and elections    |

## Architecture

### Data Flow

```
User Authentication
       ↓
┌──────────────────┐
│  useTimelineMode │ ← Manages active mode state
└────────┬─────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
Following   Explore    ← Different data sources
    ↓         ↓
┌───┴───┐ ┌───┴───┐
│Subscribe│ │Public │
│Timeline│ │Content│
└───┬───┘ └───┬───┘
    └────┬────┘
         ↓
┌────────────────────┐
│  Content Scoring   │ ← Trending, relevance, freshness
└────────┬───────────┘
         ↓
┌────────────────────┐
│   MasonryGrid      │ ← Visual layout
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Card Components   │ ← 10+ card types
└────────────────────┘
```

### Key Hooks

#### `useTimelineMode`

Manages which mode is active and persists preference to localStorage.

```tsx
const { mode, setMode, isFollowing, isExplore, isDecisions } = useTimelineMode();
```

#### `useSubscribedTimeline`

Fetches content from entities the user follows.

```tsx
const { items, isLoading, hasMore, loadMore } = useSubscribedTimeline({
  userId: user.id,
  pageSize: 20,
  sortBy: 'recent',
});
```

#### `useExploreTimeline`

Fetches public content and user's own activity.

```tsx
const { items, isLoading, ownContent, publicContent } = useExploreTimeline({
  userId: user.id,
  excludeSubscribed: true,
});
```

#### `useDecisionTerminal`

Fetches active votes and elections for the Decision Terminal.

```tsx
const { decisions, isLoading, urgentCount, activeCount } = useDecisionTerminal({
  userId: user.id,
  includeRecentlyClosed: true,
});
```

#### `useTimelineFilters`

Manages filter state for content types, date range, topics, and engagement.

```tsx
const { filters, setContentTypes, setDateRange, setTopics, clearAll } = useTimelineFilters();
```

## Components

### Core Layout

#### `ModernTimeline`

Main entry point component that orchestrates all three modes.

```tsx
<ModernTimeline userId={user.id} defaultMode="following" />
```

#### `MasonryGrid`

Responsive CSS column-based masonry layout.

```tsx
<MasonryGrid
  items={timelineItems}
  renderItem={(item, index) => <TimelineCard item={item} />}
  keyExtractor={item => item.id}
  gap="md"
/>
```

### Card Components

Located in `src/features/timeline/ui/cards/`:

| Component               | Purpose                              |
| ----------------------- | ------------------------------------ |
| `GroupTimelineCard`     | Group information with member stats  |
| `EventTimelineCard`     | Event with date, RSVP, location      |
| `AmendmentTimelineCard` | Amendment with voting status         |
| `VoteTimelineCard`      | Active/closed vote with progress bar |
| `ElectionTimelineCard`  | Election with candidate showcase     |
| `VideoTimelineCard`     | Video thumbnail with player modal    |
| `ImageTimelineCard`     | Image with lightbox                  |
| `StatementTimelineCard` | Quote-style statement card           |
| `TodoTimelineCard`      | Task with progress and urgency       |
| `BlogTimelineCard`      | Blog post with reading time          |
| `ActionTimelineCard`    | Activity/meta events                 |

### Interaction Components

| Component         | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `ActionBar`       | Universal action bar with Follow, Discuss, React, Share |
| `FollowButton`    | Follow/Subscribe to entities                            |
| `DiscussButton`   | Open discussion/comments                                |
| `ReactionButtons` | Support/Oppose/Interested reactions                     |
| `ShareDialog`     | Share modal with multiple options                       |
| `QuickComment`    | Inline comment input                                    |

### Decision Terminal

Located in `src/features/timeline/ui/terminal/`:

| Component            | Purpose                    |
| -------------------- | -------------------------- |
| `DecisionTerminal`   | Main terminal container    |
| `DecisionTable`      | Desktop table view         |
| `MobileDecisionCard` | Mobile card view           |
| `DecisionSidePanel`  | Detail panel on row click  |
| `StatusBadge`        | OPEN/CLOSING/FINAL status  |
| `TrendIndicator`     | Vote trend arrows          |
| `CountdownTimer`     | Live countdown display     |
| `VoteProgressBar`    | Support/Oppose/Abstain bar |

## Content Scoring Algorithm

Used in Explore mode to rank public content:

```typescript
// Weight configuration
const WEIGHTS = {
  trending: 0.4, // Recent engagement velocity
  relevance: 0.3, // Topic match to user interests
  freshness: 0.2, // How recently created
  popularity: 0.1, // Total engagement
};

// Score calculation
function calculateScore(item: ContentItem): number {
  return (
    item.trendingScore * WEIGHTS.trending +
    item.relevanceScore * WEIGHTS.relevance +
    item.freshnessScore * WEIGHTS.freshness +
    item.popularityScore * WEIGHTS.popularity
  );
}
```

## "Why Am I Seeing This?" Reasons

In Explore mode, cards show explanatory tooltips:

| Reason          | Description                                     |
| --------------- | ----------------------------------------------- |
| `trending`      | "Trending now" - High recent engagement         |
| `popularTopic`  | "Popular in [topic]" - Matches user's interests |
| `similarGroups` | "Similar to groups you follow"                  |
| `yourContent`   | "Your content" - User's own activity            |

## Styling

### Gradient System

Cards use a gradient header system with 15+ gradient options:

```tsx
import { getGradientForContentType } from '@/features/timeline/utils/gradient-assignment';

const gradient = getGradientForContentType('amendment', index);
// Returns: 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/50'
```

### Mobile Responsiveness

Use responsive utilities for mobile-optimized cards:

```tsx
import { mobileCardStyles, useIsMobile } from '@/features/timeline';

const isMobile = useIsMobile();
const titleClass = mobileCardStyles.title.responsive; // 'text-base sm:text-lg font-semibold'
```

### Animations

Entry animations for cards:

```tsx
import { CardEntrance, HoverCard } from '@/features/timeline';

<CardEntrance index={index} animation="fadeInUp">
  <HoverCard lift shadow press>
    <MyCard />
  </HoverCard>
</CardEntrance>;
```

## Accessibility

### ARIA Labels

Use the `timelineAriaLabels` object for consistent labeling:

```tsx
import { timelineAriaLabels } from '@/features/timeline';

<button aria-label={timelineAriaLabels.actions.follow('Climate Action Group')}>Follow</button>;
```

### Keyboard Navigation

The `useCardListKeyboardNav` hook provides arrow key navigation:

```tsx
const { focusedIndex, handleKeyDown, setCardRef } = useCardListKeyboardNav(cards.length);

<div role="list" onKeyDown={handleKeyDown}>
  {cards.map((card, i) => (
    <div ref={setCardRef(i)} tabIndex={0} role="listitem">
      {/* card content */}
    </div>
  ))}
</div>;
```

### Screen Reader Support

Use `useScreenReaderAnnounce` for dynamic content:

```tsx
const { announce, LiveRegion } = useScreenReaderAnnounce();

// Announce when new content loads
useEffect(() => {
  if (newItemsCount > 0) {
    announce(`${newItemsCount} new items loaded`);
  }
}, [newItemsCount]);

return (
  <>
    <LiveRegion />
    {/* timeline content */}
  </>
);
```

## Internationalization

All user-facing strings use the translation system:

```tsx
import { useTranslation } from '@/hooks/use-translation';

const { t } = useTranslation();

// Mode labels
t('features.timeline.modes.following'); // "Following" / "Abonniert"
t('features.timeline.modes.explore'); // "Explore" / "Entdecken"
t('features.timeline.modes.decisions'); // "Decisions" / "Entscheidungen"

// Terminal
t('features.timeline.terminal.support'); // "Support" / "Dafür"
t('features.timeline.terminal.oppose'); // "Oppose" / "Dagegen"
```

## File Structure

```
src/features/timeline/
├── index.ts                    # Main exports
├── constants/
│   └── content-type-config.ts  # Icons, colors, labels
├── hooks/
│   ├── useSubscribedTimeline.ts
│   ├── useExploreTimeline.ts
│   ├── useTimelineMode.ts
│   ├── useTimelineFilters.ts
│   ├── useDecisionTerminal.ts
│   ├── useInfiniteTimeline.tsx
│   ├── useIsMobile.ts
│   └── ...
├── ui/
│   ├── ModernTimeline.tsx      # Main component
│   ├── MasonryGrid.tsx
│   ├── TimelineHeader.tsx
│   ├── TimelineModeToggle.tsx
│   ├── TimelineFilterPanel.tsx
│   ├── cards/                  # Card components
│   ├── terminal/               # Decision terminal
│   └── ...
└── utils/
    ├── content-scoring.ts
    ├── content-reasons.ts
    ├── gradient-assignment.ts
    ├── accessibility.tsx
    └── ...
```

## Future Enhancements

- **Algorithmic Feed:** ML-based personalization for Explore mode
- **Story Format:** Instagram-style stories for events/groups
- **Live Feed:** WebSocket-based real-time updates
- **Virtualization:** Virtual scrolling for large lists
- **Swipe Gestures:** Mobile gesture support
