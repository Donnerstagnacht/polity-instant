# Group Network Page Refactor — Implementation Tasks

This document tracks all tasks needed to:

1. Restructure `/group/$id/network` into two tabs: **"Current network"** (graph) + **"Manage network"** (requests/links management)
2. Add gradient badges to visually distinguish rights on network requests
3. Create a **reusable search bar component** (`EntitySearchBar`) for filtering by entity name, usable across memberships, participants, collaborators, and notifications pages
4. Add right-type / link-type filtering to the Manage Network tab

**Architecture Reference:** `.github/copilot-instructions.md`

**Progress Overview:**

- Total Tasks: 32
- Completed: 26
- Remaining: 6

---

## 1. Reusable Search & Filter Component (`EntitySearchBar`)

The user wants a single, reusable search bar that can be used across many pages for filtering by entity name (groups, users, events, amendments, etc.). An inline search already exists in `GroupRelationshipsManager`, `useMembershipSearch`, `useUserMembershipsFilters`, `NotificationsPage`, `EventParticipants`, and `CollaboratorsView`. We extract the common pattern.

### 1.1 Create `EntitySearchBar` component

- [x] **Create `src/components/ui/entity-search-bar.tsx`** — A reusable presentational component with:
  - `searchQuery: string` prop
  - `onSearchQueryChange: (query: string) => void` prop
  - `placeholder?: string` prop (default: "Search...")
  - `filterOptions?: { label: string; value: string; active: boolean }[]` prop for toggle-style filter chips (e.g. right types, status types)
  - `onFilterToggle?: (value: string) => void` prop
  - `className?: string` prop for layout customization
  - Uses `Search` icon from lucide-react, `Input` from `@/components/ui/input`
  - Renders filter chips below the search input using `Badge` from `@/components/ui/badge`
  - Filter chips use gradient styles from `BADGE_GRADIENTS` / `getHashtagGradient` when an `enableGradients` prop is true

### 1.2 Create `useEntitySearch` hook

- [x] **Create `src/hooks/useEntitySearch.ts`** — A generic filtering hook:
  - Takes `items: T[]`, `searchQuery: string`, `searchFields: (keyof T | string)[]`
  - Returns `filteredItems: T[]`
  - Supports nested field access (e.g. `"group.name"`, `"user.first_name"`)
  - Uses `useMemo` for performance
  - Pure UI-state hook, no React context dependencies
  - This is a thin, zero-dependency utility that all domain-specific filter hooks can delegate to

### 1.3 Integrate into existing pages (after network page work is done)

These tasks wire `EntitySearchBar` into pages that currently have inline search inputs. Each is independent and can be done in parallel.

- [x] **Integrate into `/group/$id/memberships`** — Replace the inline `Input` + `Search` icon in `memberships.tsx` with `<EntitySearchBar>`. Continue using `useMembershipSearch` for the filtering logic.
- [x] **Integrate into `/user/$id/memberships`** — Replace the inline search in the user memberships page with `<EntitySearchBar>`. Continue using `useUserMembershipsFilters` for logic.
- [x] **Integrate into `/event/$id/participants`** — Replace inline search in `EventParticipants` with `<EntitySearchBar>`.
- [x] **Integrate into `/amendment/$id/collaborators`** — Replace inline search in `CollaboratorsView` with `<EntitySearchBar>`.
- [x] **Integrate into `/notifications`** — Replace the inline `<Input>` in `NotificationsPage.tsx` with `<EntitySearchBar>`.
- [x] **Integrate into entity notification pages** — Update `EntityNotifications.tsx` to include `<EntitySearchBar>` for filtering notifications by sender name/message content. Applies to `/group/$id/notifications`, `/event/$id/notifications`, `/amendment/$id/notifications`.

---

## 2. Gradient Right Badges

Create a dedicated component for rendering rights as visually distinct gradient badges. Reuse the existing `BADGE_GRADIENTS` system from `src/features/timeline/logic/gradient-assignment.ts`.

### 2.1 Create `RightBadge` component

- [x] **Create `src/features/network/ui/RightBadge.tsx`** — A small presentational component:
  - Props: `right: string`, `className?: string`, `variant?: 'gradient' | 'outline'`
  - Maps each of the 5 right types to a **deterministic gradient** from `BADGE_GRADIENTS`:
    - `informationRight` → blue-cyan gradient
    - `amendmentRight` → violet-purple gradient
    - `rightToSpeak` → teal-emerald gradient
    - `activeVotingRight` → orange-red gradient
    - `passiveVotingRight` → pink-rose gradient
  - Uses `Badge` from `@/components/ui/badge` as the base
  - Uses `getRightLabel()` from `RightFilters.tsx` for display text
  - Falls back to `variant="outline"` when `variant` prop is `'outline'`
  - Supports translation via `useTranslation` for right labels

### 2.2 Refactor existing right badge usages

- [x] **Update `GroupRelationshipsManager.tsx`** — Replace inline `<Badge variant="outline" className="text-xs">{formatRights([r])}</Badge>` with `<RightBadge right={r} />` in incoming requests, outgoing requests, and active relationships table.
- [ ] **Update `GroupNetworkFlow.tsx`** — Where rights are displayed in edge labels or panels, use `RightBadge` for visual consistency (if applicable in the legend/panel).
- [ ] **Update `RightFilters.tsx`** — Optionally use `RightBadge` inside filter toggle buttons for stylistic consistency. Keep the toggle behavior separate.

---

## 3. Network Page Tab Structure

Restructure the `/group/$id/network` route to have two tabs: **"Current network"** and **"Manage network"**, mirroring the memberships page pattern.

### 3.1 Create `NetworkTabs` component

- [x] **Create `src/features/network/ui/NetworkTabs.tsx`** — A tab container (same pattern as `MembershipTabs.tsx`):
  - Props: `activeTab: NetworkTab`, `onTabChange: (tab: NetworkTab) => void`, `currentNetworkContent: React.ReactNode`, `manageNetworkContent: React.ReactNode`
  - Uses `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` from `@/components/ui/tabs`
  - Tab values: `'current-network'` | `'manage-network'`

### 3.2 Create `NetworkTab` type

- [x] **Add `NetworkTab` type to `src/features/network/types/network.types.ts`** (create file if needed):
  - `export type NetworkTab = 'current-network' | 'manage-network';`
  - Any other types needed for the refactored network page

### 3.3 Create `useNetworkPage` composition hook

- [x] **Create `src/features/network/hooks/useNetworkPage.ts`** — Page composition hook following the `useXxxPage` pattern:
  - Calls `useGroupNetwork(groupId)` for network data (active relationships, requests)
  - Calls `useGroupData(groupId)` for group info
  - Calls `useGroupActions()` for mutations (accept/reject/delete/create relationship)
  - Manages tab state: `activeTab: NetworkTab`
  - Manages search state: `searchQuery`, `setSearchQuery`
  - Manages right filter state: `selectedRightFilter: Set<string>`, `toggleRightFilter`
  - Manages direction filter: `directionFilter: 'all' | 'parent' | 'child'`
  - Computes `filteredActiveRelationships` (from `useEntitySearch` or inline `useMemo`)
  - Computes `filteredIncomingRequests`, `filteredOutgoingRequests`
  - Exposes handlers: `handleAcceptRequest`, `handleRejectRequest`, `handleCancelRequest`, `handleDeleteRelationship`
  - Returns everything the page component needs

### 3.4 Create `ManageNetworkTab` component

- [x] **Create `src/features/network/ui/ManageNetworkTab.tsx`** — Presentational component for the "Manage network" tab:
  - Receives all data and callbacks as props from the page
  - Renders:
    1. **`EntitySearchBar`** at the top for filtering by group name
    2. **Right-type filter chips** (using `RightBadge` or `EntitySearchBar` filter options)
    3. **Direction filter** (Select: All / Parents only / Children only)
    4. **`LinkGroupDialog`** button (for creating new link requests)
    5. **Incoming Requests section** — Cards with group name, relationship type, `RightBadge` per right, Accept/Reject buttons. Only shows when `incomingRequests.length > 0`
    6. **Outgoing Requests section** — Cards with group name, relationship type, `RightBadge` per right, Cancel button. Only shows when `outgoingRequests.length > 0`
    7. **Active Relationships table** — Table with columns: Group Name, Relationship (parent/child badge), Rights (`RightBadge` per right), Actions (Edit via `LinkGroupDialog`, Delete via `AlertDialog`)
  - Structure mirrors `GroupRelationshipsManager.tsx` but cleaner, using new components

### 3.5 Create `CurrentNetworkTab` component

- [x] **Create `src/features/network/ui/CurrentNetworkTab.tsx`** — Wrapper around the existing `GroupNetworkFlow`:
  - Simply renders `<GroupNetworkFlow groupId={groupId} />`
  - May add a brief description card above the graph
  - Keeps the graph visualization exactly as-is (no changes to XYFlow logic)

### 3.6 Refactor the network route page

- [x] **Update `src/routes/_authed/group/$id/network.tsx`** — The thin page shell:
  - Import and call `useNetworkPage(groupId)`
  - Render `<NetworkTabs>` with:
    - `currentNetworkContent` → `<CurrentNetworkTab groupId={groupId} />`
    - `manageNetworkContent` → `<ManageNetworkTab ...props />` with all data/handlers from the hook
  - Include `useTranslation()` for i18n
  - Add `useAuth()` if needed for permission-based UI

---

## 4. Right-Type & Link-Type Filtering in Manage Tab

### 4.1 Add right-type filtering to `useNetworkPage`

- [x] **In `useNetworkPage.ts`**: Add `selectedRightFilter: Set<string>` state (default: all rights selected). Filter `filteredActiveRelationships`, `filteredIncomingRequests`, `filteredOutgoingRequests` by selected rights. A relationship matches if it has at least one right in the selected set.

### 4.2 Add direction filtering

- [x] **In `useNetworkPage.ts`**: Add `directionFilter: 'all' | 'parent' | 'child'` state. Filter active relationships by direction (parent/child relative to current group).

### 4.3 Wire filters into `ManageNetworkTab`

- [x] **In `ManageNetworkTab.tsx`**: Render `EntitySearchBar` with `filterOptions` prop populated from `RIGHT_TYPES` mapped to `RightBadge`-styled chips. Render direction `Select` dropdown. All state managed by parent via props.

---

## 5. Cleanup & Migration

### 5.1 Deprecate or refactor `GroupRelationshipsManager`

- [x] **Assess `GroupRelationshipsManager.tsx` usage** — Check if it's used anywhere besides the old network/relationship page. If the new `ManageNetworkTab` fully replaces it, mark as deprecated or remove. If used elsewhere (e.g. group detail page sidebar), keep it but have it delegate to the new components.

### 5.2 Move `GroupRelationshipsManager` and `LinkGroupDialog` to feature folder

- [x] **Move `src/components/groups/GroupRelationshipsManager.tsx` → `src/features/network/ui/GroupRelationshipsManager.tsx`** (if kept). Per architecture convention, feature-specific components belong in `src/features/*/ui/`, not `src/components/`.
- [x] **Move `src/components/groups/LinkGroupDialog.tsx` → `src/features/network/ui/LinkGroupDialog.tsx`**. Update all imports accordingly.

### 5.3 Add i18n keys

- [x] **Add translation keys** for new tab labels and any new UI text:
  - `features.network.tabs.currentNetwork` → "Current network"
  - `features.network.tabs.manageNetwork` → "Manage network"
  - `features.network.search.placeholder` → "Search groups..."
  - `features.network.filter.byRight` → "Filter by right"
  - `features.network.filter.byDirection` → "Filter by direction"
  - Any other new strings introduced in `ManageNetworkTab`, `NetworkTabs`, `RightBadge`
  - Check existing keys in `common.network.*` namespace first — many already exist

---

## Summary

| Phase                        | Tasks | Status           | Parallelizable                                  |
| ---------------------------- | ----- | ---------------- | ----------------------------------------------- |
| 1. Reusable Search Component | 9     | Done             | 1.1-1.2 parallel; 1.3.\* all parallel after 1.1 |
| 2. Gradient Right Badges     | 4     | Partial (2 of 4) | 2.1 first; 2.2.\* parallel after                |
| 3. Network Page Tabs         | 6     | Done             | 3.1-3.2 parallel; 3.3-3.5 parallel; 3.6 last    |
| 4. Filtering                 | 3     | Done             | 4.1-4.2 parallel; 4.3 after both                |
| 5. Cleanup & Migration       | 4     | Done             | All parallel                                    |

**Recommended execution order:**

1. Phase 2.1 (`RightBadge`) + Phase 1.1-1.2 (`EntitySearchBar` + `useEntitySearch`) — foundational components, no dependencies
2. Phase 3.1-3.2 (`NetworkTabs` + types) — UI shell
3. Phase 3.3 (`useNetworkPage`) + Phase 4.1-4.2 (filtering logic inside the hook)
4. Phase 3.4-3.5 (`ManageNetworkTab` + `CurrentNetworkTab`) + Phase 4.3 (wire filters)
5. Phase 3.6 (refactor route page) — ties everything together
6. Phase 2.2 (refactor existing badge usages) + Phase 1.3 (integrate search into other pages) + Phase 5 (cleanup) — all independent

---

## Existing Files Reference

| File                                                                                                           | Purpose                                 | Action                                               |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| [src/routes/\_authed/group/$id/network.tsx](src/routes/_authed/group/$id/network.tsx)                          | Network route                           | Refactor to use tabs + composition hook              |
| [src/features/network/ui/GroupNetworkFlow.tsx](src/features/network/ui/GroupNetworkFlow.tsx)                   | XYFlow graph visualization              | Keep as-is, wrap in `CurrentNetworkTab`              |
| [src/components/groups/GroupRelationshipsManager.tsx](src/components/groups/GroupRelationshipsManager.tsx)     | Existing relationship manager           | Replace with `ManageNetworkTab`                      |
| [src/components/groups/LinkGroupDialog.tsx](src/components/groups/LinkGroupDialog.tsx)                         | Link/relationship creation dialog       | Move to features/network, reuse                      |
| [src/features/network/ui/RightFilters.tsx](src/features/network/ui/RightFilters.tsx)                           | Right type filter buttons + helpers     | Reuse `RIGHT_TYPES`, `formatRights`, `getRightLabel` |
| [src/features/network/hooks/useGroupNetwork.ts](src/features/network/hooks/useGroupNetwork.ts)                 | Network data calculation                | Consumed by `useNetworkPage`                         |
| [src/features/timeline/logic/gradient-assignment.ts](src/features/timeline/logic/gradient-assignment.ts)       | `BADGE_GRADIENTS`, `getHashtagGradient` | Reuse for `RightBadge`                               |
| [src/features/groups/ui/MembershipTabs.tsx](src/features/groups/ui/MembershipTabs.tsx)                         | Tab container pattern reference         | Pattern to follow for `NetworkTabs`                  |
| [src/features/groups/hooks/useMembershipSearch.ts](src/features/groups/hooks/useMembershipSearch.ts)           | Membership filtering hook               | Pattern reference for `useEntitySearch`              |
| [src/features/users/hooks/useUserMembershipsFilters.ts](src/features/users/hooks/useUserMembershipsFilters.ts) | User memberships filtering              | Integrate `EntitySearchBar`                          |
| [src/features/notifications/NotificationsPage.tsx](src/features/notifications/NotificationsPage.tsx)           | Notifications page                      | Integrate `EntitySearchBar`                          |
| [src/components/notifications/EntityNotifications.tsx](src/components/notifications/EntityNotifications.tsx)   | Entity-scoped notifications             | Integrate `EntitySearchBar`                          |

---

## Notes

- The existing `GroupRelationshipsManager` already has the full request management flow (accept/reject/cancel) with `useGroupNetwork` hook. The refactor mostly moves this into the tab structure with better componentization.
- `BADGE_GRADIENTS` are vibrant gradients designed for badge use — perfect for `RightBadge`.
- The `useGroupNetwork` hook already categorizes relationships into `activeRelationships`, `incomingRequests`, and `outgoingRequests` — no new data layer work needed.
- No database schema changes are required; the `group_relationship` table already supports the full request flow with `status` and `initiator_group_id` fields.
- All new files follow the architecture conventions: queries in `queries.ts`, pure logic in `logic/`, hooks in `hooks/`, UI in `ui/`, page shells thin.
