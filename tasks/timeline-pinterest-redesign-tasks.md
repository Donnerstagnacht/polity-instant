# Timeline Pinterest/Instagram-Style Redesign Tasks

This document tracks all tasks needed to transform the timeline from a basic notification-like feed into a vibrant, Pinterest/Instagram-style discovery feed featuring groups, events, amendments, todos, blogs, statements, videos, and images.

---

## 🌟 Vision & Philosophy

### The Core Problem We're Solving

The current timeline shows **updates** about things users follow – essentially a notification log dressed up as a feed. This creates a passive experience where users feel like they're managing structures and checking off updates.

**We want to transform this into something radically different:**

> _"I'm not managing my political tasks. I'm scrolling through a living, breathing political ecosystem where I discover new ideas, see democracy happening in real-time, and feel compelled to participate."_

### Two Distinct Modes: Subscribed vs. Explore

The timeline operates in **two complementary modes**, each serving a different user need:

#### 📌 **Subscribed Mode** (Default)

- **What it shows:** Content from entities the user explicitly follows
  - Groups they're members of or subscribe to
  - Events they've RSVP'd to or follow
  - Amendments they're collaborating on or tracking
  - Users they follow
  - Blogs they've bookmarked
- **The feeling:** "My curated political world – the things I care about"
- **Use case:** Daily check-in, staying updated on commitments

#### 🔭 **Explore Mode**

- **What it shows:** A discovery feed combining:
  - **User's own content** (their posts, amendments, events they organize)
  - **Public content they DON'T subscribe to** (new groups, trending amendments, popular events)
  - **Trending topics** across the platform
  - **Suggested content** based on interests and activity patterns
- **The feeling:** "What's happening in the broader political landscape? What am I missing?"
- **Use case:** Discovery, broadening horizons, finding new causes

#### Toggle Between Modes

- Prominent toggle in timeline header: **"Following" | "Explore"**
- Remember user's last selection
- Different empty states for each mode
- Explore mode shows "Why am I seeing this?" tooltips on cards

---

## 🎨 Design System Deep Dive

### Visual Language: "Soft Civic Modernism"

We're creating a design language that feels:

- **Approachable** – Not cold government UI, but warm and inviting
- **Serious but not boring** – This is democracy, but it should be engaging
- **Modern and fresh** – Like the best consumer apps, not legacy civic tech
- **Inclusive** – Welcoming to newcomers, not just political insiders

### The Masonry Grid: Why Pinterest, Not Instagram

**Pinterest-style masonry** is chosen over Instagram's uniform grid for key reasons:

```
┌─────────┐ ┌─────────────────┐ ┌─────────┐
│ Event   │ │                 │ │Statement│
│ Card    │ │   Image Card    │ │  Card   │
│ (tall)  │ │   (wide, short) │ └─────────┘
│         │ │                 │ ┌─────────┐
│         │ └─────────────────┘ │Amendment│
└─────────┘ ┌─────────┐         │  Card   │
┌─────────┐ │ Blog    │         │ (medium)│
│ Video   │ │ Card    │         │         │
│ Thumb   │ │ (short) │         └─────────┘
│ Card    │ └─────────┘         ┌─────────┐
└─────────┘ ┌─────────┐         │ Todo    │
            │ Group   │         │  Card   │
            │ Card    │         │ (short) │
            └─────────┘         └─────────┘
```

**Benefits:**

1. **Content diversity shines** – Videos, images, text all look natural
2. **Visual rhythm** – Varied heights create engaging scroll experience
3. **Information density** – More content visible without feeling cramped
4. **Discovery encouragement** – Eye naturally wanders, finds new things
5. **Mobile-friendly** – Collapses gracefully to 2-column or 1-column

### Color & Gradient System

#### Base Gradients (15 Total)

Each card gets a gradient header/background. The gradients create visual variety while maintaining cohesion.

**Warm Spectrum:**

- 🌸 `pink-100 → blue-100` (Soft Bloom)
- 🌅 `coral-100 → peach-100` (Sunrise)
- 🍑 `orange-100 → yellow-100` (Citrus)
- 🌺 `red-100 → pink-100` (Rose)

**Cool Spectrum:**

- 💜 `blue-100 → purple-100` (Twilight)
- 🌊 `teal-100 → cyan-100` (Ocean)
- 💚 `green-100 → emerald-100` (Forest)
- 🌿 `mint-100 → teal-100` (Sage)

**Neutral Spectrum:**

- ☁️ `gray-100 → slate-100` (Cloud)
- 🏜️ `amber-100 → stone-100` (Sand)
- 🌙 `indigo-100 → slate-100` (Night)

**Content Type Default Gradients:**
| Type | Primary Gradient | Accent Color |
|------|------------------|--------------|
| Group | green → blue | Emerald |
| Event | orange → yellow | Amber |
| Amendment | purple → blue | Violet |
| Vote | red → orange | Red |
| Election | rose → pink | Rose |
| Video | pink → red | Rose |
| Image | cyan → blue | Sky |
| Statement | indigo → purple | Indigo |
| Todo | yellow → orange | Yellow |
| Blog | teal → green | Teal |
| Action | gray → slate | Slate |

### Card Anatomy & Elevation

Every card follows a consistent structure with soft, modern styling:

```
╭─────────────────────────────────╮  ← rounded-2xl (16px radius)
│ ┌─────────────────────────────┐ │
│ │     GRADIENT HEADER         │ │  ← Content type gradient
│ │  🏛 Group Name              │ │  ← Icon badge + title
│ │     or MEDIA (image/video)  │ │
│ └─────────────────────────────┘ │
│                                 │
│  Description text here that    │  ← Body text
│  can wrap to multiple lines... │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐    │  ← Topic pills
│  │Climate│ │Budget│ │Urban │    │
│  └──────┘ └──────┘ └──────┘    │
│                                 │
│  👥 142 members  📝 23 active   │  ← Stats row
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐       │  ← Action bar
│  │Follow│ │Discuss│ │React│     │
│  └─────┘ └─────┘ └─────┘       │
╰─────────────────────────────────╯

Shadow: shadow-sm → shadow-md on hover
Border: 1px border-gray-100 (subtle)
```

### Typography Scale

| Element    | Size           | Weight        | Line Height |
| ---------- | -------------- | ------------- | ----------- |
| Card Title | text-lg (18px) | font-semibold | 1.4         |
| Card Body  | text-sm (14px) | font-normal   | 1.5         |
| Stats      | text-xs (12px) | font-medium   | 1.4         |
| Pills/Tags | text-xs (12px) | font-medium   | 1.2         |
| Timestamp  | text-xs (12px) | font-normal   | 1.4         |

### Icon System

Each content type has a signature icon from Lucide:

| Type         | Icon              | Semantic Meaning             |
| ------------ | ----------------- | ---------------------------- |
| 🏛 Group     | `<Building2 />`   | Civic institution, community |
| 📅 Event     | `<Calendar />`    | Scheduled gathering          |
| 📜 Amendment | `<ScrollText />`  | Formal document, legislation |
| 🗳️ Vote      | `<Vote />`        | Active or closed vote        |
| 🏆 Election  | `<Award />`       | Leadership election          |
| 🎥 Video     | `<Video />`       | Motion content, explainer    |
| 🖼️ Image     | `<Image />`       | Visual content               |
| 📝 Statement | `<Quote />`       | Opinion, position            |
| ✅ Todo      | `<CheckSquare />` | Action item, task            |
| 📚 Blog      | `<BookOpen />`    | Long-form writing            |
| ⚡ Action    | `<Zap />`         | Meta-activity, system event  |

### Interaction States

**Default State:**

- Soft shadow (`shadow-sm`)
- Subtle border (`border border-gray-100`)
- Actions hidden or muted

**Hover State:**

- Elevated shadow (`shadow-md`)
- Card lifts slightly (`transform: translateY(-2px)`)
- Actions fade in
- Gradient border glow (subtle)

**Active/Pressed State:**

- Card presses down slightly (`transform: scale(0.98)`)
- Quick tactile feedback

**Selected/Following State:**

- Accent border color
- "Following" badge visible
- Different action button states

---

## 🎴 Card Type Visual Design

### Group Card – The Community Hub

```
╭────────────────────────────╮
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Green-blue gradient
│ ▓  🏛 Climate Action Now  ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                            │
│ Working together to push   │
│ for sustainable policies   │
│ in our city government...  │
│                            │
│ ┌────────┐ ┌────────┐      │
│ │🌍Climate│ │🏙️ Urban│      │
│ └────────┘ └────────┘      │
│                            │
│ 👥 1.2k  📜 34  💬 127      │
│ members  amendments active │
│                            │
│ [Follow] [Discuss] [Visit] │
╰────────────────────────────╯
```

### Event Card – The Gathering

```
╭────────────────────────────╮
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Orange-yellow gradient
│ ▓📅 City Council Meeting  ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│          ╭─────────╮       │
│          │ JAN 28  │       │  ← Prominent date badge
│          │  7:00PM │       │
│          ╰─────────╯       │
│                            │
│ Join us for the monthly    │
│ city council meeting...    │
│                            │
│ 📍 City Hall, Room 302     │
│ 👥 47 attending            │
│                            │
│ [RSVP] [Share] [Details]   │
╰────────────────────────────╯
```

### Amendment Card – The Proposal

```
╭────────────────────────────╮
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Purple-blue gradient
│ ▓📜 Bike Lane Expansion   ▓ │
│ ▓    ┌────────────┐       ▓ │
│ ▓    │🗳️ VOTING   │       ▓ │  ← Status badge
│ ▓    └────────────┘       ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                            │
│ Proposal to add protected  │
│ bike lanes on Main Street  │
│ between 1st and 5th Ave... │
│                            │
│ ████████░░░░░ 67% support  │  ← Vote progress bar
│                            │
│ 👍 156  👎 78  💬 34        │
│                            │
│ [Support] [View] [Discuss] │
╰────────────────────────────╯
```

### Video Card – The Visual Story

```
╭────────────────────────────╮
│ ╔══════════════════════╗   │
│ ║                      ║   │
│ ║   🎬 VIDEO THUMB     ║   │  ← Large thumbnail
│ ║                      ║   │
│ ║   ▶️                 ║   │  ← Play button overlay
│ ║            ┌──────┐  ║   │
│ ╚════════════│ 4:23 │══╝   │  ← Duration badge
│              └──────┘      │
│                            │
│ Why We Need This Amendment │  ← Title
│                            │
│ 👤 Sarah Chen · Climate    │  ← Author + source
│    Action Now              │
│                            │
│ 👁️ 2.3k  ❤️ 145            │
│                            │
│ [▶️ Play] [❤️] [↗️ Share]   │
╰────────────────────────────╯
```

### Image Card – The Snapshot

```
╭────────────────────────────╮
│ ╔══════════════════════╗   │
│ ║                      ║   │
│ ║   📸 FULL IMAGE      ║   │  ← Image fills card
│ ║                      ║   │
│ ║                      ║   │
│ ║                      ║   │
│ ╠══════════════════════╣   │
│ ║ 🖼️ Community Cleanup ║   │  ← Gradient overlay
│ ║ 📍 River Park        ║   │     with caption
│ ╚══════════════════════╝   │
│                            │
│ 👤 Posted by Green Group   │
│                            │
│ [❤️ 89] [💬 12] [↗️ Share]  │
╰────────────────────────────╯
```

### Statement Card – The Voice

```
╭────────────────────────────╮
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Indigo gradient
│ ▓                         ▓ │
│ ▓   ❝                     ▓ │  ← Large quote marks
│ ▓   We cannot wait for    ▓ │
│ ▓   change. We must be    ▓ │
│ ▓   the change we seek.   ▓ │
│ ▓                     ❞   ▓ │
│ ▓                         ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                            │
│ 👤 Maria González          │  ← Author with avatar
│    Council Member          │
│                            │
│ [👍 234] [👎 12] [🤔 56]   │  ← Reactions
╰────────────────────────────╯
```

### Todo Card – The Action Item

```
╭────────────────────────────╮
│ ☐ Collect Petition Signs   │  ← Checkbox visual
│                            │
│ We need 500 more signatures│
│ before the deadline...     │
│                            │
│ ╭────────────────────╮     │
│ │ 🔴 Due: Jan 30     │     │  ← Urgency badge (red)
│ ╰────────────────────╯     │
│                            │
│ ████████████░░░ 78%        │  ← Progress bar
│ 389 / 500 collected        │
│                            │
│ 👥 12 people assigned      │
│                            │
│ [View] [Volunteer] [Share] │
╰────────────────────────────╯
```

### Blog Card – The Long Read

```
╭────────────────────────────╮
│ ╔══════════════════════╗   │
│ ║  📷 Cover Image      ║   │  ← Featured image
│ ╚══════════════════════╝   │
│                            │
│ The Future of Urban        │  ← Title (large)
│ Transportation             │
│                            │
│ An in-depth look at how    │  ← Excerpt
│ cities are reimagining...  │
│                            │
│ 👤 By: Transit Advocates   │
│ 📖 8 min read              │
│                            │
│ [Read More] [🔖] [↗️]      │
╰────────────────────────────╯
```

---

## 🎯 Interaction Philosophy: Every Card is Actionable

### The Three Questions

Every card must answer three questions at a glance:

1. **What is this?** → Icon + type badge + title
2. **Why should I care?** → Description + stats + tags
3. **What can I do?** → Action buttons

### Universal Action Bar

Every card has an action bar with context-appropriate buttons:

| Content Type | Primary Action    | Secondary Action | Tertiary Action |
| ------------ | ----------------- | ---------------- | --------------- |
| Group        | Follow/Unfollow   | Discuss          | Visit           |
| Event        | RSVP/Going        | Share            | Details         |
| Amendment    | Support/Oppose    | Comment          | View Document   |
| Video        | Play              | Like             | Share           |
| Image        | Like              | Comment          | Share           |
| Statement    | React (3 options) | Comment          | Share           |
| Todo         | Volunteer         | View             | Share           |
| Blog         | Read More         | Bookmark         | Share           |
| Action       | View Details      | –                | –               |

### Reaction System (Civic-Focused)

Instead of simple likes, we use **three civic reactions**:

- 👍 **Support** – "I agree with this / I want this"
- 👎 **Oppose** – "I disagree with this / I don't want this"
- 🤔 **Interested** – "I want to learn more / I'm watching this"

This is more expressive than binary likes and encourages thoughtful engagement.

---

## 🧭 Navigation: Subscribed vs. Explore

### Header Design

```
╭──────────────────────────────────────────────────╮
│  🏛️ Your Political Ecosystem                     │
│                                                  │
│  ┌────────────────────────────────┐              │
│  │ [📌 Following] │ [🔭 Explore]  │   🔍  ⚙️     │
│  └────────────────────────────────┘   Filter Sort│
╰──────────────────────────────────────────────────╯
```

### Following Tab

- Shows subscribed content only
- Sorted by recency (newest first)
- Shows "Catch up" prompt if user has been away
- Groups similar content (e.g., "3 new amendments from Climate Action")

### Explore Tab

- **Section 1: Your Content**
  - "Your recent activity" – user's own posts, amendments, events
  - Helps user see their impact and contributions
- **Section 2: Discover**

  - Popular public groups user doesn't follow
  - Trending amendments getting lots of engagement
  - Upcoming public events nearby or relevant
  - New users/voices in topics user cares about

- **Section 3: Trending Topics**
  - Hot topics across the platform
  - "What's being discussed right now"

### "Why am I seeing this?" Tooltip

In Explore mode, cards have a small info icon that explains:

- "Popular in Climate topics you follow"
- "Trending in your city"
- "From a group similar to ones you're in"
- "Your connection [Name] reacted to this"

---

## 🔥 The UX Win: What Users Will Feel

### Before (Current Timeline)

> "I'm checking my updates. Did anything happen in my groups? Any votes I need to cast? Okay, done, I can close this."

### After (New Timeline)

> "Whoa, look at this – a new group is forming around transit! And there's a video explaining that amendment I was curious about. Oh, and the council meeting is tomorrow, I should RSVP. Wait, what's this statement about? Let me react... Okay, one more scroll..."

**The transformation:**

- From **task management** → **discovery and engagement**
- From **passive checking** → **active participation**
- From **isolated updates** → **connected ecosystem**
- From **boring civic duty** → **engaging social experience**

---

## 📊 Progress Overview

- Total Tasks: 116
- Completed: 0
- Remaining: 116

---

## 1. 🎨 Design System & Visual Identity

### 1.1 Create Content Type Icon System

- [ ] Design emoji/icon badge system for each content type

  - 🏛 Groups (civic building icon)
  - 📅 Events (calendar icon)
  - 📜 Amendments (scroll/document icon)
  - 🗳️ Votes (ballot box icon)
  - 🏆 Elections (award/trophy icon)
  - 🎥 Videos (video camera icon)
  - 🖼️ Images (picture frame icon)
  - 📝 Statements (notepad icon)
  - ⚡ Actions (lightning bolt icon)
  - ✅ Todos (checkmark icon)
  - 📚 Blogs (book icon)

- [ ] Create `src/features/timeline/constants/content-type-config.ts`

  - Export `CONTENT_TYPE_ICONS` map with Lucide icons
  - Export `CONTENT_TYPE_COLORS` for gradient theming
  - Export `CONTENT_TYPE_LABELS` for i18n keys

- [ ] Create tag pill system for topics (Transport, Budget, Education)
  - Component: `src/features/timeline/ui/cards/TopicPill.tsx`
  - Support for multiple tags per item
  - Use soft colors matching the gradient system

### 1.2 Enhance Gradient System

- [ ] Extend `GRADIENTS` array in `src/features/user/state/gradientColors.ts`

  - Add 8 more gradient combinations (total: 15)
  - Include warm gradients (coral, peach, sunset)
  - Include cool gradients (mint, ocean, lavender)
  - Include earth tones (sage, terracotta, sand)

- [ ] Create gradient assignment logic by content type
  - File: `src/features/timeline/utils/gradient-assignment.ts`
  - Function: `getGradientForContentType(type, index)`
  - Deterministic but visually varied

### 1.3 Design Card Visual System

- [ ] Define card elevation system (soft shadows)
  - Create `timeline-card-shadows` CSS classes
  - Base: `shadow-sm hover:shadow-md transition-shadow duration-300`
  - Elevated: `shadow-md hover:shadow-lg transition-shadow duration-300`
- [ ] Define rounded corner standards

  - Cards: `rounded-2xl` (extra large rounded corners)
  - Media within cards: `rounded-xl`
  - Pills/badges: `rounded-full`

- [ ] Create card aspect ratio system
  - Video cards: 16:9 aspect ratio preserved
  - Image cards: Natural aspect ratio with max-height
  - Text-only cards: Dynamic height based on content
  - Mixed content: Flexible with minimum heights

---

## 2. 🧱 Masonry Grid Layout System

### 2.1 Research & Select Masonry Library

- [ ] Evaluate masonry libraries:

  - Option 1: `react-masonry-css` (lightweight, pure CSS)
  - Option 2: `react-responsive-masonry` (good mobile support)
  - Option 3: Custom CSS Grid masonry with `grid-template-rows: masonry`
  - Document choice in this task file with rationale

- [ ] Install chosen masonry library
  - Run: `npm install [chosen-library]`
  - Update `package.json`

### 2.2 Create Responsive Masonry Container

- [ ] Create `src/features/timeline/ui/MasonryGrid.tsx`

  - Props: `items`, `breakpointCols`, `className`
  - Default breakpoints:
    - Desktop (1200px+): 4 columns
    - Laptop (992px+): 3 columns
    - Tablet (768px+): 2 columns
    - Mobile (640px+): 2 columns (small cards)
    - Mobile Small (<640px): 1 column
  - Gap: `gap-4` (16px) between items

- [ ] Add loading skeleton for masonry grid

  - Component: `src/features/timeline/ui/MasonryGridSkeleton.tsx`
  - Show varied height placeholders (mimic masonry)
  - Animate with pulse effect

- [ ] Add empty state for masonry grid
  - Component: `src/features/timeline/ui/MasonryGridEmpty.tsx`
  - Show centered icon with call-to-action
  - Link to search/explore page

### 2.3 Performance Optimization

- [ ] Implement virtualization for large lists
  - Use `react-window` or `react-virtuoso` with masonry
  - Load items in chunks (20-30 per batch)
- [ ] Add infinite scroll

  - Hook: `src/features/timeline/hooks/useInfiniteTimeline.ts`
  - Load more items when user scrolls to bottom
  - Show loading indicator at bottom

- [ ] Implement image lazy loading
  - Use native `loading="lazy"` for images
  - Add blur placeholder while loading
  - Show skeleton for video thumbnails

---

## 3. 🎴 Content Card Components (9 Card Types)

### 3.1 Group Card

- [ ] Create `src/features/timeline/ui/cards/GroupTimelineCard.tsx`

  - **Header:** Gradient header with group icon + name
  - **Body:** Group description (truncated, 3 lines max)
  - **Stats:** Member count, amendment count, active discussions
  - **Media:** Group avatar/image (if available)
  - **Tags:** Topic pills (e.g., "Climate", "Budget")
  - **Actions:** Follow button, Discuss button, Visit button

- [ ] Add hover effects
  - Lift card slightly on hover (`transform: translateY(-4px)`)
  - Show action buttons with fade-in animation
  - Highlight border with gradient glow

### 3.2 Event Card

- [ ] Create `src/features/timeline/ui/cards/EventTimelineCard.tsx`

  - **Header:** Gradient header with event icon + title
  - **Date Badge:** Prominent date/time badge (top-right corner)
  - **Body:** Event description (truncated, 3 lines max)
  - **Stats:** Participant count, agenda items count
  - **Media:** Event image/poster (if available)
  - **Tags:** Topic pills + location pill
  - **Actions:** RSVP button, Share button, Visit button

- [ ] Add "Happening Now" indicator
  - Pulsing dot for live events
  - Different styling for past vs. upcoming events

### 3.3 Amendment Card

- [ ] Create `src/features/timeline/ui/cards/AmendmentTimelineCard.tsx`

  - **Header:** Gradient header with amendment icon + title
  - **Status Badge:** Workflow status (voting, passed, rejected, etc.)
  - **Body:** Amendment description (truncated, 4 lines max)
  - **Stats:** Vote count, comment count, supporter count
  - **Media:** Amendment video/image (if available)
  - **Tags:** Topic pills + target group/event
  - **Actions:** Support button, Comment button, View Document button
  - **Visual:** Progress bar for voting status

- [ ] Add special styling for passed/rejected amendments
  - Green accent for passed
  - Red accent for rejected
  - Neutral for in-progress

### 3.4 Video Card (Amendment/User/Group Videos)

- [ ] Create `src/features/timeline/ui/cards/VideoTimelineCard.tsx`

  - **Large Thumbnail:** Video thumbnail with play overlay
  - **Duration Badge:** Video length (bottom-right of thumbnail)
  - **Title:** Video title below thumbnail
  - **Author:** User/group name with avatar
  - **Stats:** View count, like count (if tracked)
  - **Actions:** Play button (opens modal/player), Like button, Share button
  - **Entity Link:** Link to source entity (amendment/user/group)

- [ ] Implement video player modal

  - Component: `src/features/timeline/ui/VideoPlayerModal.tsx`
  - Support for YouTube embeds and direct video URLs
  - Show related content in sidebar

- [ ] Add video upload source indicator
  - Badge: "Amendment Explainer", "User Statement", "Event Recording"

### 3.5 Image Card (User/Group/Event Images)

- [ ] Create `src/features/timeline/ui/cards/ImageTimelineCard.tsx`

  - **Full Image:** Image takes full card space (maintain aspect ratio)
  - **Overlay:** Gradient overlay on bottom with title
  - **Author:** User/group name with small avatar (overlay)
  - **Actions:** Like button (heart), Comment button, Share button
  - **Lightbox:** Click to open full-size image
  - **Entity Link:** Link to source entity

- [ ] Implement image lightbox

  - Component: `src/features/timeline/ui/ImageLightbox.tsx`
  - Swipe through multiple images if carousel
  - Show caption and metadata

- [ ] Add image upload context
  - Badge: "Group Event", "User Profile", "Event Photo"

### 3.6 Statement Card

- [ ] Create `src/features/timeline/ui/cards/StatementTimelineCard.tsx`

  - **Quote Style:** Large quote marks, centered text
  - **User Info:** User name, avatar, subtitle (overlay or below)
  - **Body:** Statement text (max 200 chars, expand to read more)
  - **Background:** Soft gradient background (not image-based)
  - **Tags:** Topic pills (what the statement is about)
  - **Actions:** React buttons (Support/Oppose/Interested), Comment, Share

- [ ] Add reaction system
  - Three reactions: 👍 Support, 👎 Oppose, 🤔 Interested
  - Show reaction counts
  - User can toggle their reaction

### 3.7 Todo Card (Shared/Community Todos)

- [ ] Create `src/features/timeline/ui/cards/TodoTimelineCard.tsx`

  - **Header:** Todo title with checkbox visual (not interactive)
  - **Body:** Todo description (truncated)
  - **Due Date:** Prominent due date badge (color-coded by urgency)
  - **Stats:** Assignee count, subtask progress bar
  - **Tags:** Topic pills + urgency pill (Urgent, Soon, Later)
  - **Actions:** View Details button, Assign to Me button

- [ ] Add urgency color coding
  - Red: Overdue or due today
  - Orange: Due within 3 days
  - Yellow: Due within week
  - Green: Due later

### 3.8 Blog Card

- [ ] Create `src/features/timeline/ui/cards/BlogTimelineCard.tsx`

  - **Header:** Blog title (large, bold)
  - **Featured Image:** Blog cover image (if available)
  - **Excerpt:** First 150 chars of blog content
  - **Author:** Blogger name(s) with avatars
  - **Stats:** Read time estimate, like count, comment count
  - **Tags:** Topic pills
  - **Actions:** Read More button, Like button, Bookmark button

- [ ] Add reading progress indicator
  - If user has started reading, show progress bar

### 3.9 Vote Card (Amendment Votes)

- [ ] Create `src/features/timeline/ui/cards/VoteTimelineCard.tsx`

  - **Header:** Red-orange gradient with ballot icon + vote title
  - **Status Badge:** Prominent status indicator
    - 🟢 **OPEN** (green, pulsing) – "Ends in 2 days"
    - 🔴 **CLOSED** (red) – "Ended 3 hours ago"
    - ✅ **PASSED** (green checkmark)
    - ❌ **REJECTED** (red X)
  - **Context:** "Vote on: [Amendment Title]" with link
  - **Vote Subject:** Brief description of what's being voted on
  - **Results Bar:** Visual progress bar showing current vote distribution
    - For open votes: Live updating bar (Accept | Reject | Abstain)
    - For closed votes: Final results with percentages
  - **Stats:** Total votes cast, quorum status, time remaining/ended
  - **Participation:** "X of Y members voted" with avatars
  - **Actions:**
    - Open votes: "Cast Your Vote" button (navigates to vote page, NOT inline voting)
    - Closed votes: "View Results" button
    - React button (express interest without voting)

- [ ] Design vote result visualization

  - Horizontal stacked bar: Green (Accept) | Red (Reject) | Gray (Abstain)
  - Show percentages on hover
  - Animate bar on card load

- [ ] Add urgency indicators for open votes
  - Pulsing border for votes ending within 24 hours
  - "Last chance!" badge for votes ending within 2 hours
  - Countdown timer for critical votes

**Vote Card Visual:**

```
╭────────────────────────────────╮
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Red-orange gradient
│ ▓ 🗳️ Amendment Vote           ▓ │
│ ▓    ┌──────────────┐         ▓ │
│ ▓    │ 🟢 OPEN      │         ▓ │  ← Status badge
│ ▓    │ Ends in 2d   │         ▓ │
│ ▓    └──────────────┘         ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                │
│ Vote on: Bike Lane Expansion   │  ← Amendment link
│                                │
│ Should the city add protected  │
│ bike lanes on Main Street?     │
│                                │
│ ███████████░░░░░░░░░░ 67%      │  ← Live results bar
│ Accept: 67%  Reject: 28%       │
│                                │
│ 👥 45 of 67 voted  ⏱️ 2d left  │
│                                │
│ [Cast Your Vote] [👀] [↗️]     │  ← Navigate to vote
╰────────────────────────────────╯
```

### 3.10 Election Card (Leadership Elections)

- [ ] Create `src/features/timeline/ui/cards/ElectionTimelineCard.tsx`

  - **Header:** Rose-pink gradient with award icon + election title
  - **Status Badge:** Election status
    - 🟢 **NOMINATIONS OPEN** – "Submit by [date]"
    - 🔵 **VOTING OPEN** – "Ends in X days"
    - 🔴 **CLOSED** – "Ended [date]"
    - 🏆 **WINNER** – "[Name] elected!"
  - **Position:** "Election for: [Position Name]" (e.g., "Group President")
  - **Context:** Which group/entity the election is for
  - **Candidates:**
    - Candidate avatars in a row (up to 5, then "+X more")
    - Candidate names on hover
    - For closed elections: Winner highlighted with crown/star
  - **Stats:** Number of candidates, voters, turnout percentage
  - **Timeline:** Key dates (nominations close, voting starts, voting ends)
  - **Actions:**
    - Nominations open: "View Candidates" / "Nominate" button
    - Voting open: "Cast Your Vote" button (navigates to election page)
    - Closed: "View Results" button
    - React button (show interest)

- [ ] Design candidate showcase

  - Circular avatars in a row
  - Winner gets gold ring/crown overlay
  - "Running for [Position]" subtitle

- [ ] Add election phase indicators
  - Timeline dots: Nomination → Voting → Results
  - Highlight current phase

**Election Card Visual:**

```
╭────────────────────────────────╮
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Rose-pink gradient
│ ▓ 🏆 Leadership Election       ▓ │
│ ▓    ┌──────────────┐         ▓ │
│ ▓    │ 🔵 VOTING    │         ▓ │  ← Status badge
│ ▓    │ Ends Jan 30  │         ▓ │
│ ▓    └──────────────┘         ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                │
│ Election for: Group President  │  ← Position
│ Climate Action Now             │  ← Group name
│                                │
│     👤  👤  👤  👤  +2          │  ← Candidate avatars
│  Anna  Bob  Chen  Dana         │
│                                │
│ ○───●───○  Voting Phase        │  ← Timeline indicator
│                                │
│ 🗳️ 89 voted · 6 candidates     │
│                                │
│ [Cast Your Vote] [👀] [↗️]     │
╰────────────────────────────────╯
```

**Closed Election with Winner:**

```
╭────────────────────────────────╮
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓ 🏆 Leadership Election       ▓ │
│ ▓    ┌──────────────┐         ▓ │
│ ▓    │ 🏆 ELECTED   │         ▓ │  ← Winner status
│ ▓    └──────────────┘         ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                │
│ 🎉 Anna Chen elected as        │
│    Group President!            │
│                                │
│        ╭─────╮                 │
│        │ 👤  │  ← Winner       │
│        │ 👑  │     avatar      │
│        ╰─────╯                 │
│      Anna Chen                 │
│      67% of votes              │
│                                │
│ 🗳️ 134 voted · 78% turnout     │
│                                │
│ [View Results] [🎉] [↗️]       │
╰────────────────────────────────╯
```

### 3.11 Action/Activity Card (Meta Events)

- [ ] Create `src/features/timeline/ui/cards/ActionTimelineCard.tsx`

  - **Icon:** Large action icon (e.g., user joined group, vote started)
  - **Message:** Human-readable action description
  - **Actors:** User avatars involved in action
  - **Timestamp:** Relative time (e.g., "2 hours ago")
  - **Entity:** Link to related entity (group, amendment, event)
  - **Actions:** View Details button

- [ ] Support action types:
  - User joined group
  - Vote started on amendment
  - Event going live
  - New collaborator added
  - Amendment forwarded
  - Group created

---

## 4. 🔄 Timeline Data & Query Layer

### 4.1 Extend Timeline Event Schema

- [ ] Update `db/schema/common.ts` - `timelineEvents` entity

  - Add fields:
    - `imageURL: i.string().optional()` - For image posts
    - `videoURL: i.string().optional()` - For video posts
    - `videoThumbnailURL: i.string().optional()` - Video thumbnail
    - `contentType: i.string().indexed()` - 'group', 'event', 'amendment', 'vote', 'election', 'video', 'image', 'statement', 'todo', 'blog', 'action'
    - `tags: i.json().optional()` - Array of topic tags
    - `stats: i.json().optional()` - Dynamic stats object (likes, views, etc.)
    - `voteStatus: i.string().optional()` - 'open', 'closed', 'passed', 'rejected' (for votes)
    - `electionStatus: i.string().optional()` - 'nominations', 'voting', 'closed', 'winner' (for elections)
    - `endsAt: i.date().optional()` - When vote/election ends (for countdown)

- [ ] Add new timeline event types to `eventType` field
  - 'vote_opened'
  - 'vote_closed'
  - 'vote_passed'
  - 'vote_rejected'
  - 'election_nominations_open'
  - 'election_voting_open'
  - 'election_closed'
  - 'election_winner_announced'
  - 'video_uploaded'
  - 'image_uploaded'
  - 'statement_posted'
  - 'todo_created'
  - 'blog_published'

### 4.2 Create Timeline Query Hooks

- [ ] Create `src/features/timeline/hooks/useSubscribedTimeline.ts`

  - Query content ONLY from entities user subscribes to
  - Include all content types (groups, events, amendments, videos, images, etc.)
  - Sort by recency (default) or engagement
  - Support pagination/infinite scroll

- [ ] Create `src/features/timeline/hooks/useExploreTimeline.ts`

  - Query TWO content streams:
    1. **User's own content:** Amendments they authored, events they organize, posts they made
    2. **Public content NOT subscribed to:** Popular groups, trending amendments, upcoming events
  - Exclude content user already subscribes to (avoid duplicates)
  - Include "reason" field for "Why am I seeing this?"
  - Sort by: trending score, recency, relevance

- [ ] Create `src/features/timeline/hooks/useTimelineMode.ts`

  - Manage active mode state: 'subscribed' | 'explore'
  - Persist user's preference to localStorage
  - Provide `setMode`, `toggleMode` functions

- [ ] Refactor `src/features/timeline/hooks/useSubscriptionTimeline.ts`

  - Keep as legacy/compatibility hook
  - Internally use `useSubscribedTimeline`

- [ ] Create filter system

  - Hook: `src/features/timeline/hooks/useTimelineFilters.ts`
  - Filters: Content type, date range, topics, engagement level
  - Apply filters to both Subscribed and Explore modes

- [ ] Add sort options
  - Recent (default for Subscribed)
  - Trending (default for Explore)
  - Most Engaged (comments + reactions)

### 4.3 Content Discovery & Scoring Logic

- [ ] Create "Why am I seeing this?" logic

  - File: `src/features/timeline/utils/content-reasons.ts`
  - Generate human-readable reasons for Explore mode
  - Categories: Trending, Popular in Topic, Similar to Subscriptions, Your Content

- [ ] Create content scoring algorithm for Explore mode

  - File: `src/features/timeline/utils/content-scoring.ts`
  - Score based on:
    - **Trending factor:** Recent engagement velocity (high weight)
    - **Topic relevance:** Matches user's subscribed topics (medium weight)
    - **Freshness:** How recently created (medium weight)
    - **Quality signals:** Comments, reactions, completion rate (low weight)
  - Return scored and sorted items

- [ ] Implement public content query

  - File: `src/features/timeline/utils/public-content-query.ts`
  - Query public groups, events, amendments
  - Exclude private/members-only content
  - Exclude user's subscriptions (prevent duplicates)

- [ ] Implement user's own content query
  - File: `src/features/timeline/utils/own-content-query.ts`
  - Query amendments user authored
  - Query events user organizes
  - Query groups user admins
  - Query videos/images user uploaded

---

## 5. 🎬 Media Handling & Display

### 5.1 Video Integration

- [ ] Create video thumbnail generator

  - Util: `src/features/timeline/utils/video-thumbnail.ts`
  - Extract thumbnail from video URL (YouTube, Vimeo)
  - For uploaded videos, use `videoThumbnailURL` from schema

- [ ] Implement video player component

  - Component: `src/features/timeline/ui/VideoPlayer.tsx`
  - Support YouTube embeds (use existing Plate.js video component)
  - Support direct video playback (HTML5 video)
  - Autoplay when in viewport (optional setting)

- [ ] Add video metadata extraction
  - Duration, resolution, upload date
  - Store in `metadata` JSON field

### 5.2 Image Handling

- [ ] Create image optimization util

  - Util: `src/features/timeline/utils/image-optimization.ts`
  - Generate thumbnails for timeline cards
  - Use InstantDB's signed URLs

- [ ] Implement responsive images

  - Use `srcset` and `sizes` attributes
  - Serve appropriate image size based on card width

- [ ] Add image caption/title support
  - Overlay on bottom of image cards
  - Fade in on hover

### 5.3 Media Upload to Timeline

- [ ] Create "Post Video" feature

  - Component: `src/features/timeline/ui/PostVideoDialog.tsx`
  - Upload video, add title, description, tags
  - Link to entity (amendment, user, group)
  - Create timeline event on upload

- [ ] Create "Post Image" feature

  - Component: `src/features/timeline/ui/PostImageDialog.tsx`
  - Upload image, add caption, tags
  - Link to entity
  - Create timeline event on upload

- [ ] Add media to timeline event creation flow
  - Update `src/features/timeline/utils/createTimelineEvent.ts`
  - Accept `imageURL`, `videoURL`, `videoThumbnailURL` params
  - Store in timelineEvents entity

---

## 6. 🎯 Interaction & Engagement System

### 6.1 Create Universal Action Bar Component

- [ ] Create `src/features/timeline/ui/cards/ActionBar.tsx`

  - **Buttons:** Follow/Subscribe, Discuss, React, Share, More
  - **Styling:** Pill-shaped buttons, soft colors
  - **Icons:** Lucide icons with text labels
  - **State:** Show active state (e.g., "Following")

- [ ] Implement Follow/Subscribe action

  - Reuse existing subscription system
  - Update subscriber count in real-time
  - Show success toast

- [ ] Implement Discuss action

  - Opens comment/discussion panel
  - For amendments: Open discussion tab
  - For events/groups: Navigate to discussion section

- [ ] Implement React action

  - Quick reactions: Support (👍), Oppose (👎), Interested (🤔)
  - Show reaction counts
  - Toggle user's reaction

- [ ] Implement Share action
  - Open share modal with options:
    - Copy link
    - Share to social media (Twitter, Facebook)
    - Share within Polity (direct message, group)

### 6.2 Create Reaction System

- [ ] Create reaction database schema

  - New entity: `reactions` in `db/schema/common.ts`
  - Fields: `userId`, `entityId`, `entityType`, `reactionType`, `createdAt`
  - Link to users, timelineEvents

- [ ] Create reaction UI component

  - Component: `src/features/timeline/ui/ReactionButtons.tsx`
  - Three buttons: Support, Oppose, Interested
  - Show counts next to each
  - Highlight user's reaction

- [ ] Create reaction mutations
  - Hook: `src/features/timeline/hooks/useReactions.ts`
  - `addReaction`, `removeReaction`, `toggleReaction`
  - Real-time updates

### 6.3 Comment Integration

- [ ] Add quick comment feature

  - Component: `src/features/timeline/ui/cards/QuickComment.tsx`
  - Inline comment input below card
  - Expand on focus, collapse when empty
  - Submit comment to entity's discussion/comments

- [ ] Show latest comments preview
  - Display 1-2 most recent comments below card
  - "View all X comments" link
  - Real-time updates

---

## 7. 🏷️ Topic & Tag System

### 7.1 Create Topic/Tag Schema

- [ ] Extend hashtags schema in `db/schema/common.ts`

  - Add `category` field (Transport, Budget, Education, etc.)
  - Add `color` field for visual coding
  - Add `icon` field (emoji or icon name)

- [ ] Seed common topics
  - Create seed data: `scripts/seeders/seed-topics.ts`
  - Topics: Transport, Budget, Climate, Healthcare, Education, Housing, etc.
  - Assign colors and icons

### 7.2 Create Tag UI Components

- [ ] Create `src/features/timeline/ui/TopicPill.tsx`

  - Pill-shaped tag with icon and label
  - Color-coded by category
  - Clickable to filter timeline by tag

- [ ] Create `src/features/timeline/ui/TopicSelector.tsx`
  - Multi-select dropdown for choosing tags
  - Used in post/upload dialogs
  - Type-ahead search

### 7.3 Tag-Based Filtering

- [ ] Add tag filtering to timeline

  - Update `useDiscoveryTimeline` hook to filter by tags
  - UI: Show active tags as pills above timeline
  - Click tag to remove from filter

- [ ] Create "Browse by Topic" view
  - Page: `app/timeline/topics/page.tsx`
  - Show all topics with counts
  - Click to view timeline for that topic

---

## 8. 🧭 Navigation & Layout Updates

### 8.1 Update Timeline Page Layout

- [ ] Refactor `src/features/timeline/ui/SubscriptionTimeline.tsx`

  - Remove current `Card` wrapper (make it full-width)
  - Remove current grid layout (replace with masonry)
  - Update to use new card components
  - Add mode toggle (Subscribed/Explore)

- [ ] Create timeline header

  - Component: `src/features/timeline/ui/TimelineHeader.tsx`
  - Title: "Your Political Ecosystem"
  - **Mode Toggle:** Prominent tabs "📌 Following" | "🔭 Explore"
  - Filter button (opens filter panel)
  - Sort dropdown
  - Settings/preferences icon

- [ ] Create mode toggle component

  - Component: `src/features/timeline/ui/TimelineModeToggle.tsx`
  - Two tabs: "Following" (subscribed) and "Explore"
  - Visual indication of active mode
  - Badge showing unread/new counts
  - Smooth transition animation between modes

- [ ] Create filter sidebar
  - Component: `src/features/timeline/ui/TimelineFilterPanel.tsx`
  - Content type filters (checkboxes)
  - Date range filter
  - Topic filters (multi-select)
  - Engagement filter (e.g., show only popular)
  - "Clear all filters" button

### 8.2 Explore Mode Specific UI

- [ ] Create "Why am I seeing this?" tooltip

  - Component: `src/features/timeline/ui/cards/ReasonTooltip.tsx`
  - Small info icon on Explore mode cards
  - Shows reason on hover/click
  - Categories: "Trending", "Popular in [topic]", "Similar to groups you follow", "Your content"

- [ ] Create "Your Content" section header

  - Component: `src/features/timeline/ui/ExploreSectionHeader.tsx`
  - Section dividers: "Your Recent Activity", "Discover", "Trending Topics"
  - Optional collapse/expand

- [ ] Create Explore empty state
  - Component: `src/features/timeline/ui/ExploreEmptyState.tsx`
  - Different from Subscribed empty state
  - Message: "We're finding interesting content for you..."
  - Suggest popular topics to follow

### 8.3 Mobile Responsiveness

- [ ] Optimize masonry grid for mobile

  - Test on various screen sizes (375px to 768px)
  - Ensure cards don't overflow
  - Adjust font sizes for readability

- [ ] Create mobile-specific card variants

  - Smaller padding, font sizes
  - Stacked layout for action buttons
  - Simplified stats display

- [ ] Add swipe gestures (optional)

  - Swipe to dismiss/hide card
  - Swipe to quick-react

- [ ] Mobile mode toggle
  - Bottom sheet or floating toggle for mobile
  - Easy thumb access

---

## 9. 🌐 Internationalization (i18n)

### 9.1 Add English Translations

- [ ] Update `src/i18n/locales/en/features/timeline/index.ts`
  - Add translations for:
    - **Mode labels:** "Following", "Explore"
    - **Section headers:** "Your Recent Activity", "Discover", "Trending"
    - **Reason tooltips:** "Trending", "Popular in [topic]", "Your content"
    - Content type labels (Video, Image, Statement, etc.)
    - Action button labels (Follow, Discuss, React, Share)
    - Reaction labels (Support, Oppose, Interested)
    - Filter labels
    - Empty state messages (different for Subscribed vs. Explore)
    - Error messages

### 9.2 Add German Translations

- [ ] Update `src/i18n/locales/de/features/timeline/index.ts`
  - Mirror all English translations in German

---

## 10. ✅ Testing & Quality Assurance

### 10.1 Unit Tests

- [ ] Write tests for card components

  - Test rendering with various data
  - Test action button clicks
  - Test hover effects (via snapshots)

- [ ] Write tests for hooks

  - `useSubscribedTimeline`
  - `useExploreTimeline`
  - `useTimelineMode`
  - `useTimelineFilters`
  - `useReactions`

- [ ] Write tests for utils
  - `content-scoring.ts`
  - `content-reasons.ts`
  - `gradient-assignment.ts`
  - `public-content-query.ts`
  - `own-content-query.ts`

### 10.2 E2E Tests (Playwright)

- [ ] Update `e2e/timeline/grid-layout.spec.ts`

  - Test masonry grid rendering
  - Test responsive breakpoints

- [ ] Create `e2e/timeline/timeline-modes.spec.ts`

  - Test switching between Following and Explore modes
  - Test Following shows only subscribed content
  - Test Explore shows own content + public content
  - Test mode preference persists across sessions
  - Test different empty states for each mode

- [ ] Create `e2e/timeline/explore-mode.spec.ts`

  - Test "Why am I seeing this?" tooltips
  - Test section headers (Your Content, Discover, Trending)
  - Test public content excludes subscribed items
  - Test user's own content appears

- [ ] Create `e2e/timeline/content-cards.spec.ts`

  - Test each card type renders correctly
  - Test action buttons work

- [ ] Create `e2e/timeline/filtering.spec.ts`

  - Test content type filtering
  - Test tag filtering
  - Test sorting
  - Test filters work in both modes

- [ ] Create `e2e/timeline/interactions.spec.ts`
  - Test follow/unfollow
  - Test reactions
  - Test comments

### 10.3 Visual Regression Testing

- [ ] Take screenshots of all card types

  - Store in `e2e/screenshots/timeline/`
  - Compare on future changes

- [ ] Test dark mode

  - Ensure gradients look good in dark mode
  - Test readability of text overlays

- [ ] Test mode toggle states
  - Screenshot Following mode
  - Screenshot Explore mode
  - Screenshot empty states for both

---

## 11. 🚀 Performance & Polish

### 11.1 Performance Optimization

- [ ] Implement code splitting for card components

  - Lazy load card components not initially visible
  - Use `React.lazy` and `Suspense`

- [ ] Optimize image loading

  - Use blur-up technique (load tiny thumbnail first)
  - Implement progressive JPEG loading

- [ ] Measure and optimize bundle size
  - Run `npm run build` and analyze bundle
  - Ensure masonry library doesn't bloat bundle

### 11.2 Animation & Transitions

- [ ] Add card entrance animations

  - Fade in + slide up as cards appear
  - Stagger animation (delay between cards)

- [ ] Add smooth transitions

  - Hover effects with easing
  - Filter changes with crossfade
  - Loading states with skeleton shimmer

- [ ] Add micro-interactions
  - Button press effect (scale down slightly)
  - Like button heart animation
  - Follow button state change animation

### 11.3 Accessibility (a11y)

- [ ] Ensure keyboard navigation works

  - Tab through cards and action buttons
  - Enter to activate buttons
  - Escape to close modals

- [ ] Add ARIA labels

  - All interactive elements have labels
  - Screen reader friendly

- [ ] Test with screen reader
  - VoiceOver (Mac) or NVDA (Windows)
  - Ensure content is announced correctly

---

## 12. 📝 Documentation

### 12.1 Code Documentation

- [ ] Document all new components with JSDoc

  - Props, usage examples, notes

- [ ] Document timeline data flow

  - Create diagram of data flow
  - Document query patterns for Subscribed vs. Explore
  - Document content scoring algorithm

- [ ] Document the dual-mode architecture
  - Explain Subscribed vs. Explore mode logic
  - Document "Why am I seeing this?" reasons
  - Explain public content filtering

### 12.2 User Documentation

- [ ] Create user guide for new timeline

  - How to switch between Following and Explore modes
  - How to use filters
  - How to react and interact
  - How to post videos/images
  - Understanding "Why am I seeing this?"

- [ ] Update README with timeline features
  - Add screenshots of both modes
  - Explain design decisions

---

## Summary

| Phase                              | Tasks   | Status          |
| ---------------------------------- | ------- | --------------- |
| 1. Design System & Visual Identity | 7       | Not Started     |
| 2. Masonry Grid Layout System      | 8       | Not Started     |
| 3. Content Card Components         | 24      | Not Started     |
| 4. Timeline Data & Query Layer     | 12      | Not Started     |
| 5. Media Handling & Display        | 8       | Not Started     |
| 6. Interaction & Engagement System | 10      | Not Started     |
| 7. Topic & Tag System              | 6       | Not Started     |
| 8. Navigation & Layout Updates     | 11      | Not Started     |
| 9. Internationalization (i18n)     | 2       | Not Started     |
| 10. Testing & Quality Assurance    | 14      | Not Started     |
| 11. Performance & Polish           | 9       | Not Started     |
| 12. Documentation                  | 5       | Not Started     |
| **Total**                          | **116** | **Not Started** |

---

## Creative Design Notes

### 🎨 Visual Inspiration

- **Pinterest:** Masonry layout, visual-first, content discovery
- **Instagram:** Clean cards, strong imagery, engagement-focused
- **Dribbble:** Creative, colorful gradients, playful interactions
- **Notion:** Organized, card-based, actionable
- **Twitter/X Explore:** Two-mode discovery (For You vs. Following)

### 🧠 UX Philosophy

1. **"Every card answers: What can I do with this?"**

   - No passive scrolling - every item is actionable
   - Clear CTAs on every card

2. **"Feel like you're inside a living ecosystem"**

   - Real-time updates
   - See activity happening (votes, joins, comments)
   - Sense of momentum and participation

3. **"Visual hierarchy guides attention"**

   - Media grabs attention first
   - Title/headline second
   - Actions third
   - Stats/metadata last

4. **"Delight in the details"**

   - Smooth animations
   - Satisfying interactions (like button)
   - Personality in the design (gradients, icons)

5. **"Two modes for two needs"**
   - **Following:** My curated world – things I committed to
   - **Explore:** What else is out there? What am I missing?

### 🚀 Future Enhancements (Post-MVP)

- **Algorithmic Feed:** Machine learning to personalize Explore mode
- **Story Format:** Instagram-style stories for events/groups
- **Live Feed:** Real-time updates as they happen (WebSocket)
- **Community Curated:** Featured/pinned content by moderators
- **Collaborative Playlists:** Save and share collections of content
- **Onboarding Tour:** Guided tour of new timeline features
- **Social Graph Recommendations:** "Your connection [Name] joined this group"

---

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)

- Design system (gradients, icons, card styles)
- Masonry grid layout
- Basic card components (Group, Event, Amendment)
- **Mode toggle UI (Following/Explore)**

### Phase 2: Content Expansion (Weeks 3-4)

- Remaining card types (Video, Image, Statement, Todo, Blog, Action)
- Media handling and display
- **Subscribed timeline query hook**
- **Explore timeline query hook (own content + public)**

### Phase 3: Interactions (Week 5)

- Action bar and engagement system
- Reactions, comments, sharing
- Topic/tag system
- **"Why am I seeing this?" tooltips**

### Phase 4: Polish & Launch (Week 6)

- Performance optimization
- Testing (unit, E2E, visual) – including both modes
- Documentation
- Accessibility audit

---

## Open Questions & Decisions

### Masonry Library Choice

**Decision Needed:** Which masonry library to use?

- **Recommendation:** Start with `react-masonry-css` (lightweight, no dependencies)
- **Fallback:** If issues, try `react-responsive-masonry`

### Media Storage

**Current:** Amendment videos stored in `amendments.videoURL`
**Needed:** Generic media posts (not tied to amendments)
**Proposal:**

- Create `mediaPosts` entity in schema
- Fields: `userId`, `mediaType`, `url`, `title`, `description`, `tags`, `createdAt`
- Link to timeline events

### Reaction vs. Like System

**Question:** Should we use reactions (Support/Oppose/Interested) or simple likes?
**Recommendation:** Use reactions - aligns with civic engagement theme

- More expressive than binary like/dislike
- Encourages thoughtful engagement

### Explore Mode Content Mix

**Question:** What percentage of Explore should be "Your Content" vs. "Discover"?
**Recommendation:**

- **Your Content:** Show at top, up to 5 recent items
- **Discover:** Rest of the feed (infinite scroll)
- User can collapse "Your Content" section if they prefer

### Public Content Definition

**Question:** What counts as "public" content in Explore mode?
**Recommendation:**

- Groups with `visibility: 'public'`
- Events marked as public (not members-only)
- Amendments from public groups (not draft/internal)
- Blogs from public groups or individual bloggers
- Statements from users with public profiles

### Algorithm for Explore Feed

**Question:** How complex should the content scoring algorithm be?
**Recommendation:** Start simple (MVP):

1. **Trending score** (engagement in last 24h) – 40% weight
2. **Topic relevance** (matches user's subscribed topics) – 30% weight
3. **Freshness** (recency) – 20% weight
4. **Popularity** (total engagement) – 10% weight

Later iterations can add ML-based personalization.

---

## Notes

- **Creativity > Perfection:** The goal is to create a delightful, engaging experience. Don't be afraid to experiment with visuals, animations, and interactions.
- **Dual Modes are Key:** The Following/Explore toggle is the heart of the new experience. Following keeps users grounded in their commitments; Explore opens new horizons.
- **User Feedback:** After initial implementation, gather user feedback on what content they want to see and how they want to interact.
- **Iterative Approach:** Launch with MVP, iterate based on usage patterns.
- **Performance Matters:** With potentially 100+ cards on screen, optimize early and often.
- **"Why am I seeing this?" builds trust:** In Explore mode, explaining content recommendations makes users feel in control, not manipulated.
