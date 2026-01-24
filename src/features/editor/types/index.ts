/**
 * Unified Editor Types
 *
 * Shared type definitions for the unified editor system.
 * Supports amendments, blogs, standalone documents, and group documents.
 */

// Import TDiscussion for internal use and re-export for external use
import type { TDiscussion as TDiscussionType } from '@/components/kit-platejs/discussion-kit';
export type { TDiscussion } from '@/components/kit-platejs/discussion-kit';

/**
 * The type of entity being edited
 */
export type EditorEntityType = 'amendment' | 'blog' | 'document' | 'groupDocument';

/**
 * Editor editing modes
 */
export type EditorMode = 'edit' | 'view' | 'suggest' | 'vote';

/**
 * Capabilities available for an editor instance
 */
export interface EditorCapabilities {
  /** Whether version control is available */
  versioning: boolean;
  /** Whether real-time presence is shown */
  presence: boolean;
  /** Whether voting on suggestions is available */
  voting: boolean;
  /** Whether mode selection is available */
  modeSelection: boolean;
  /** Whether sharing is available */
  sharing: boolean;
  /** Whether collaborator invites are available */
  invites: boolean;
  /** Whether the content is publicly viewable */
  publicAccess: boolean;
}

/**
 * Default capabilities by entity type
 */
export const DEFAULT_CAPABILITIES: Record<EditorEntityType, EditorCapabilities> = {
  amendment: {
    versioning: true,
    presence: true,
    voting: true,
    modeSelection: true,
    sharing: true,
    invites: true,
    publicAccess: false,
  },
  blog: {
    versioning: true,
    presence: false,
    voting: false,
    modeSelection: true,
    sharing: true,
    invites: true,
    publicAccess: true,
  },
  document: {
    versioning: true,
    presence: true,
    voting: false,
    modeSelection: false,
    sharing: false,
    invites: true,
    publicAccess: false,
  },
  groupDocument: {
    versioning: false,
    presence: true,
    voting: false,
    modeSelection: false,
    sharing: false,
    invites: false,
    publicAccess: false,
  },
};

/**
 * User representation in the editor
 */
export interface EditorUser {
  id: string;
  name: string;
  email?: string | null;
  avatarUrl?: string;
}

/**
 * Presence peer in a collaborative session
 */
export interface EditorPresencePeer {
  peerId: string;
  userId: string;
  name: string;
  avatar?: string;
  color: string;
}

/**
 * Vote on a suggestion
 */
export interface EditorVote {
  id: string;
  vote: 'accept' | 'reject' | 'abstain';
  voterId: string;
  voterName?: string;
}

/**
 * Discussion/suggestion in the editor
 * This extends the TDiscussion type from plate.js with additional fields
 */
export interface EditorDiscussion {
  id: string;
  crId?: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  description?: string;
  proposedChange?: string;
  justification?: string;
  createdAt: Date;
  status?: 'pending' | 'accepted' | 'rejected';
  votes?: EditorVote[];
  // Required TDiscussion fields
  comments: EditorComment[];
  isResolved: boolean;
  documentContent?: string;
  title?: string;
}

/**
 * Comment in a discussion
 */
export interface EditorComment {
  id: string;
  contentRich: any[];
  createdAt: Date;
  isEdited?: boolean;
  userId: string;
}

/**
 * Document version
 */
export interface EditorVersion {
  id: string;
  versionNumber: number;
  title: string;
  content: any[];
  createdAt: number | Date;
  creationType: VersionCreationType;
  creator?: EditorUser;
}

/**
 * Version creation type
 */
export type VersionCreationType =
  | 'manual'
  | 'suggestion_added'
  | 'suggestion_accepted'
  | 'suggestion_declined';

/**
 * Normalized entity data for the editor
 */
export interface EditorEntity {
  id: string;
  title: string;
  content: any[];
  discussions: TDiscussionType[];
  editingMode: EditorMode;
  isPublic: boolean;
  updatedAt: number;
  owner?: EditorUser;
  collaborators: EditorCollaborator[];
  /** Entity-specific metadata */
  metadata: EditorEntityMetadata;
}

/**
 * Collaborator in the editor
 */
export interface EditorCollaborator {
  id: string;
  user: EditorUser;
  role?: string;
  canEdit: boolean;
  status?: 'owner' | 'admin' | 'collaborator' | 'viewer';
}

/**
 * Entity-specific metadata
 */
export interface EditorEntityMetadata {
  entityType: EditorEntityType;
  /** Amendment-specific */
  amendmentId?: string;
  amendmentCode?: string;
  amendmentDate?: string;
  amendmentSupporters?: number;
  amendmentStatus?: string;
  /** Blog-specific */
  blogId?: string;
  blogDate?: string;
  blogUpvotes?: number;
  /** Group-specific */
  groupId?: string;
  groupName?: string;
}

/**
 * Editor context for hooks
 */
export interface EditorContext {
  entityType: EditorEntityType;
  entityId: string;
  userId?: string;
  capabilities: EditorCapabilities;
}

/**
 * Editor state returned by useEditor hook
 */
export interface EditorState {
  // Entity data
  entity: EditorEntity | null;
  isLoading: boolean;
  error: Error | null;

  // Editor state
  title: string;
  content: any[];
  discussions: TDiscussionType[];
  mode: EditorMode;

  // Save status
  saveStatus: 'saved' | 'saving' | 'error';
  hasUnsavedChanges: boolean;
  isSavingTitle: boolean;

  // Access
  hasAccess: boolean;
  isOwnerOrCollaborator: boolean;

  // Capabilities
  capabilities: EditorCapabilities;
}

/**
 * Editor actions returned by useEditor hook
 */
export interface EditorActions {
  setTitle: (title: string) => void;
  setContent: (content: any[]) => void;
  setDiscussions: (discussions: TDiscussionType[]) => void;
  setMode: (mode: EditorMode) => Promise<void>;
  restoreVersion: (content: any[]) => Promise<void>;
}

/**
 * Props for the unified EditorView component
 */
export interface EditorViewProps {
  entityType: EditorEntityType;
  entityId: string;
  userId?: string;
  userRecord?: {
    id: string;
    name?: string;
    email?: string | null;
    avatar?: string;
  };
  /** Override default capabilities */
  capabilities?: Partial<EditorCapabilities>;
  /** Back navigation URL */
  backUrl?: string;
  /** Back navigation label */
  backLabel?: string;
}

/**
 * Props for VersionControl component
 */
export interface VersionControlProps {
  entityType: EditorEntityType;
  entityId: string;
  /** Document ID for amendments/documents, blog ID for blogs */
  versionEntityId: string;
  currentContent: any[];
  currentUserId: string;
  onRestoreVersion: (content: any[]) => void;
  /** Amendment-specific props */
  amendmentId?: string;
  amendmentTitle?: string;
}

/**
 * Props for ModeSelector component
 */
export interface ModeSelectorProps {
  entityType: EditorEntityType;
  entityId: string;
  currentMode: EditorMode;
  isOwnerOrCollaborator: boolean;
  onModeChange?: (mode: EditorMode) => void;
}

/**
 * Props for InviteCollaboratorDialog component
 */
export interface InviteCollaboratorDialogProps {
  entityType: EditorEntityType;
  entityId: string;
  currentUserId: string;
  entityTitle?: string;
  existingCollaboratorIds?: string[];
}

/**
 * Default content for new documents
 */
export const DEFAULT_EDITOR_CONTENT = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

/**
 * Default content messages by entity type
 */
export const DEFAULT_CONTENT_MESSAGES: Record<EditorEntityType, string> = {
  amendment: 'Start typing the amendment text...',
  blog: 'Start writing your blog post...',
  document: 'Start typing...',
  groupDocument: 'Start typing...',
};
