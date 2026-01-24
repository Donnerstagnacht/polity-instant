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
} from './utils/entity-adapter';

export {
  createVersion,
  getLatestVersionNumber,
  restoreVersion,
  updateEntityContent,
  updateEntityTitle,
  updateEntityDiscussions,
  updateEntityMode,
} from './utils/version-utils';

export {
  buildVersionWhereClause,
  getVersionLinkName,
  getVersionEntityField,
  buildVersionsQuery,
  getMaxVersionNumber,
  sortVersionsDescending,
  filterVersions,
} from './utils/version-queries';

export {
  handleSuggestionAccepted,
  handleSuggestionDeclined,
  handleVoteOnSuggestion,
  generateUserColor,
} from './utils/editor-operations';
