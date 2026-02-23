# Hashtag Feature Implementation Tasks

This document tracks all tasks needed to implement a full hashtag feature across users,
groups, amendments, events, and blogs — covering database schema, data layer (Zero), reusable
UI components, entity edit pages, and hashtag-based search.

**Parallel Execution Note:** Phases 2–6 are largely independent and can be worked on
simultaneously by multiple agents. Phase 1 (schema) unblocks Phase 2 (Zero data layer) which
in turn unblocks Phases 3–6.

---

**Progress Overview:**
- Total Tasks: 51
- Completed: 0
- Remaining: 51

---

## 1. Database Schema (`supabase/schemas/21_common.sql`)

Current state: `hashtag` table exists but uses a **denormalized** design — each row belongs to
exactly one entity via nullable FK columns (`user_id`, `group_id`, `amendment_id`, `event_id`,
`blog_id`). The user requested a proper **many-to-many** mapping design.

Migration plan: slim down `hashtag` to a canonical tags dictionary, and introduce per-entity
junction tables.

### 1.1 Restructure hashtag table to canonical tag dictionary

- [ ] In `supabase/schemas/21_common.sql`, replace the current `hashtag` table definition with a
  slim canonical version:
  ```sql
  CREATE TABLE IF NOT EXISTS public.hashtag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE UNIQUE INDEX idx_hashtag_tag ON public.hashtag (tag);
  ALTER TABLE public.hashtag ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "service_role_all" ON public.hashtag FOR ALL TO service_role USING (true);
  ```
  Remove the columns: `category`, `color`, `bg_color`, `icon`, `description`, `post_count`,
  `amendment_id`, `event_id`, `group_id`, `user_id`, `blog_id`.

### 1.2 Add per-entity junction tables

- [ ] Add `user_hashtag` junction table (after `hashtag` table):
  ```sql
  CREATE TABLE IF NOT EXISTS public.user_hashtag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, hashtag_id)
  );
  CREATE INDEX idx_user_hashtag_user ON public.user_hashtag (user_id);
  CREATE INDEX idx_user_hashtag_hashtag ON public.user_hashtag (hashtag_id);
  ALTER TABLE public.user_hashtag ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "service_role_all" ON public.user_hashtag FOR ALL TO service_role USING (true);
  ```

- [ ] Add `group_hashtag` junction table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.group_hashtag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public."group" (id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (group_id, hashtag_id)
  );
  CREATE INDEX idx_group_hashtag_group ON public.group_hashtag (group_id);
  CREATE INDEX idx_group_hashtag_hashtag ON public.group_hashtag (hashtag_id);
  ALTER TABLE public.group_hashtag ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "service_role_all" ON public.group_hashtag FOR ALL TO service_role USING (true);
  ```

- [ ] Add `amendment_hashtag` junction table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.amendment_hashtag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (amendment_id, hashtag_id)
  );
  CREATE INDEX idx_amendment_hashtag_amendment ON public.amendment_hashtag (amendment_id);
  CREATE INDEX idx_amendment_hashtag_hashtag ON public.amendment_hashtag (hashtag_id);
  ALTER TABLE public.amendment_hashtag ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "service_role_all" ON public.amendment_hashtag FOR ALL TO service_role USING (true);
  ```

- [ ] Add `event_hashtag` junction table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.event_hashtag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, hashtag_id)
  );
  CREATE INDEX idx_event_hashtag_event ON public.event_hashtag (event_id);
  CREATE INDEX idx_event_hashtag_hashtag ON public.event_hashtag (hashtag_id);
  ALTER TABLE public.event_hashtag ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "service_role_all" ON public.event_hashtag FOR ALL TO service_role USING (true);
  ```

- [ ] Add `blog_hashtag` junction table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.blog_hashtag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL REFERENCES public.blog (id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (blog_id, hashtag_id)
  );
  CREATE INDEX idx_blog_hashtag_blog ON public.blog_hashtag (blog_id);
  CREATE INDEX idx_blog_hashtag_hashtag ON public.blog_hashtag (hashtag_id);
  ALTER TABLE public.blog_hashtag ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "service_role_all" ON public.blog_hashtag FOR ALL TO service_role USING (true);
  ```

---

## 2. Zero Data Layer Sync (`src/zero/common/`)

All changes keep Zero table definitions, relationships, mutators, queries, and Zod schemas in
sync with the new Supabase schema.

### 2.1 Update Zero table definitions (`src/zero/common/table.ts`)

- [ ] Replace the existing `hashtag` table definition with the slim canonical version:
  ```ts
  export const hashtag = table('hashtag')
    .columns({
      id: string(),
      tag: string(),
      created_at: number(),
    })
    .primaryKey('id')
  ```

- [ ] Add junction table definitions for each entity:
  ```ts
  export const userHashtag = table('user_hashtag')
    .columns({ id: string(), user_id: string(), hashtag_id: string(), created_at: number() })
    .primaryKey('id')

  export const groupHashtag = table('group_hashtag')
    .columns({ id: string(), group_id: string(), hashtag_id: string(), created_at: number() })
    .primaryKey('id')

  export const amendmentHashtag = table('amendment_hashtag')
    .columns({ id: string(), amendment_id: string(), hashtag_id: string(), created_at: number() })
    .primaryKey('id')

  export const eventHashtag = table('event_hashtag')
    .columns({ id: string(), event_id: string(), hashtag_id: string(), created_at: number() })
    .primaryKey('id')

  export const blogHashtag = table('blog_hashtag')
    .columns({ id: string(), blog_id: string(), hashtag_id: string(), created_at: number() })
    .primaryKey('id')
  ```

### 2.2 Register new tables in the main schema (`src/zero/schema.ts`)

- [ ] Import `userHashtag`, `groupHashtag`, `amendmentHashtag`, `eventHashtag`, `blogHashtag`
  from `./common/table` in `src/zero/schema.ts`.
- [ ] Add all five junction tables to the `createSchema({ tables: [...] })` array.
- [ ] Export row types for all five junction tables:
  `UserHashtag`, `GroupHashtag`, `AmendmentHashtag`, `EventHashtag`, `BlogHashtag`.

### 2.3 Update relationships (`src/zero/relationships.ts`)

- [ ] Import the five new junction tables at the top of the file.
- [ ] Add `hashtagRelationships` — from `hashtag` to all five junction tables:
  ```ts
  export const hashtagRelationships = relationships(hashtag, ({ many }) => ({
    user_hashtags: many({ sourceField: ['id'], destSchema: userHashtag, destField: ['hashtag_id'] }),
    group_hashtags: many({ sourceField: ['id'], destSchema: groupHashtag, destField: ['hashtag_id'] }),
    amendment_hashtags: many({ ... }),
    event_hashtags: many({ ... }),
    blog_hashtags: many({ ... }),
  }))
  ```
- [ ] Add junction → parent entity relationships (e.g., `userHashtagRelationships`):
  Each junction table needs `one` relationships back to both the entity and the hashtag:
  ```ts
  export const userHashtagRelationships = relationships(userHashtag, ({ one }) => ({
    user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
    hashtag: one({ sourceField: ['hashtag_id'], destSchema: hashtag, destField: ['id'] }),
  }))
  // ... repeat for group, amendment, event, blog
  ```
- [ ] Update entity relationships to go **through** junction tables instead of directly to
  `hashtag`. Replace each existing `hashtags: many({ ... destSchema: hashtag, destField: ['user_id'] })`
  with the junction-based pattern:
  - `userRelationships`: replace `hashtags` → `user_hashtags` pointing to `userHashtag`
  - `groupRelationships`: replace `hashtags` → `group_hashtags` pointing to `groupHashtag`
  - `amendmentRelationships`: replace `hashtags` → `amendment_hashtags` pointing to `amendmentHashtag`
  - `eventRelationships`: replace `hashtags` → `event_hashtags` pointing to `eventHashtag`
  - `blogRelationships`: replace `hashtags` → `blog_hashtags` pointing to `blogHashtag`
- [ ] Register all new relationship objects in the `allRelationships` export at the bottom of
  `relationships.ts`.

### 2.4 Update Zod schemas (`src/zero/common/schema.ts`)

- [ ] Replace the `baseHashtagSchema` with the slim canonical definition:
  ```ts
  const baseHashtagSchema = z.object({
    id: z.string(),
    tag: z.string(),
    created_at: timestampSchema,
  })
  ```
  Remove fields: `category`, `color`, `bg_color`, `icon`, `description`, `post_count`,
  `amendment_id`, `event_id`, `group_id`, `user_id`, `blog_id`.

- [ ] Add junction Zod schemas for `createHashtagSchema` (still keeps `id` + `tag`), and
  add five new junction schemas:
  ```ts
  export const createUserHashtagSchema = z.object({ id: z.string(), user_id: z.string(), hashtag_id: z.string() })
  export const createGroupHashtagSchema = z.object({ id: z.string(), group_id: z.string(), hashtag_id: z.string() })
  export const createAmendmentHashtagSchema = z.object({ id: z.string(), amendment_id: z.string(), hashtag_id: z.string() })
  export const createEventHashtagSchema = z.object({ id: z.string(), event_id: z.string(), hashtag_id: z.string() })
  export const createBlogHashtagSchema = z.object({ id: z.string(), blog_id: z.string(), hashtag_id: z.string() })
  export const deleteJunctionHashtagSchema = z.object({ id: z.string() })
  ```
- [ ] Export inferred types for all new junction records.

### 2.5 Update mutators (`src/zero/common/mutators.ts`)

- [ ] Update `addHashtag` mutator to only insert into the slim `hashtag` table (no entity FKs).
- [ ] Add five new `link{Entity}Hashtag` mutators for the junction tables:
  ```ts
  linkUserHashtag: defineMutator(createUserHashtagSchema, async ({ tx, args }) => {
    const now = Date.now()
    await tx.mutate.user_hashtag.insert({ ...args, created_at: now })
  }),
  // ... repeat for group, amendment, event, blog
  ```
- [ ] Add five new `unlink{Entity}Hashtag` mutators:
  ```ts
  unlinkUserHashtag: defineMutator(deleteJunctionHashtagSchema, async ({ tx, args }) => {
    await tx.mutate.user_hashtag.delete({ id: args.id })
  }),
  // ... repeat for group, amendment, event, blog
  ```

### 2.6 Update queries (`src/zero/common/queries.ts`)

- [ ] Add a new `allHashtags` query for typeahead autocomplete — returns all hashtag rows
  ordered by tag text:
  ```ts
  allHashtags: defineQuery(z.object({}), () =>
    zql.hashtag.orderBy('tag', 'asc')
  ),
  ```
- [ ] Add per-entity hashtag queries that go through junction tables and eager-load the canonical
  `hashtag` (for display). For example:
  ```ts
  hashtagsForUser: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.user_hashtag
        .where('user_id', user_id)
        .related('hashtag')
        .orderBy('created_at', 'desc')
  ),
  // ... repeat for group, amendment, event, blog
  ```
- [ ] Update the legacy `hashtags` query to use the new structure or deprecate it in favour of
  the five focused queries above.
- [ ] Update all queries in `src/zero/shared/queries.ts` that use `.related('hashtags')` on
  entities (users, groups, amendments, events, blogs) to instead use the junction-based
  navigation (`.related('user_hashtags', q => q.related('hashtag'))`).

### 2.7 Update `useCommonState.ts`

- [ ] Add `allHashtags` query support (passed-through via a new `includeAll` option or always
  loaded as a singleton query for typeahead):
  ```ts
  const [allHashtags] = useQuery(queries.common.allHashtags({}))
  ```
- [ ] Add per-entity focused queries using the new junction-based query definitions.
- [ ] Return `allHashtags` from the hook for use in typeahead components.

### 2.8 Update `useCommonActions.ts`

- [ ] Add action methods for the five `link{Entity}Hashtag` and `unlink{Entity}Hashtag`
  mutators, each wrapping a try/catch with toast feedback.
- [ ] Add a reusable `syncEntityHashtags(entityType, entityId, existingJunctionRows, desiredTags)`
  helper method that:
  1. Inserts canonical `hashtag` rows for any new tags (idempotent — skip if text already exists).
  2. Resolves `hashtag_id` for each desired tag.
  3. Removes junction rows for tags no longer desired.
  4. Inserts junction rows for newly desired tags.

### 2.9 Update `index.ts` barrel

- [ ] Re-export all new junction types and updated schemas from `src/zero/common/index.ts`.

---

## 3. Reusable UI Component Enhancements (`src/components/ui/`)

### 3.1 Enhance `HashtagInput` with typeahead

File: `src/components/ui/hashtag-input.tsx`

- [ ] Add a `suggestions` prop (type: `Array<{ id: string; tag: string }>`).
  When the input has ≥1 character, filter suggestions by prefix and show a popover dropdown.
- [ ] Show the dropdown using a `Popover`+`Command` (shadcn) or a simple
  `position: absolute` list styled like `type-ahead-select.tsx`. Keyboard-accessible
  (arrow keys navigate, Enter selects, Escape closes).
- [ ] Enforce `#` prefix:  
  - If the user types without a leading `#`, prepend it automatically on display.  
  - Strip `#` before storing in the `value` array (consistent with current behaviour).
- [ ] When a suggestion is clicked, add the tag immediately (same as pressing Enter).
- [ ] Do not suggest tags already in `value`.
- [ ] Close the dropdown on outside-click using a `useRef`/`useEffect` pattern.
- [ ] Keep the existing badge-list rendering (`value.map(tag => <span>#{tag} <X /></span>)`).

### 3.2 Create a connected `HashtagEditor` component

File: `src/components/ui/hashtag-editor.tsx` *(new file)*

A thin wrapper that:
- Fetches `allHashtags` from `useCommonState` and passes them as `suggestions` to `HashtagInput`.
- Keeps the `value` prop as `string[]` (tag texts without `#`).
- Exposes the same `onChange: (tags: string[]) => void` interface.
- This is the component imported by entity edit forms — they call it and pass local state.

### 3.3 Update `HashtagsSection`

File: `src/features/users/ui/HashtagsSection.tsx`

- [ ] Replace `<HashtagInput>` import with `<HashtagEditor>` (which adds typeahead).
- [ ] Pass `value` and `onChange` as before — no other changes needed in `HashtagsSection` itself.

---

## 4. User Edit Page

### 4.1 Fix hashtag initialization (`src/features/users/hooks/useUserProfileForm.ts`)

Currently `hashtags: []` is hardcoded; existing user hashtags are never loaded into the form.

- [ ] Accept `existingHashtags: Array<{ id: string; tag: string }>` as a parameter (or derive
  it inside the hook using `useCommonState({ user_id: userId })`).
- [ ] Initialize `formData.hashtags` from `existingHashtags.map(h => h.tag)` when the user data
  first loads.
- [ ] Track a `pendingHashtagOps` ref of `{ toAdd: string[], toRemove: string[] }` so the diff
  can be applied on submit.

### 4.2 Fix hashtag save logic (`src/features/users/hooks/useUserMutations.ts`)

- [ ] In `updateCompleteProfile`, replace the current "add all new tags" loop with a proper diff
  call to `useCommonActions.syncEntityHashtags('user', userId, existingHashtags, newTags)`.
- [ ] Remove the stale `addHashtags` helper (it didn't delete removed tags).

### 4.3 Update `UserProfileEditForm` to pass existing hashtags

File: `src/features/users/ui/UserProfileEditForm.tsx`

- [ ] Pass `existingHashtags` down from the page hook through `UserProfileEditForm` to
  `HashtagsSection` if the editor needs to know the pre-existing DB records for the diff.

---

## 5. Group Edit Page

### 5.1 Add hashtag support to `useGroupUpdate` hook

File: `src/features/groups/hooks/useGroupUpdate.ts`

- [ ] Add `hashtags: string[]` to `GroupFormData`.
- [ ] Accept and initialize from `initialData.hashtags` (tag strings derived from Zero data).
- [ ] On `handleSubmit`, call `syncEntityHashtags('group', groupId, existingHashtags, formData.hashtags)`.

### 5.2 Add `HashtagsSection` to `GroupEditForm`

File: `src/features/groups/ui/GroupEditForm.tsx`

- [ ] Import `HashtagsSection` from `src/features/users/ui/HashtagsSection`.
- [ ] Add it to the form after the `SocialMediaSection` block.
- [ ] Pass `formData.hashtags` as `hashtags` and `value => updateField('hashtags', value)` as
  `onHashtagsChange`.

### 5.3 Pass existing group hashtags into `GroupEdit`

File: `src/features/groups/ui/GroupEdit.tsx`

- [ ] In `GroupEdit`, use `useCommonState({ group_id: groupId })` to load `hashtags`.
- [ ] Pass `hashtags.map(h => h.tag)` as initial data into `GroupEditForm` / `useGroupUpdate`.

---

## 6. Amendment Edit Page

### 6.1 Add hashtag diff logic

File: `src/features/amendments/logic/amendmentHashtagDiff.ts` *(new file)*

- [ ] Create `computeAmendmentHashtagDiff(existingHashtags, desiredTags, amendmentId)` —
  same pattern as `blogHashtagDiff.ts`. Returns `{ hashtagsToRemove, hashtagsToAdd }`.

### 6.2 Add `syncAmendmentHashtags` to `useAmendmentActions`

File: `src/zero/amendments/useAmendmentActions.ts`

- [ ] Add a `syncAmendmentHashtags` callback that calls
  `useCommonActions.syncEntityHashtags('amendment', ...)`.

### 6.3 Add `HashtagsSection` to `AmendmentEditContent`

File: `src/features/amendments/ui/AmendmentEditContent.tsx`

- [ ] Add `hashtags: string[]` to the local `formData` state, initialized from
  `amendment.hashtags?.map(h => h.tag)` when the amendment loads.
- [ ] Add `<HashtagsSection>` card below the existing form fields.
- [ ] On submit, call `syncAmendmentHashtags` with the diff.

---

## 7. Blog Edit Page

The blog edit already uses `syncBlogHashtags` for persistence, but the UI still uses a plain
text input rather than the new `HashtagEditor` component.

### 7.1 Replace plain tag input in `BlogEdit` with `HashtagsSection`

File: `src/features/blogs/ui/BlogEdit.tsx`

- [ ] Remove the manual Tag card (the `<Input value={tagInput}…>` + `<Button>Add</Button>` block).
- [ ] Import and render `<HashtagsSection hashtags={formData.tags} onHashtagsChange={value => updateField('tags', value)} />`.
- [ ] Remove `tagInput`, `setTagInput`, `handleAddTag`, `handleRemoveTag` from the destructured
  hook return in `BlogEdit` (they are no longer needed in the view).

### 7.2 Update `useBlogEditPage` tags initialization

File: `src/features/blogs/hooks/useBlogEditPage.ts`

- [ ] Verify that `formData.tags` is initialized from `blog.hashtags?.map(ht => ht.tag)`. (Done)
- [ ] Verify that `syncBlogHashtags` uses the M2M-aware `computeHashtagDiff`. Update the helper
  once the schema migration (Phase 1–2) is done to reference `blog_hashtag` junction rows.

---

## 8. Event Edit Page

Currently events have a plain tag input that is **not** persisted to the `hashtag` table — only
stored in local form state which is then discarded.

### 8.1 Add hashtag sync logic to `useEventMutations`

File: `src/features/events/hooks/useEventMutations.ts`

- [ ] Add a `syncEventHashtags` callback that delegates to
  `useCommonActions.syncEntityHashtags('event', eventId, ...)`.

### 8.2 Update `useEventUpdate` to load and persist hashtags

File: `src/features/events/hooks/useEventUpdate.ts`

- [ ] Use `useCommonState({ event_id: eventId })` to read `hashtags` from Zero.
- [ ] Initialize `formData.tags` from `hashtags?.map(h => h.tag)` (once on load).
- [ ] On `handleSubmit`, call `syncEventHashtags` with the diff between initial and current tags.
- [ ] Remove the orphaned `tagInput`/`handleAddTag`/`handleRemoveTag` helpers from the return
  value once replaced.

### 8.3 Replace plain tag input in `EventEdit` with `HashtagsSection`

File: `src/features/events/ui/EventEdit.tsx`

- [ ] Remove the manual Tags card (the `<Input value={tagInput}…>` + `<Button>Add</Button>` block).
- [ ] Import and render `<HashtagsSection hashtags={formData.tags} onHashtagsChange={value => updateField('tags', value)} />`.

---

## 9. Search Page — Hashtag Filter Support

### 9.1 Fix URL parsing in `useSearchURL`

File: `src/features/search/hooks/useSearchURL.ts`

- [ ] Read `searchParams.hashtag` (single tag string, e.g. `politics`) from the URL.
- [ ] When `hashtag` param is present, pre-populate `topics` state with `['#' + hashtagParam]` or
  just `[hashtagParam]` (matching the format used by `matchesHashtag`).
- [ ] When `topics` changes and contains hashtag entries, write them back to `topics=` param
  (preserve existing implementation) so round-trip navigation works.

### 9.2 Update `SearchHeader` to show hashtag chip

File: `src/features/search/ui/SearchHeader.tsx`

- [ ] When the `hashtag` URL param is active and not reflected in `activeTopics`, display a
  dedicated `#hashtag` chip in the active filters area so the user can clear it.
- [ ] Alternatively, ensure the existing `activeTopics` chip rendering already covers it once
  Step 9.1 maps `hashtag → topics`.

### 9.3 Verify hashtag filtering in `useSearchFilters`

File: `src/features/search/hooks/useSearchFilters.ts`

- [ ] Confirm that `matchesHashtag` (`src/features/search/utils/searchUtils.ts`) works with the
  M2M junction data shape. After the Phase 2 migration, each entity's `.hashtags` relationship
  navigates through junction rows to the canonical `hashtag` with a `.tag` field.
  Adjust `matchesHashtag` to handle the new data shape:
  ```ts
  // New junction shape: item.user_hashtags = [{ hashtag: { tag: 'politics' } }]
  // Old shape: item.hashtags = [{ tag: 'politics' }]
  ```
  Update all five entity-type occurrences in `useSearchFilters` accordingly.

### 9.4 Add `allHashtags` query to shared search state

File: `src/zero/shared/useSearchState.ts`

- [ ] Add a call to `queries.common.allHashtags({})` so the full hashtag list is synced locally
  on the search page (used by `HashtagEditor` typeahead suggestions).

---

## 10. Cross-Cutting: Migrate existing code after schema change

These tasks are clean-up / migration tasks triggered by the M2M schema change (Phases 1–2).

### 10.1 Update `blogHashtagDiff.ts`

File: `src/features/blogs/logic/blogHashtagDiff.ts`

- [ ] Update the `Hashtag` interface to `{ id: string; hashtag: { tag: string } }` (junction row
  shape) and update `computeHashtagDiff` accordingly.
- [ ] Update `hashtagsToAdd` to generate junction rows (`blog_hashtag`) + ensure the canonical
  `hashtag` row exists first.

### 10.2 Remove M2M pre-migration nullable fields from Zod schemas

File: `src/zero/common/schema.ts`

- [ ] Confirm all nullable FK fields (`user_id`, `group_id`, etc.) have been removed from
  `createHashtagSchema` / `selectHashtagSchema` after the new `hashtag` table is deployed.

### 10.3 Update `HashtagDisplay` for new data shape

File: `src/components/ui/hashtag-display.tsx`

- [ ] Update the prop type from `hashtags: { id: string; tag: string }[]` to accept the junction
  row shape OR keep it flat by extracting tag texts before passing to the component. Choose the
  simpler option that avoids prop drilling complexity.
- [ ] Verify that all existing callers of `HashtagDisplay` still pass data in the expected shape
  after the data layer changes (especially on user profiles, group pages, search cards).

---

## Summary

| Phase | Area | Tasks | Notes |
|-------|------|-------|-------|
| 1 | Supabase Schema | 6 | M2M migration; prerequisite for all |
| 2 | Zero Data Layer | 9 | Sync with DB; prerequisite for edit pages |
| 3 | Reusable UI Component | 3 | `HashtagEditor` + typeahead `HashtagInput` |
| 4 | User Edit Page | 3 | Fix existing (partial) implementation |
| 5 | Group Edit Page | 3 | New feature |
| 6 | Amendment Edit Page | 3 | New feature |
| 7 | Blog Edit Page | 2 | Upgrade existing plain-input to new component |
| 8 | Event Edit Page | 3 | Persist tags + upgrade UI |
| 9 | Search Page | 4 | Fix hashtag URL param + search filter data shape |
| 10 | Cross-Cutting Cleanup | 3 | Post-migration fixes |

---

## Architecture Notes

- **Existing denormalized schema**: The current `hashtag` table in `21_common.sql` stores one row
  per entity-tag pair. It works and is in production. The M2M migration (Phase 1) is ne  but should be done as a single atomic DB migration.
- **Typeahead data source**: `queries.common.allHashtags({})` queries the slim canonical
  `hashtag` table. At runtime Zero syncs this table locally so all autocomplete suggestions are
  instant (no network round trip).
- **Tag uniqueness**: When a user adds a new tag text that has never been used before, the mutator
  first inserts a `hashtag` row (idempotent via `UNIQUE` constraint on `tag`), then inserts the
  junction row. Use `tx.mutate.hashtag.upsert(...)` if Zero supports it, otherwise query first.
- **`HashtagDisplay` vs `HashtagEditor`**: `HashtagDisplay` is read-only (profile views, search
  cards). `HashtagEditor` is write-enabled (edit pages only). Keep them separate.
- **No cross-domain zero imports**: All hashtag mutations go through `useCommonActions` — no
  individual feature hooks should import from another domain's zero module.
