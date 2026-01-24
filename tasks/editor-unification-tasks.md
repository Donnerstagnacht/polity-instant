# Editor Unification - Refactoring Task Plan

This document tracks all tasks needed to unify the three separate editor implementations (Blog, Amendment, and Standalone Document editors) into a single shared codebase.

**Progress Overview:**

- Total Tasks: 58
- Completed: 58
- Remaining: 0

**Last Updated:** ALL TASKS COMPLETE - Optional enhancements implemented, legacy files can be removed

---

## Executive Summary

### Current State Analysis

The codebase now has a **unified editor system** in `src/features/editor/`:

| Feature                   | Location                                    | Status                       |
| ------------------------- | ------------------------------------------- | ---------------------------- |
| **Unified Editor**        | `src/features/editor/`                      | ✅ Active                    |
| **Amendment Editor**      | `src/features/amendments/document-editor/`  | ✅ Migrated to unified hooks |
| **Blog Editor**           | `src/features/blogs/ui/BlogEditorView.tsx`  | ✅ Migrated to unified hooks |
| **Standalone Editor**     | `app/editor/[id]/page.tsx`                  | ✅ Uses unified EditorView   |
| **Group Document Editor** | `src/features/groups/ui/DocumentEditor.tsx` | ✅ Migrated to unified hooks |

### GUI Differences (Sind die GUIs aktuell anders?)

**Yes, the GUIs are currently different:**

| Feature             | Amendment                        | Blog                          | Standalone                    | Group      |
| ------------------- | -------------------------------- | ----------------------------- | ----------------------------- | ---------- |
| Mode Selector       | ✅ (edit/view/suggest/vote)      | ✅ (edit/view/suggest/vote)   | ❌                            | ❌         |
| Version Control     | ✅ (with search, edit titles)    | ✅ (with search, edit titles) | ✅ (basic)                    | ❌         |
| Collaborator Invite | ✅ (via CollaboratorsView)       | ✅ (via BlogBloggersManager)  | ✅ (InviteCollaboratorDialog) | ❌         |
| Online Presence     | ✅                               | ❌                            | ✅                            | ✅         |
| Share Button        | ✅                               | ✅                            | ❌                            | ❌         |
| Voting UI           | ✅                               | ❌                            | ❌                            | ❌         |
| Metadata Display    | Amendment code, date, supporters | Date, upvotes                 | Title only                    | Title only |
| Back Navigation     | → Amendment                      | → Blog                        | → Editor list                 | → Group    |

### Key Code Duplications

1. **Editor Hooks** - 4 separate implementations:

   - `src/features/amendments/document-editor/hooks/useDocumentEditor.ts`
   - `src/features/blogs/hooks/useBlogEditor.ts`
   - `src/features/groups/hooks/useDocumentEditor.ts`
   - `app/editor/[id]/page.tsx` (inline state management)

2. **Presence Hooks** - 2 implementations:

   - `src/features/amendments/document-editor/hooks/useDocumentPresence.ts`
   - `src/features/groups/hooks/useDocumentPresence.ts`

3. **Version Control Components** - 3 implementations:

   - `src/features/amendments/ui/VersionControl.tsx` (386 lines)
   - `src/features/blogs/ui/VersionControl.tsx` (380 lines)
   - `src/features/documents/ui/VersionControl.tsx` (269 lines)

4. **Version Utils** - 2 implementations:

   - `src/features/amendments/utils/version-utils.ts`
   - `src/features/blogs/utils/version-utils.ts`

5. **Mode Selector Components** - 2 implementations:

   - `src/features/amendments/ui/ModeSelector.tsx` (144 lines)
   - `src/features/blogs/ui/ModeSelector.tsx` (146 lines)

6. **Invite Dialogs** - 3 implementations:
   - `src/features/documents/ui/InviteCollaboratorDialog.tsx`
   - `src/features/amendments/collaborators/ui/InviteDialog.tsx`
   - `src/features/blogs/ui/BlogBloggersManager.tsx` (embedded invite logic)

---

## 1. Create Shared Editor Foundation

### 1.1 Create Unified Types

- [x] Create `src/features/editor/types/index.ts` with shared editor types
- [x] Define `EditorContext` type (amendment, blog, document, group-document)
- [x] Define `EditorMode` type ('edit' | 'view' | 'suggest' | 'vote')
- [x] Define `EditorCapabilities` interface (versioning, presence, voting, etc.)
- [x] Define `EditorUser` and `EditorPresence` types
- [x] Define `Discussion` and `Vote` types for suggestions

### 1.2 Create Unified Hooks

- [x] Create `src/features/editor/hooks/useEditor.ts` - main editor hook
  - Accept `entityType` ('amendment' | 'blog' | 'document' | 'groupDocument')
  - Accept `entityId` parameter
  - Handle content loading, saving, and real-time sync
  - Abstract away entity-specific queries
- [x] Create `src/features/editor/hooks/useEditorPresence.ts` - unified presence hook
  - Merge `amendments/document-editor/hooks/useDocumentPresence.ts`
  - Merge `groups/hooks/useDocumentPresence.ts`
- [x] Create `src/features/editor/hooks/useEditorUsers.ts` - build user maps for editor
  - Merge `amendments/document-editor/hooks/useEditorUsers.ts`
  - Support all entity types (owner, collaborators, bloggers)
- [x] Create `src/features/editor/hooks/useEditorVersion.ts` - version control hook
  - Abstract version creation/restoration logic

### 1.3 Create Unified Utils

- [x] Create `src/features/editor/utils/version-utils.ts`
  - Merge `amendments/utils/version-utils.ts`
  - Merge `blogs/utils/version-utils.ts`
  - Support multiple entity types via parameter
- [x] Create `src/features/editor/utils/editor-operations.ts`
  - Merge `amendments/document-editor/utils/document-operations.ts`
  - Extract common operations (save, restore, sync)
- [x] Create `src/features/editor/utils/entity-adapter.ts`
  - Adapter pattern to normalize different entity structures
  - Convert blogs/amendments/documents to common `EditorEntity` shape

---

## 2. Create Unified UI Components

### 2.1 Core Editor View

- [x] Create `src/features/editor/ui/EditorView.tsx` - main unified view
  - Accept `entityType` and `entityId` props
  - Conditionally render features based on `EditorCapabilities`
  - Use composition for entity-specific sections
- [x] Create `src/features/editor/ui/EditorHeader.tsx`
  - Title editing (inline, with save status)
  - Mode indicator
  - Online users display
  - Metadata badges (configurable per entity type)
- [x] Create `src/features/editor/ui/EditorToolbar.tsx`
  - Share button (optional)
  - Version control button (optional)
  - Mode selector (optional)
  - Back navigation (configurable target)

### 2.2 Unified Version Control

- [x] Create `src/features/editor/ui/VersionControl.tsx`
  - Merge 3 existing VersionControl implementations
  - Accept `entityType` and `entityId` props
  - Support both `documentId` and `blogId` queries
  - Include search and title editing features
  - Unified i18n keys under `features.editor.versionControl`
- [x] Create `src/features/editor/utils/version-queries.ts`
  - Factory for entity-specific version queries
  - Abstract `'document.id'` vs `'blog.id'` differences

### 2.3 Unified Mode Selector

- [x] Create `src/features/editor/ui/ModeSelector.tsx`
  - Merge 2 existing ModeSelector implementations
  - Accept `entityType` and `entityId` props
  - Use unified i18n keys under `features.editor.modeSelector`
  - Support different mode sets per entity type

### 2.4 Unified Invite Dialog

- [x] Create `src/features/editor/ui/InviteCollaboratorDialog.tsx`
  - Merge 3 existing invite implementations
  - Accept `entityType`, `entityId`, `roleType` props
  - Support different collaborator/blogger relationships
  - Unified notification helpers

### 2.5 Entity-Specific Metadata Components

- [x] Create `src/features/editor/ui/metadata/AmendmentMetadata.tsx`
  - Display amendment-specific info (code, date, supporters)
  - Collaborators list
- [x] Create `src/features/editor/ui/metadata/BlogMetadata.tsx`
  - Display blog-specific info (date, upvotes, visibility)
  - Bloggers list
- [x] Create `src/features/editor/ui/metadata/DocumentMetadata.tsx`
  - Display document-specific info
  - Collaborators list

---

## 3. Create i18n Unification

### 3.1 Create Unified Translation Keys

- [x] Create `src/i18n/locales/en/features/editor/index.ts`
  - Merge keys from `amendments.versionControl`, `blogs.versionControl`, `documents.versionControl`
  - Merge keys from `amendments.modeSelector`, `blogs.modeSelector`
  - Add shared editor strings
- [x] Create `src/i18n/locales/de/features/editor/index.ts`
  - German translations for all unified editor keys
- [x] Update `src/i18n/locales/en/features/index.ts` to include editor
- [x] Update `src/i18n/locales/de/features/index.ts` to include editor

---

## 4. Migrate Existing Editors

### 4.1 Migrate Amendment Editor

- [x] Update `src/features/amendments/document-editor/ui/DocumentEditorView.tsx`
  - Import from unified `@/features/editor`
  - Replace custom hooks with unified hooks
  - Use unified `VersionControl` component
  - Keep amendment-specific voting logic as extension
- [x] Create `app/amendment/[id]/text/page.unified.tsx` as migration example
- [x] Replace `app/amendment/[id]/text/page.tsx` with unified version
- [x] Deprecate `src/features/amendments/document-editor/hooks/` (added @deprecated JSDoc)
- [x] Keep `src/features/amendments/document-editor/utils/document-operations.ts` for voting-specific operations

### 4.2 Migrate Blog Editor

- [x] Update `src/features/blogs/ui/BlogEditorView.tsx`
  - Import from unified `@/features/editor`
  - Replace custom hooks with unified hooks
  - Use unified `VersionControl` component
  - Use unified `ModeSelector` component
- [x] Create `app/blog/[id]/editor/page.unified.tsx` as migration example
- [x] Replace `app/blog/[id]/editor/page.tsx` with unified version
- [x] Deprecate `src/features/blogs/hooks/useBlogEditor.ts` (added @deprecated JSDoc)
- [x] Deprecate `src/features/blogs/ui/VersionControl.tsx`
- [x] Deprecate `src/features/blogs/ui/ModeSelector.tsx`
- [x] Keep `src/features/blogs/utils/version-utils.ts` as thin wrapper (operations now in unified editor)

### 4.3 Migrate Standalone Editor

- [x] Create `app/editor/[id]/page.unified.tsx` as migration example
- [x] Replace `app/editor/[id]/page.tsx` with unified version
- [x] Update `app/editor/page.tsx` (document list) - not needed, uses EditorView

### 4.4 Migrate Group Document Editor

- [x] Update `src/features/groups/ui/DocumentEditor.tsx`
  - Import from unified `@/features/editor`
  - Replace custom hooks with unified hooks
- [x] Deprecate `src/features/groups/hooks/useDocumentEditor.ts` (added @deprecated JSDoc)
- [x] Deprecate `src/features/groups/hooks/useDocumentPresence.ts` (added @deprecated JSDoc)

---

## 5. Update Feature Indexes and Exports

### 5.1 Create Editor Feature Index

- [x] Create `src/features/editor/index.ts`
  - Export all unified components, hooks, utils, types
- [x] Create `src/features/editor/ui/index.ts`
- [x] Create `src/features/editor/hooks/index.ts`
- [x] Create `src/features/editor/utils/index.ts`
- [x] Create `src/features/editor/types/index.ts`

### 5.2 Update Existing Feature Indexes

- [x] Update `src/features/documents/index.ts`
  - Re-export from `@/features/editor` for backwards compatibility
  - Mark deprecated exports
- [x] Update `src/features/blogs/index.ts` - not needed, BlogEditorView uses unified
- [x] Update `src/features/amendments/index.ts` - not needed, DocumentEditorView uses unified

---

## 6. Cleanup and Documentation

### 6.1 Remove Deprecated Code

- [x] Remove or mark as deprecated:
  - `src/features/amendments/ui/VersionControl.tsx` ✅
  - `src/features/blogs/ui/VersionControl.tsx` ✅
  - `src/features/documents/ui/VersionControl.tsx` ✅
  - `src/features/amendments/ui/ModeSelector.tsx` ✅
  - `src/features/blogs/ui/ModeSelector.tsx` ✅
- [x] Update imports across the codebase to use unified components
- [x] Remove unused translation keys after migration - consolidated to features.editor

### 6.2 Documentation

- [x] Update `tasks/editor-unification-tasks.md` with progress
- [x] Update `copilot-instructions.md` with new editor structure
- [x] Add JSDoc comments to unified hooks and components
- [x] Create migration guide for future entity types

---

## Summary

| Phase                | Tasks | Status      |
| -------------------- | ----- | ----------- |
| 1. Shared Foundation | 13    | ✅ Complete |
| 2. Unified UI        | 11    | ✅ Complete |
| 3. i18n Unification  | 4     | ✅ Complete |
| 4. Migrate Editors   | 14    | ✅ Complete |
| 5. Feature Indexes   | 7     | ✅ Complete |
| 6. Cleanup           | 9     | ✅ Complete |

---

## Architecture Diagram

```
src/features/editor/
├── index.ts                         # Main exports
├── types/
│   └── index.ts                     # Shared types
├── hooks/
│   ├── index.ts
│   ├── useEditor.ts                 # Main editor hook (replaces 4 hooks)
│   ├── useEditorPresence.ts         # Presence hook (replaces 2 hooks)
│   ├── useEditorUsers.ts            # User map builder
│   └── useEditorVersion.ts          # Version control hook
├── utils/
│   ├── index.ts
│   ├── version-utils.ts             # Unified version utils
│   ├── editor-operations.ts         # Common operations
│   └── entity-adapter.ts            # Entity normalization
└── ui/
    ├── index.ts
    ├── EditorView.tsx               # Main unified view
    ├── EditorHeader.tsx             # Title, status, users
    ├── EditorToolbar.tsx            # Actions toolbar
    ├── VersionControl.tsx           # Unified version control
    ├── ModeSelector.tsx             # Unified mode selector
    ├── InviteCollaboratorDialog.tsx # Unified invite dialog
    └── metadata/
        ├── AmendmentMetadata.tsx
        ├── BlogMetadata.tsx
        └── DocumentMetadata.tsx
```

---

## Migration Guide

### Migrating to the Unified Editor

**Step 1: Update Imports**

```typescript
// Before (deprecated)
import { VersionControl } from '@/features/amendments/ui/VersionControl';
import { useBlogEditor } from '@/features/blogs/hooks/useBlogEditor';
import { useDocumentEditor } from '@/features/groups/hooks/useDocumentEditor';

// After (unified)
import { EditorView, useEditor, VersionControl, ModeSelector } from '@/features/editor';
```

**Step 2: Replace Editor Pages**

```tsx
// Before - complex inline state management
export default function EditorPage() {
  const [content, setContent] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  // ... 100+ lines of state management
}

// After - simple unified component
export default function EditorPage() {
  const { user } = db.useAuth();
  return <EditorView entityType="document" entityId={documentId} userId={user?.id} />;
}
```

**Step 3: Using the useEditor Hook Directly**

```tsx
import { useEditor } from '@/features/editor';

function CustomEditorView({ documentId }) {
  const {
    title,
    content,
    discussions,
    mode,
    setTitle,
    setContent,
    setDiscussions,
    setMode,
    saveStatus,
    isLoading,
    hasAccess,
  } = useEditor({
    entityType: 'document',
    entityId: documentId,
    userId: user?.id,
  });

  if (isLoading) return <Spinner />;
  if (!hasAccess) return <AccessDenied />;

  return (
    <PlateEditor
      value={content}
      onChange={setContent}
      discussions={discussions}
      onDiscussionsUpdate={setDiscussions}
    />
  );
}
```

**Entity Types:**

- `'amendment'` - Amendments with full workflow (suggest/vote modes)
- `'blog'` - Blog posts with public/private visibility
- `'document'` - Standalone documents with collaborators
- `'groupDocument'` - Group-scoped documents

---

## Notes

- **Backwards Compatibility**: Maintain existing imports via re-exports during migration
- **Feature Flags**: Consider using feature flags for gradual rollout
- **Testing**: Each migration step should include E2E test updates
- **Voting Logic**: Amendment-specific voting should remain in amendments feature, but use shared editor foundation
- **Performance**: Unified hooks should support tree-shaking to avoid loading unnecessary code

---

## Implementation Status

**✅ COMPLETE** - The editor unification has been implemented.

Key files created:

- `src/features/editor/` - New unified editor feature
- `src/features/editor/hooks/useEditor.ts` - Main unified hook
- `src/features/editor/ui/EditorView.tsx` - Main unified view
- Updated all 3 editor pages to use unified components
- Added deprecation notices to legacy code

Remaining optional enhancements:

- Update legacy `BlogEditorView.tsx` and `DocumentEditorView.tsx` to use unified hooks
- Create metadata components for entity-specific displays
- Create EditorToolbar component
