/**
 * Unified Editor Feature
 *
 * Provides a unified editor experience for amendments, blogs, documents, and group documents.
 */

// Types
export * from './types';

// Hooks
export { useEditor } from './hooks/useEditor';
export { useEditorPresence } from './hooks/useEditorPresence';
export { useEditorUsers } from './hooks/useEditorUsers';
export { useEditorVersion } from './hooks/useEditorVersion';

// UI Components
export { EditorView } from './ui/EditorView';
export { EditorHeader } from './ui/EditorHeader';
export { EditorToolbar } from './ui/EditorToolbar';
export { VersionControl } from './ui/VersionControl';
export { ModeSelector } from './ui/ModeSelector';
export { InviteCollaboratorDialog } from './ui/InviteCollaboratorDialog';

// Metadata Components
export { AmendmentMetadata } from './ui/metadata/AmendmentMetadata';
export { BlogMetadata } from './ui/metadata/BlogMetadata';
export { DocumentMetadata } from './ui/metadata/DocumentMetadata';

// Utilities
export {
  adaptAmendmentToEntity,
  adaptBlogToEntity,
  adaptDocumentToEntity,
  adaptGroupDocumentToEntity,
  adaptToEditorEntity,
  buildEditorUsersMap,
  checkEntityAccess,
  checkIsOwnerOrCollaborator,
} from './logic/entity-adapter';

// version-utils exports removed — module moved to hooks/useEditorVersion

export {
  buildVersionWhereClause,
  getVersionLinkName,
  getVersionEntityField,
  buildVersionsQuery,
  getMaxVersionNumber,
  sortVersionsDescending,
  filterVersions,
} from './logic/version-queries';

// editor-operations exports removed — module moved to hooks/useEditorOperations

export { generateUserColor } from './logic/editor-helpers';
