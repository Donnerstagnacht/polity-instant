# Blog & Statement System Overhaul — Implementation Tasks

This document tracks all tasks needed to overhaul the blog and statement systems. Blogs and statements become user/group-attached entities (no longer standalone). Statements become Reddit-style posts with threading, voting, hashtags, mentions, surveys, and media. Blogs become long-form collaborative analysis with shared editing. A shared typeahead search system, shared hashtag system, and shared comment/voting system are extracted as reusable features.

**Progress Overview:**

- Total Tasks: ~115
- Completed: ~115
- Remaining: 0

---

## 1. Shared Typeahead Search Component (features/shared)

Extract and build a central, reusable typeahead search for users, groups, amendments, and events. Replace existing one-off implementations throughout the codebase.

### 1.1 Logic Layer — `features/shared/logic/`

- [x] Create `src/features/shared/logic/typeaheadHelpers.ts` — pure functions:
  - `filterItems(items, query, searchKeys)` — fuzzy/prefix search filter
  - `highlightMatch(text, query)` — returns match ranges for highlighting
  - `groupResultsByType(items)` — groups mixed results by entity type
  - `sortByRelevance(items, query)` — score-based sorting (name match > hashtag match > description match)
- [x] Create `src/features/shared/logic/entityCardHelpers.ts` — pure functions:
  - `getEntityGradient(entityType)` — returns gradient class per entity type (reuse search page gradients)
  - `getEntityIcon(entityType)` — returns icon per entity type
  - `formatEntityLabel(entity, entityType)` — unified label formatting (name, title, code)

### 1.2 Hooks Layer — `features/shared/hooks/`

- [x] Create `src/features/shared/hooks/useTypeaheadSearch.ts`:
  - Accepts `entityTypes: ('user' | 'group' | 'amendment' | 'event')[]`
  - Composes `useUserState`, `useGroupState`, `useAmendmentState`, `useEventState` to gather data
  - Manages search query state, debounce, filtered results
  - Returns `{ query, setQuery, results, isLoading, selectedItem, setSelectedItem }`
- [x] Create `src/features/shared/hooks/useTypeaheadData.ts`:
  - Encapsulates conditional data fetching based on requested entity types
  - Merges multiple data sources into unified `TypeaheadItem[]` shape

### 1.3 UI Layer — `features/shared/ui/`

- [x] Create `src/features/shared/ui/typeahead/TypeaheadSearch.tsx`:
  - Input field with dropdown proposal list
  - Props: `entityTypes`, `value`, `onChange`, `placeholder`, `multiple?`, `renderItem?`, `filterFn?`
  - Keyboard navigation (arrow keys, enter, escape)
  - Shows entity image, name, hashtags per result card
  - Uses gradient coloring per entity type (from search page) and per hashtag
- [x] Create `src/features/shared/ui/typeahead/TypeaheadResultCard.tsx`:
  - Renders a single search result with image/avatar, name, hashtags, entity-type gradient border
  - Reuses existing `HashtagDisplay` component for hashtag pills
  - Coloring matches search page entity gradients
- [x] Create `src/features/shared/ui/typeahead/TypeaheadDropdown.tsx`:
  - Popover/dropdown container for search results grouped by entity type
  - Section headers per type (Users, Groups, Amendments, Events)
  - Empty state, loading state
- [x] Create `src/features/shared/ui/typeahead/index.ts` — barrel exports

### 1.4 Documentation

- [x] Create `src/features/shared/ui/typeahead/TYPEAHEAD.md` — API documentation:
  - Usage examples, props reference, customization points, entity type configuration
  - How to add new entity types
  - Integration guide for mentions (@)

### 1.5 Replace Existing Implementations

- [x] Refactor `src/features/shared/ui/ui/type-ahead-select.tsx` to use the new shared typeahead (or keep as low-level primitive and have new component compose it)
- [x] Replace typeahead in `src/features/agendas/ui/CreateAgendaItemForm.tsx` with new `TypeaheadSearch`
- [x] Replace typeahead in `src/features/amendments/ui/TargetSelectionDialog.tsx` with new `TypeaheadSearch`
- [x] Replace typeahead in `src/features/amendments/ui/TargetGroupEventSelector.tsx` with new `TypeaheadSearch`
- [x] Replace typeahead in `src/features/amendments/ui/AmendmentProcessFlow.tsx` with new `TypeaheadSearch`
- [x] Replace user search in payment flow (if applicable) with new `TypeaheadSearch`
- [x] Scan codebase for remaining `TypeAheadSelect` / `useUserSearch` usages and migrate

---

## 2. Shared Hashtag System (Extract to features/shared)

Extract the existing hashtag UI/logic into a fully shared feature that can be reused across all entities.

### 2.1 Extract to `features/shared/`

- [x] Move/copy `src/features/shared/ui/ui/hashtag-input.tsx` → `src/features/shared/ui/hashtags/HashtagInput.tsx`
- [x] Move/copy `src/features/shared/ui/ui/hashtag-editor.tsx` → `src/features/shared/ui/hashtags/HashtagEditor.tsx`
- [x] Move/copy `src/features/shared/ui/ui/hashtag-display.tsx` → `src/features/shared/ui/hashtags/HashtagDisplay.tsx`
- [x] Create `src/features/shared/logic/hashtagHelpers.ts` — extract/consolidate pure functions from `src/zero/common/hashtagHelpers.ts`:
  - `extractHashtags()`, `extractHashtagTags()`, `getHashtagGradient(tag)`, `parseHashtagsFromText(text)` (new — for statement text parsing)
- [x] Create `src/features/shared/hooks/useHashtags.ts` — reusable hook wrapping:
  - `useCommonState({ loadAllHashtags, [entityType]_id })` + `useCommonActions().syncEntityHashtags()`
  - Returns `{ allHashtags, entityHashtags, tags, setTags, syncHashtags }`
- [x] Create `src/features/shared/ui/hashtags/index.ts` — barrel exports
- [x] Update all existing import paths across the codebase to use the new shared hashtags location (blog create form, amendment edit, user settings, event create, group settings, etc.)

---

## 3. Shared Comment Thread & Voting System (Extract to features/shared)

Extract comment/thread/voting patterns from amendments and blog detail into a reusable system.

### 3.1 Extract Comment Thread UI

- [x] Create `src/features/shared/ui/comments/CommentThread.tsx`:
  - Reusable threaded comment display with nested replies
  - Props: `entityType`, `entityId`, `comments`, `onAddComment`, `onVote`, `onDelete`, `sortBy`
  - Renders `CommentItem` recursively for nested `parent_id` structure
- [x] Create `src/features/shared/ui/comments/CommentItem.tsx`:
  - Single comment with avatar, name, handle, date, content
  - Up/down vote buttons with score display
  - Reply button, edit/delete (if owner)
  - Nested children
- [x] Create `src/features/shared/ui/comments/CommentInput.tsx`:
  - Textarea for new comment/reply
  - Submit button, character count
  - Reply-to indicator
- [x] Create `src/features/shared/ui/comments/CommentSortSelect.tsx`:
  - Sort by: newest, oldest, most votes (reuse from existing `CommentSortSelect`)
- [x] Create `src/features/shared/ui/comments/index.ts` — barrel exports

### 3.2 Extract Voting UI

- [x] Create `src/features/shared/ui/voting/VoteButtons.tsx`:
  - Up/down vote arrows with score display
  - Props: `upvotes`, `downvotes`, `userVote`, `onVote`, `size`, `orientation` (vertical/horizontal)
  - Reusable for statements, comments, blogs, amendments
- [x] Create `src/features/shared/ui/voting/index.ts` — barrel exports

### 3.3 Shared Comment Hooks

- [x] Create `src/features/shared/hooks/useCommentThread.ts`:
  - Composes document comment queries/actions generically
  - Manages comment tree building from flat list (using `parent_id`)
  - Returns `{ comments, addComment, deleteComment, voteComment, sortedComments }`
- [x] Refactor `BlogDetail.tsx` to use shared `CommentThread` instead of inline comment implementation
- [x] Ensure amendment discussions use the same shared `CommentThread` component

---

## 4. Statement Schema Overhaul (Database + Zero + Zod)

Transform statements from simple text posts to Reddit-style posts with hashtags, mentions, media, and surveys.

### 4.1 Supabase SQL Schema Updates — `supabase/schemas/11_statement.sql`

- [x] Add columns to `statement` table:
  - `group_id UUID REFERENCES public."group"(id) ON DELETE SET NULL` — optional group attachment
  - `image_url TEXT` — optional image
  - `video_url TEXT` — optional video
  - `upvotes INTEGER NOT NULL DEFAULT 0` — denormalized upvote count
  - `downvotes INTEGER NOT NULL DEFAULT 0` — denormalized downvote count
  - `comment_count INTEGER NOT NULL DEFAULT 0` — denormalized comment count
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` — track edits
- [x] Remove `tag TEXT` column from `statement` table (replaced by hashtag system)
- [x] Add `CREATE INDEX idx_statement_group ON public.statement (group_id)` index

### 4.2 Statement Hashtag Junction — `supabase/schemas/21_common.sql`

- [x] Add `statement_hashtag` junction table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.statement_hashtag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID NOT NULL REFERENCES public.statement(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtag(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(statement_id, hashtag_id)
  );
  CREATE INDEX idx_statement_hashtag_statement ON public.statement_hashtag(statement_id);
  CREATE INDEX idx_statement_hashtag_hashtag ON public.statement_hashtag(hashtag_id);
  ALTER TABLE public.statement_hashtag ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "service_role_all" ON public.statement_hashtag FOR ALL TO service_role USING (true);
  ```

### 4.3 Statement Survey Tables — `supabase/schemas/11_statement.sql`

- [x] Add `statement_survey` table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.statement_survey (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID NOT NULL REFERENCES public.statement(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(statement_id)
  );
  ```
- [x] Add `statement_survey_option` table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.statement_survey_option (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.statement_survey(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    vote_count INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- [x] Add `statement_survey_vote` table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.statement_survey_vote (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id UUID NOT NULL REFERENCES public.statement_survey_option(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(option_id, user_id)
  );
  ```

### 4.4 Statement Vote Table — `supabase/schemas/20_vote.sql`

- [x] Add `statement_support_vote` table (mirrors `blog_support_vote`):
  ```sql
  CREATE TABLE IF NOT EXISTS public.statement_support_vote (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID NOT NULL REFERENCES public.statement(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    vote INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(statement_id, user_id)
  );
  ```

### 4.5 Statement Comment Thread — `supabase/schemas/15_discussion.sql`

- [x] Add `statement_id UUID REFERENCES public.statement(id) ON DELETE CASCADE` column to `thread` table (alongside existing `document_id`, `amendment_id`)
- [x] Add `CREATE INDEX idx_thread_statement ON public.thread(statement_id)` index

### 4.6 Zero Table Updates — `src/zero/statements/table.ts`

- [x] Add new columns to `statement` table definition: `group_id`, `image_url`, `video_url`, `upvotes`, `downvotes`, `comment_count`, `updated_at`
- [x] Remove `tag` column from `statement` table definition

### 4.7 Zero Common Table Updates — `src/zero/common/table.ts`

- [x] Add `statementHashtag` table definition (id, statement_id, hashtag_id, created_at)
- [x] Add `statementHashtag` relationships to schema (statement ↔ hashtag)

### 4.8 Zero Survey Tables — `src/zero/statements/table.ts`

- [x] Add `statementSurvey` table definition (id, statement_id, question, ends_at, created_at)
- [x] Add `statementSurveyOption` table definition (id, survey_id, label, vote_count, position, created_at)
- [x] Add `statementSurveyVote` table definition (id, option_id, user_id, created_at)

### 4.9 Zero Vote Table Update — `src/zero/votes/table.ts`

- [x] Add `statementSupportVote` table definition (id, statement_id, user_id, vote, created_at)

### 4.10 Zero Discussion Table Update — `src/zero/discussions/table.ts`

- [x] Add `statement_id` column to `thread` table definition

### 4.11 Zod Schema Updates — `src/zero/statements/schema.ts`

- [x] Update `selectStatementSchema` — add group_id, image_url, video_url, upvotes, downvotes, comment_count, updated_at; remove tag
- [x] Update `createStatementSchema` — add group_id (optional), image_url (optional), video_url (optional); remove tag; enforce text max 280 chars
- [x] Update `updateStatementSchema` — add group_id, image_url, video_url; remove tag
- [x] Add `createStatementSurveySchema` — { id, statement_id, question, ends_at }
- [x] Add `createStatementSurveyOptionSchema` — { id, survey_id, label, position }
- [x] Add `createStatementSurveyVoteSchema` — { id, option_id }

### 4.12 Zod Schema Updates — `src/zero/common/schema.ts`

- [x] Add `createStatementHashtagSchema` — { id, statement_id, hashtag_id }
- [x] Add `deleteStatementHashtagSchema` — { id }

### 4.13 Zod Schema Updates — `src/zero/votes/schema.ts`

- [x] Add `selectStatementSupportVoteSchema`, `createStatementSupportVoteSchema`, `updateStatementSupportVoteSchema`

### 4.14 Zero Table Registration

- [x] Register all new tables in the Zero schema definition file (where all tables are composed into the main schema)
- [x] Add relationships: statement ↔ statementHashtag ↔ hashtag, statement ↔ statementSurvey ↔ options ↔ votes, statement ↔ statementSupportVote, thread ↔ statement

---

## 5. Statement Queries & Mutators

### 5.1 Update Queries — `src/zero/statements/queries.ts`

- [x] Update `byUser()` — include statement_hashtags (with nested hashtag), surveys, support_votes, group relation
- [x] Update `byId(id)` — include user, statement_hashtags, surveys (with options + votes), support_votes, threads (with comments), group
- [x] Add `byGroup(group_id)` — statements attached to a group, include user, hashtags, survey, votes
- [x] Add `byIdWithDetails(id)` — full detail query: user, hashtags, surveys, votes, threads/comments
- [x] Add `byIdWithComments(id)` — statement + threads + comments (for comment thread)
- [x] Remove `search(tag)` query (replaced by hashtag filtering)
- [x] Add `byUserWithHashtags(user_id)` — user's statements with hashtags

### 5.2 Update Common Queries \u2014 `src/zero/common/queries.ts`\n- [x] Add `statementHashtags(statement_id)` \u2014 hashtag junctions for a statement

### 5.3 Update Mutators — `src/zero/statements/shared-mutators.ts`

- [x] Update `create` mutator — support new fields (group_id, image_url, video_url)
- [x] Update `update` mutator — support new fields; remove tag
- [x] Add `createSupportVote(args)` — upvote/downvote on statement
- [x] Add `updateSupportVote(args)` — change vote
- [x] Add `deleteSupportVote(id)` — remove vote
- [x] Add `createSurvey(args)` — create survey for statement
- [x] Add `deleteSurvey(id)` — delete survey
- [x] Add `createSurveyOption(args)` — add option to survey
- [x] Add `deleteSurveyOption(id)` — remove option
- [x] Add `createSurveyVote(args)` — vote on survey option
- [x] Add `deleteSurveyVote(id)` — retract survey vote

### 5.4 Update Common Mutators — `src/zero/common/shared-mutators.ts`

- [x] Add `linkStatementHashtag(args)` — link hashtag to statement
- [x] Add `unlinkStatementHashtag(id)` — unlink hashtag from statement

### 5.5 Update State Hook — `src/zero/statements/useStatementState.ts`

- [x] Add `groupId` option — fetches statements by group
- [x] Add `includeDetails` option — fetches full details (hashtags, surveys, votes, comments)
- [x] Add `includeComments` option
- [x] Return new fields: `statementsByGroup`, `statementWithDetails`

### 5.6 Update Actions Hook — `src/zero/statements/useStatementActions.ts`

- [x] Add `createSupportVote`, `updateSupportVote`, `deleteSupportVote` — with toasts
- [x] Add `createSurvey`, `deleteSurvey` — with toasts
- [x] Add `createSurveyOption`, `deleteSurveyOption` — silent
- [x] Add `createSurveyVote`, `deleteSurveyVote` — with toasts
- [x] Add `updateStatementSilent(args)` — for autosave-style updates (no toast)

---

## 6. Blog Schema Updates (User/Group Attachment)

Blogs already have `group_id` and `blog_blogger` for user attachment. Refine to ensure both paths work cleanly.

### 6.1 SQL Schema Updates — `supabase/schemas/07_blog.sql`

- [x] Verify `group_id` column on `blog` table has proper FK to `group(id)` — should already exist
- [x] Ensure the blog can exist with `group_id = NULL` (user-attached blog) — bloggers determine ownership
- [x] No structural changes needed if the above are already correct

### 6.2 Blog Create Flow Updates

- [x] Update `src/features/create/hooks/useCreateBlogForm.tsx`:
  - Add step for "Attach to" — user (default) or group selection using new `TypeaheadSearch` (groups only)
  - When group is selected, set `group_id` on blog creation
  - When user is selected (default), blog is attached via `blog_blogger` entry only
- [x] Update `src/features/blogs/ui/CreateBlogForm.tsx` — add group attachment selector
- [x] Update blog creation mutator call to pass `group_id` when group-attached

---

## 7. Statement Feature Layer Overhaul

### 7.1 Statement Create Flow — `features/create/` and `features/statements/`

- [x] Redesign `src/features/create/hooks/useCreateStatementForm.tsx`:
  - Step 1: Text (max 280 chars with counter) + "Attach to" selector (user/group via TypeaheadSearch)
  - Step 2: Media (optional image/video upload) + Survey builder (optional: 2–4 options, duration 5min–7days)
  - Step 3: Hashtags (via shared HashtagEditor — auto-parse from text `#tags` + manual add)
  - Step 4: Visibility + Review
- [x] Update `src/features/statements/hooks/useStatementMutations.ts`:
  - `createStatement()` — create statement + sync hashtags + create survey (if present) + create survey options + timeline event
  - Handle `group_id` attachment

### 7.2 Statement Detail Page — `features/statements/ui/`

- [x] Completely redesign `src/features/statements/ui/StatementDetail.tsx`:
  - Reddit-style layout with vote buttons (shared `VoteButtons`) on left
  - Statement text with parsed `#hashtags` (clickable → search) and `@mentions` (clickable → entity page)
  - Media display (image/video)
  - Survey display with vote bars, percentages, countdown timer, vote button
  - HashtagDisplay for associated hashtags
  - Author info card with avatar, name, handle
  - Group badge (if group-attached)
  - Share button (reuse existing `ShareButton`)
  - Edit/Delete buttons (if owner)
  - Full comment thread (shared `CommentThread` component)
- [x] Create `src/features/statements/ui/StatementCard.tsx`:
  - Compact card for list views (user profile, group page, search results, feed)
  - Shows: text preview, author, hashtags, vote counts, comment count, survey indicator, media thumbnail
  - Clickable → navigates to `/statement/$id`
- [x] Create `src/features/statements/ui/StatementSurvey.tsx`:
  - Survey display component: question, options with vote bars, vote count, percentage
  - Countdown timer (ends_at)
  - Vote button per option (if not voted + survey not expired)
  - Results view (after voting or expiry)
- [x] Create `src/features/statements/ui/StatementMediaDisplay.tsx`:
  - Image display (with lightbox on click)
  - Video player (embedded or native)

### 7.3 Statement Hooks

- [x] Create `src/features/statements/hooks/useStatementDetail.ts`:
  - Page composition hook for statement detail page
  - Composes: `useStatementState({ id, includeDetails })`, `useStatementActions()`, `useCommentThread()`, voting state, survey state
  - Returns all data and handlers for the detail page
- [x] Create `src/features/statements/hooks/useStatementSurvey.ts`:
  - Manages survey voting state
  - Computes percentages, remaining time
  - Returns `{ survey, options, userVote, vote, isExpired, percentages, timeRemaining }`

---

## 8. Blog Feature Layer Updates

### 8.1 Blog Blogger Management

- [x] Verify `src/features/blogs/ui/BlogBloggersManager.tsx` works for:
  - User-attached blogs: owner can invite collaborators via typeahead (users)
  - Group-attached blogs: bloggers = group members with "Manage Blogs" action right
- [x] Update `BlogBloggersManager` to use new `TypeaheadSearch` for inviting collaborators
- [x] Add logic: if `blog.group_id` is set, show group members with right; if null, show invite UI

### 8.2 Blog Editor Integration

- [x] Ensure `src/features/editor/` unified editor works for blog editing with:
  - Autosave (via existing `useAutoSave` hook)
  - Shared editing (via existing presence system)
  - Mentions of users, groups, amendments, events (via existing `@platejs/mention`)
  - Version control
- [x] Verify blog editor route `group/$id/editor/$docId` can handle blog editing (or add route)
- [x] Add route `src/routes/_authed/user/$id/editor/$blogId.tsx` for user-attached blog editing
- [x] Add route `src/routes/_authed/group/$id/editor/$blogId.tsx` for group-attached blog editing (if not already covered by existing `$docId` route)

### 8.3 Blog Autosave

- [x] Ensure the editor's `useAutoSave` is wired to `blogActions.updateBlogSilent()` when editing a blog entity
- [x] Verify debounce timing feels like "autosave" (500ms debounce, 1000ms throttle — already set)

### 8.4 Blog UI Revision

- [x] Redesign `BlogDetail.tsx` to align with amendment wiki pattern:
  - Use `InfoTabs` component for tabbed layout (Overview, Comments, Bloggers, Timeline)
  - HashtagDisplay with proper gradients
  - Shared VoteButtons component
  - Shared CommentThread component
  - ShareButton
  - SubscribeButton
- [x] Update `BlogEdit.tsx` to use shared `HashtagEditor` from new location
- [x] Ensure blog content uses `PlateEditor` in view mode with all rich features (mentions, code blocks, etc.)

---

## 9. Group Blogs & Statements Page

### 9.1 Route Setup

- [x] Create `src/routes/_authed/group/$id/blogs-and-statements.tsx` — new route for combined blogs & statements page

### 9.2 Navigation

- [x] Add "Blogs & Statements" item to group secondary navigation in `src/features/navigation/nav-items/nav-items-authenticated.tsx`:
  - Icon: `BookOpen` or `MessageSquareText` (or similar)
  - Path: `/group/:id/blogs-and-statements`
  - Visible to all (public content)
- [x] Remove or redirect the old `/group/:id/blog` route to `/group/:id/blogs-and-statements`

### 9.3 Page Composition Hook

- [x] Create `src/features/groups/hooks/useGroupBlogsAndStatementsPage.ts`:
  - Fetches group blogs via `useBlogState({ groupId })` with hashtags
  - Fetches group statements via `useStatementState({ groupId })` with hashtags
  - Manages filter state: content type (blog/statement/all), search query, sort order
  - Checks permissions: can user manage blogs? (`usePermissions` with "Manage Blogs" action right)
  - Returns: `{ blogs, statements, filter, setFilter, searchQuery, setSearchQuery, canManageBlogs, isLoading }`

### 9.4 Page UI

- [x] Create `src/features/groups/ui/GroupBlogsAndStatementsPage.tsx`:
  - Search bar (reuse existing search bar pattern)
  - Filter tabs: All | Blogs | Statements
  - Blog cards and statement cards in a list/grid
  - Management actions (edit, delete) visible for users with "Manage Blogs" right
  - Create blog / Create statement buttons (if member)
- [x] Create `src/features/groups/ui/GroupBlogCard.tsx` — compact blog card for list view (title, description, author, hashtags, date, comment count)
- [x] Reuse `StatementCard` from statements feature for statement list items

---

## 10. User Profile Blog & Statement Integration

### 10.1 User Blog Tab

- [x] Update `src/routes/_authed/user/$id/blog.tsx` — rename or expand to show both blogs and statements
- [x] Show user-attached blogs with management actions (edit, delete) if viewing own profile
- [x] "Edit" button navigates to `/user/$id/editor/$blogId`
- [x] "View" button navigates to `/user/$id/blog/$blogId`
- [x] Add create blog button on own profile

### 10.2 User Statement Display

- [x] Ensure user profile shows statements by the user (may already exist in wiki/timeline)
- [x] Add statement creation shortcut on user profile page
- [x] Show accepted collaborator blogs (blogs user was invited to and accepted) in the blog tab

### 10.3 Blog Editor Route for Users

- [x] Ensure `src/routes/_authed/user/$id/editor/$docId.tsx` properly handles blog entities (check entity adapter in editor)
- [x] Verify the unified editor's entity adapter recognizes blogs and configures capabilities correctly (autosave, presence, mentions, version control)

### 10.4 Blog View Route for Users

- [x] Ensure `src/routes/_authed/user/$id/blog/$entryId.tsx` renders `BlogDetail` with full features

---

## 11. Editor System Unification

Ensure amendments, group documents, and blogs all use the same editor codebase.

### 11.1 Entity Adapter Updates

- [x] Verify `src/features/editor/logic/entity-adapter.ts` properly adapts blog entities:
  - Autosave capability: enabled
  - Shared editing capability: enabled
  - Presence capability: enabled
  - Mentions capability: enabled (users, groups, amendments, events)
  - Version control capability: enabled
  - Public access toggle: enabled

### 11.2 Mention System for Editor

- [x] Extend the existing `@platejs/mention` integration to support mentioning:
  - Users (already supported)
  - Groups (add: search groups, render group mention node)
  - Amendments (add: search amendments, render amendment mention node)
  - Events (add: search events, render event mention node)
- [x] Wire mention search to use the new shared `TypeaheadSearch` data hooks
- [x] Update mention node rendering (`mention-node.tsx`) to link to correct entity page based on mention type

### 11.3 Autosave Integration

- [x] Ensure `useAutoSave` from `features/documents/hooks/` is used (or extracted to `features/shared/hooks/useAutoSave.ts`) so blogs and documents both use it
- [x] Move `useAutoSave.ts` to `src/features/shared/hooks/useAutoSave.ts` if currently document-specific, or keep in documents and import from there
- [x] Verify blog editor calls `blogActions.updateBlogSilent()` through the autosave mechanism

---

## 12. Search & Hashtag Integration

### 12.1 Statement Search Card

- [x] Update `src/features/search/ui/StatementSearchCard.tsx`:
  - Show hashtags (via `HashtagDisplay`) instead of plain `tag` field
  - Show vote counts, comment count, survey indicator
  - Show media thumbnail if present
  - Use entity gradient coloring

### 12.2 Blog Search Card

- [x] Verify `src/features/search/ui/BlogSearchCard.tsx` shows hashtags properly

### 12.3 Search Data Hook

- [x] Update `src/features/search/hooks/useSearchData.ts` to fetch statement hashtags in search results
- [x] Update search mappers in `src/features/search/logic/searchMappers.ts` to include hashtag data for statements

### 12.4 Hashtag Search Page

- [x] Ensure `/search?hashtag=<tag>` works for statements (currently works for blogs, users, groups, amendments, events)
- [x] Add statement results to hashtag search

---

## 13. Mention Feature in Statements

### 13.1 Text Parsing

- [x] Create `src/features/shared/logic/mentionHelpers.ts`:
  - `parseMentions(text)` — extract `@username` patterns from statement text
  - `parseHashtags(text)` — extract `#hashtag` patterns from statement text
  - `renderTextWithMentionsAndHashtags(text, mentions, hashtags)` — returns React nodes with clickable links

### 13.2 Statement Text Rendering

- [x] Create `src/features/statements/ui/StatementTextRenderer.tsx`:
  - Renders statement text with clickable `@mentions` and `#hashtags`
  - `@user` → link to `/user/$id`
  - `@group` → link to `/group/$id`
  - `#tag` → link to `/search?hashtag=tag`

### 13.3 Mention Autocomplete in Statement Create

- [x] In statement create form, add mention autocomplete when typing `@`:
  - Use shared `TypeaheadSearch` filtered to relevant entity types
  - Insert mention text into the statement text

---

## 14. i18n Updates

- [x] Add translation keys for all new UI text:
  - Statement: "characters remaining", "add survey", "survey question", "survey options", "survey duration", "vote", "votes", "expired", "ends in"
  - Blog: "attach to user", "attach to group", "manage bloggers", "autosaved", "invite collaborator"
  - Group: "Blogs & Statements", filter labels
  - Shared: typeahead labels, comment thread labels, vote labels
- [x] Update English translation file(s) with new keys
- [x] Update German translation file(s) with new keys (if exists)

---

## 15. Clean Up & Migration

### 15.1 Remove Deprecated Code

- [x] Remove old `tag` field references from statement-related code (forms, display, search)
- [x] Remove old standalone blog routes if replaced (e.g., `/create/blog-entry` may need updating)
- [x] Clean up any unused imports after refactoring

### 15.2 Data Migration

- [x] Create Supabase migration file for all schema changes:
  - Statement table column additions/removals
  - Statement hashtag junction table
  - Statement survey tables
  - Statement support vote table
  - Thread table statement_id column
- [x] Create data migration to convert existing `statement.tag` values to `statement_hashtag` entries:
  - For each statement with a non-null tag, create a canonical `hashtag` entry (if not exists) and a `statement_hashtag` junction
- [x] After migration verified, drop `tag` column

### 15.3 Type Updates

- [x] Update all TypeScript types referencing the old statement shape
- [x] Update all TypeScript types referencing old blog standalone patterns

---

## Summary

| Phase                            | Tasks | Status      | Parallelizable                      |
| -------------------------------- | ----- | ----------- | ----------------------------------- |
| 1. Shared Typeahead              | 14    | Not Started | Yes (logic, hooks, UI can parallel) |
| 2. Shared Hashtags               | 7     | Not Started | Yes (after phase 1)                 |
| 3. Shared Comments/Voting        | 10    | Not Started | Yes (after phase 1)                 |
| 4. Statement Schema              | 25    | Not Started | Parallel across SQL/Zero/Zod        |
| 5. Statement Queries/Mutators    | 16    | Not Started | After phase 4                       |
| 6. Blog Schema Updates           | 4     | Not Started | Parallel with phase 4               |
| 7. Statement Feature Layer       | 12    | Not Started | After phases 4-5                    |
| 8. Blog Feature Layer            | 10    | Not Started | After phases 1-3, 6                 |
| 9. Group Blogs & Statements      | 6     | Not Started | After phases 7-8                    |
| 10. User Profile Integration     | 6     | Not Started | After phases 7-8                    |
| 11. Editor Unification           | 6     | Not Started | Parallel with phases 8-10           |
| 12. Search & Hashtag Integration | 5     | Not Started | After phases 4-5                    |
| 13. Mention Feature              | 4     | Not Started | Parallel with phase 7               |
| 14. i18n Updates                 | 3     | Not Started | After all feature work              |
| 15. Clean Up & Migration         | 6     | Not Started | Final phase                         |

---

## Execution Order (Recommended)

**Wave 1 — Foundations (parallelizable):**

- Phase 1: Shared Typeahead
- Phase 4: Statement Schema (SQL + Zero + Zod)
- Phase 6: Blog Schema verification

**Wave 2 — Shared Components (parallelizable):**

- Phase 2: Shared Hashtags (depends on typeahead for search within hashtag editor)
- Phase 3: Shared Comments/Voting

**Wave 3 — Data Layer (sequential):**

- Phase 5: Statement Queries & Mutators (depends on phase 4)

**Wave 4 — Feature Implementation (parallelizable):**

- Phase 7: Statement Feature Layer
- Phase 8: Blog Feature Layer
- Phase 11: Editor Unification
- Phase 13: Mention Feature in Statements

**Wave 5 — Integration (parallelizable):**

- Phase 9: Group Blogs & Statements Page
- Phase 10: User Profile Integration
- Phase 12: Search & Hashtag Integration

**Wave 6 — Polish:**

- Phase 14: i18n
- Phase 15: Clean Up & Migration

---

## Notes

- The existing `useAutoSave` hook is already production-ready with debounce (500ms) + throttle (1000ms) + queuing. Reuse as-is.
- The existing `TypeAheadSelect` in `src/features/shared/ui/ui/type-ahead-select.tsx` is a good low-level primitive. The new `TypeaheadSearch` should compose it or replace it with a more feature-rich version.
- All voting follows the pattern: denormalized counts on the entity + individual vote tracking table. Keep this pattern for statements.
- The editor already has mention support via `@platejs/mention`. Extend the mention data source rather than building from scratch.
- The hashtag system is mature (5 entity types supported). Adding statement support follows the exact same junction table pattern.
- Blog already supports group attachment via `group_id` and user attachment via `blog_blogger`. The main work is in the create flow UX and permission checks.
- Statement `tag` → hashtag migration requires a data migration script to preserve existing tags as hashtags.
- Survey feature is entirely new — no existing tables or code to build on. Design from scratch following existing patterns.
- Action right "Manage Blogs" must be verifiable in the RBAC constants (`src/zero/rbac/constants.ts`). If it doesn't exist, add it.
