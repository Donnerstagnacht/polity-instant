// Documents feature exports

/**
 * @deprecated Import from '@/features/editor' instead:
 * import { InviteCollaboratorDialog, VersionControl } from '@/features/editor';
 */
export { InviteCollaboratorDialog } from './ui/InviteCollaboratorDialog';

/** @deprecated Use VersionControl from '@/features/editor' instead */
export { VersionControl } from './ui/VersionControl';

/** @deprecated Use version-utils from '@/features/editor' instead */
export { createDocumentVersion, getLatestVersionNumber } from './utils/version-utils';
export type { VersionCreationType } from './utils/version-utils';

// Re-export unified editor components for new code
export {
  EditorView,
  useEditor,
  VersionControl as UnifiedVersionControl,
  InviteCollaboratorDialog as UnifiedInviteDialog,
} from '@/features/editor';
