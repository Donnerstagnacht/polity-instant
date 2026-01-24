# GitHub Copilot Instructions for Polity

This document provides essential context about the Polity application architecture, patterns, and conventions.

## Project Overview

Polity is a **full-stack civic engagement platform** built with:
- **Next.js 15** (App Router)
- **InstantDB** (Realtime database)
- **TailwindCSS** + **shadcn/ui** (Styling)
- **Plate.js** (Rich text editor)
- **TypeScript** (Strict mode)
- **i18next** (Internationalization: DE & EN)

---

## Folder Structure

```
polity/
├── app/                    # Next.js App Router pages
│   ├── amendment/[id]/     # Amendment detail & editor
│   ├── blog/               # Blog posts
│   ├── calendar/           # Calendar view
│   ├── create/             # Creation wizards
│   ├── editor/             # Document editor
│   ├── event/              # Event pages
│   ├── group/              # Group pages
│   ├── meet/               # Meeting/video features
│   ├── messages/           # Direct messaging
│   ├── notifications/      # Notification center
│   ├── search/             # Global search
│   ├── statement/          # Statement pages
│   ├── todos/              # Todo management
│   ├── user/               # User profile & settings
│   └── api/                # API routes (ai, events, etc.)
│
├── src/
│   ├── components/         # Shared UI components
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── layout/         # Layout components
│   │   ├── editor/         # Editor components
│   │   ├── kit-platejs/    # Plate.js kit components
│   │   └── shared/         # Shared feature components
│   │
│   ├── features/           # Feature modules (domain logic)
│   │   ├── amendments/     # Amendment system
│   │   │   ├── change-requests/  # Change request management
│   │   │   ├── collaborators/    # Collaborator management
│   │   │   ├── discussions/      # Discussion threads
│   │   │   ├── document-editor/  # Plate.js editor integration
│   │   │   └── ui/               # Amendment UI components
│   │   ├── auth/           # Authentication
│   │   ├── blogs/          # Blog system
│   │   ├── calendar/       # Calendar features
│   │   ├── editor/         # **Unified Editor System** (NEW)
│   │   │   ├── hooks/      # useEditor, useEditorPresence, useEditorUsers
│   │   │   ├── types/      # EditorEntity, EditorMode, EditorCapabilities
│   │   │   ├── ui/         # EditorView, VersionControl, ModeSelector
│   │   │   └── utils/      # entity-adapter, version-utils, editor-operations
│   │   ├── events/         # Event management
│   │   ├── groups/         # Group management
│   │   ├── messages/       # Messaging system
│   │   ├── notifications/  # Notification system
│   │   ├── search/         # Search functionality
│   │   ├── statements/     # Statement features
│   │   ├── timeline/       # Activity timeline
│   │   ├── todos/          # Task management
│   │   └── user/           # User profile features
│   │
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Internationalization
│   │   └── locales/
│   │       ├── de/         # German translations
│   │       └── en/         # English translations
│   ├── navigation/         # Navigation system
│   ├── global-state/       # Zustand stores
│   └── utils/              # Utility functions
│
├── db/
│   ├── db.ts               # InstantDB client
│   ├── instant.schema.ts   # Database schema
│   ├── instant.perms.ts    # Permission rules
│   ├── rbac/               # Role-Based Access Control
│   └── schema/             # Schema definitions
│
├── e2e/                    # Playwright E2E tests
├── scripts/                # Seed & utility scripts
└── public/                 # Static assets, PWA manifest
```

---

## Internationalization (i18n)

**Supported Languages:** German (`de`) and English (`en`)

### Translation Files Structure
- `src/i18n/locales/de/` - German translations
- `src/i18n/locales/en/` - English translations

Each locale has:
- `common.ts` - Common strings
- `components.ts` - Component-specific strings
- `navigation.ts` - Navigation labels
- `features/` - Feature-specific translations
- `pages/` - Page-specific translations
- `plateJs.ts` - Editor translations

### Usage Pattern
```tsx
import { useTranslation } from '@/hooks/use-translation';

function MyComponent() {
  const { t } = useTranslation();
  return <span>{t('features.amendments.title')}</span>;
}
```

**CRITICAL:** All user-facing strings MUST be translated. Never hardcode German or English strings directly in components.

---

## RBAC System (Role-Based Access Control)

Located in `db/rbac/`:

### Resource Types
Entities that can have permissions:
- `groups`, `events`, `amendments`, `blogs`
- `groupMemberships`, `eventParticipants`, `blogBloggers`
- `changeRequests`, `comments`, `elections`, `todos`, `messages`
- `groupDocuments`, `groupRoles`, `groupPositions`, etc.

### Action Types
- `view`, `manage`, `create`, `update`, `delete`
- `vote`, `comment`, `moderate`
- `invite_members`, `manage_members`, `manage_participants`
- `manage_roles`, `manage_speakers`, `manage_votes`, `manageNotifications`

### Permission Inheritance
```typescript
// 'manage' implies: view, create, update, delete
// 'moderate' implies: view
// 'manage_members' implies: view, invite_members
```

### Default Roles
- **Groups:** Admin, Moderator, Member
- **Events:** Organizer, Participant
- **Amendments:** Author, Collaborator
- **Blogs:** Owner, Writer

### Usage
```tsx
import { usePermissions } from '@db/rbac';

function MyComponent() {
  const { hasGroupPermission } = usePermissions(userId, { groupId });
  if (hasGroupPermission('amendments', 'create')) {
    // Show create button
  }
}
```

---

## Notification System

Located in `src/features/notifications/` and `src/utils/notification-helpers.ts`

### Notification Types
- `amendment_workflow_changed` - Workflow status updates
- `membership_request` - Group join requests
- `comment_added` - New comments
- `vote_cast` - Voting notifications
- And many more...

### Creating Notifications
```typescript
import { notifyWorkflowChanged } from '@/utils/notification-helpers';

notifyWorkflowChanged({
  amendmentId,
  userId,
  oldStatus,
  newStatus,
});
```

---

## Timeline System

Located in `src/features/timeline/`

The timeline displays activity feeds for users, groups, and amendments. Timeline events are shown as **gradient cards** with visual distinction based on event type.

### Gradient Card Pattern
Use the `GRADIENTS` array from `src/features/user/state/gradientColors.ts`:
```typescript
const gradientClass = GRADIENTS[index % GRADIENTS.length];
// Returns: 'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50'
```

---

## Amendment System & Forwarding

Amendments flow through groups and events:

### Workflow Statuses
1. `collaborative_editing` - Direct editing by collaborators
2. `internal_suggesting` - Collaborators submit suggestions
3. `internal_voting` - Timed voting among collaborators
4. `viewing` - Read-only mode
5. `event_suggesting` - Event participants create suggestions
6. `event_voting` - Sequential voting at events
7. `passed` / `rejected` - Terminal states

### Forwarding Flow
Amendments can be **forwarded** from:
- Author → Group
- Group → Parent Group
- Group → Event (for discussion/voting)

### Change Requests
Located in `src/features/amendments/change-requests/`:
- Suggestions are created as change requests
- Voting is tracked per change request
- Approved changes are merged into the document

---

## Editor System (Plate.js)

Rich text editing is powered by Plate.js with a **unified editor system**:

### Unified Editor Feature
Located in `src/features/editor/`:

```typescript
import { EditorView, useEditor, VersionControl, ModeSelector } from '@/features/editor';

// Usage in a page
<EditorView
  entityType="amendment" // 'amendment' | 'blog' | 'document' | 'groupDocument'
  entityId={entityId}
  userId={user?.id}
  userRecord={{ id, name, email, avatar }}
/>
```

### Entity Types
- **amendment** - Amendment documents with full workflow (suggest/vote modes)
- **blog** - Blog posts with public/private visibility
- **document** - Standalone documents with collaborators
- **groupDocument** - Group-scoped documents

### Editor Capabilities
Capabilities are configured per entity type:
```typescript
const DEFAULT_CAPABILITIES = {
  amendment: { versioning: true, presence: true, voting: true, modeSelection: true },
  blog: { versioning: true, presence: false, voting: false, modeSelection: true },
  document: { versioning: true, presence: true, voting: false, modeSelection: false },
  groupDocument: { versioning: false, presence: true, voting: false, modeSelection: false },
};
```

### Key Components
- `EditorView` - Main unified editor view
- `VersionControl` - Version history and restore
- `ModeSelector` - Switch between edit/view/suggest/vote modes
- `InviteCollaboratorDialog` - Invite users to collaborate

### Core Plate.js Integration
- `src/components/kit-platejs/` - Plate.js kit components
- `src/components/ui-platejs/` - Plate.js UI components
- `PlateEditor` - Core editor component with all plugins

---

## Navigation System

Located in `src/navigation/`:

### Primary & Secondary Navigation
- **Primary Navigation:** Main routes (Groups, Events, Calendar, etc.)
- **Secondary Navigation:** Context-specific sub-navigation per route

Example: `/group/[id]` has secondary nav for Members, Roles, Documents, etc.

### Navigation State
```typescript
import { useNavigation } from '@/navigation/state/useNavigation';

const { primaryNavItems, secondaryNavItems } = useNavigation();
```

### Command Dialog
Global command palette (`Ctrl/Cmd + K`) searches both primary and secondary nav items.

---

## Search System

Located in `src/features/search/`:

### Type-Ahead Search Pattern
**CRITICAL:** All searches in Polity are **type-ahead searches**. As the user types, results appear immediately (with debouncing).

### Implementation
```tsx
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';

<TypeAheadSelect
  items={searchResults}
  onSearch={handleSearch}
  renderItem={(item) => <SearchCard item={item} />}
/>
```

### Search Result Cards
Results are displayed as **gradient cards** using entity-specific card components:
- `UserSearchCard` - User results with gradient header
- `GroupSelectCard` - Group selection cards
- `EventSelectCard` - Event selection cards
- `AmendmentSelectCard` - Amendment selection cards

All cards use the gradient pattern from `GRADIENTS` array.

---

## Vote System

### Vote Types
- `accept` - Approve the change
- `reject` - Reject the change
- `abstain` - Abstain from voting

### Vote Controls
Located in `src/features/amendments/ui/VoteControls.tsx`:
- Shows vote counts (accept/reject/abstain)
- Displays who voted and how
- Handles vote submission
- Calculates if quorum is reached

---

## Database (InstantDB)

### Client Initialization
```typescript
import { db, tx, id } from 'db/db';

// Query data
const { data, isLoading } = db.useQuery({ groups: {} });

// Write data
db.transact(tx.groups[id()].update({ name: 'New Group' }));
```

### Schema
Defined in `db/instant.schema.ts` with:
- `entities` - Data models with typed fields
- `links` - Relationships between entities
- `rooms` - Real-time presence/topics

### Critical InstantDB Rules
1. **Always index fields** you want to filter or order by
2. Use `id()` to generate UUIDs for new entities
3. Pagination only works on top-level namespaces
4. Use admin SDK for seeding data (never client-side)

---

## Component Patterns

### UI Components
Located in `src/components/ui/` (shadcn/ui based):
- `Button`, `Card`, `Dialog`, `Badge`, `Input`, etc.
- `TypeAheadSelect` - Type-ahead search component
- `entity-select-cards.tsx` - Gradient entity cards

### Feature Organization
Each feature folder typically contains:
- `hooks/` - Feature-specific hooks
- `ui/` - Feature UI components
- `utils/` - Feature utilities
- `types/` - TypeScript types

---

## Testing

### E2E Tests (Playwright)
Located in `e2e/`:
- Use `aria-kai.ts` for accessibility helpers
- Test files organized by feature
- Run with `npx playwright test`

### Test Helpers
- `e2e/helpers/` - Shared test utilities
- `e2e/test-entity-ids.ts` - Stable test IDs

---

## Key Conventions

1. **Always use translations** for user-facing text
2. **Search = Type-ahead** with immediate results
3. **Cards = Gradient styling** for visual appeal
4. **Navigation = Primary + Secondary** context
5. **Permissions = RBAC checks** before actions
6. **Notifications = Generated** on key events
7. **Workflow = Status-based** with defined transitions
8. **Realtime = InstantDB subscriptions** for live updates
