/**
 * Entity Adapter Utilities
 *
 * Adapts different entity structures (amendments, blogs, documents)
 * to a common EditorEntity shape for the unified editor.
 */

import type {
  EditorEntity,
  EditorEntityType,
  EditorEntityMetadata,
  EditorCollaborator,
  EditorUser,
  TDiscussion,
  EditorMode,
} from '../types';
import { DEFAULT_EDITOR_CONTENT } from '../types';

// Raw entity type for adapter function parameters.
// These receive untyped data from various Zero query shapes.
// Using `any` here at the system boundary is intentional to avoid
// duplicating Zero's complex inferred return types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawEntity = Record<string, any>;

/**
 * Ensures every element node in a Plate/Slate tree has a valid `children` array.
 * Prevents `Array.from(undefined)` crashes in Slate's rendering pipeline.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeContent(nodes: any[]): any[] {
  return nodes.map(node => {
    if (node == null || typeof node !== 'object') return node;
    // Text leaf — must have `text` property, no children
    if ('text' in node) return node;
    // Element node — must have children array
    const children = Array.isArray(node.children) && node.children.length > 0
      ? sanitizeContent(node.children)
      : [{ text: '' }];
    return { ...node, children };
  });
}

/**
 * Builds a display name from first_name / last_name / email fields.
 */
function buildUserName(user: RawEntity, fallback = 'Unknown'): string {
  const first = user.first_name?.trim() ?? '';
  const last = user.last_name?.trim() ?? '';
  const full = `${first} ${last}`.trim();
  return full || user.email || fallback;
}

/**
 * Maps an amendment's editing_mode value to an EditorMode.
 * Terminal states (passed/rejected) are shown as 'view' in the editor.
 */
function mapAmendmentEditingMode(mode: string | null | undefined): EditorMode {
  if (!mode) return 'suggest_internal';
  if (mode === 'passed' || mode === 'rejected') return 'view';
  const valid: EditorMode[] = ['edit', 'view', 'suggest_internal', 'suggest_event', 'vote_internal', 'vote_event'];
  return valid.includes(mode as EditorMode) ? (mode as EditorMode) : 'suggest_internal';
}

/**
 * Adapts an amendment with its document to EditorEntity
 */
export function adaptAmendmentToEntity(amendment: RawEntity | undefined | null, document: RawEntity | undefined | null): EditorEntity | null {
  if (!amendment || !document) return null;

  const owner: EditorUser | undefined = document.owner
    ? {
        id: document.owner.id,
        name: buildUserName(document.owner, 'Owner'),
        email: document.owner.email,
        avatarUrl: document.owner.avatar,
      }
    : undefined;

  const collaborators: EditorCollaborator[] = [];

  // Add document collaborators
  if (document.collaborators) {
    document.collaborators.forEach((collab: RawEntity) => {
      if (collab.user?.id) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: buildUserName(collab.user, 'Collaborator'),
            email: collab.user.email,
            avatarUrl: collab.user.avatar,
          },
          canEdit: collab.canEdit ?? true,
          status: 'collaborator',
        });
      }
    });
  }

  // Add amendment role collaborators
  if (amendment.amendmentRoleCollaborators) {
    amendment.amendmentRoleCollaborators.forEach((collab: RawEntity) => {
      if (collab.user?.id && !collaborators.some(c => c.user.id === collab.user.id)) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: buildUserName(collab.user, 'Collaborator'),
            email: collab.user.email,
            avatarUrl: collab.user.avatar,
          },
          role: collab.role?.name,
          canEdit: true,
          status: collab.status === 'admin' ? 'admin' : 'collaborator',
        });
      }
    });
  }

  const metadata: EditorEntityMetadata = {
    entityType: 'amendment',
    amendmentId: amendment.id,
    amendmentCode: amendment.code,
    amendmentDate: amendment.date,
    amendmentSupporters: amendment.supporters,
    amendmentEditingMode: amendment.editing_mode,
  };

  const content = Array.isArray(document.content) && document.content.length > 0
    ? sanitizeContent(document.content)
    : DEFAULT_EDITOR_CONTENT;

  return {
    id: document.id,
    title: document.title || amendment.title || '',
    content,
    discussions: (amendment.discussions || []) as TDiscussion[],
    editingMode: mapAmendmentEditingMode(amendment.editing_mode),
    visibility: document.visibility ?? 'public',
    updatedAt: document.updated_at || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts a blog to EditorEntity
 */
export function adaptBlogToEntity(blog: RawEntity | undefined | null): EditorEntity | null {
  if (!blog) return null;

  const collaborators: EditorCollaborator[] = [];

  // Add bloggers as collaborators (Zero relation name is 'bloggers')
  if (blog.bloggers) {
    blog.bloggers.forEach((blogger: RawEntity) => {
      if (blogger.user?.id) {
        collaborators.push({
          id: blogger.id,
          user: {
            id: blogger.user.id,
            name: buildUserName(blogger.user, 'Blogger'),
            email: blogger.user.email,
            avatarUrl: blogger.user.avatar,
          },
          role: blogger.role?.name,
          canEdit: true,
          status:
            blogger.status === 'owner'
              ? 'owner'
              : blogger.status === 'admin'
                ? 'admin'
                : 'collaborator',
        });
      }
    });
  }

  // Find owner from bloggers
  const ownerBlogger = blog.bloggers?.find((b: RawEntity) => b.status === 'owner');
  const owner: EditorUser | undefined = ownerBlogger?.user
    ? {
        id: ownerBlogger.user.id,
        name: buildUserName(ownerBlogger.user, 'Owner'),
        email: ownerBlogger.user.email,
        avatarUrl: ownerBlogger.user.avatar,
      }
    : undefined;

  const metadata: EditorEntityMetadata = {
    entityType: 'blog',
    blogId: blog.id,
    blogDate: blog.date,
    blogUpvotes: blog.upvotes,
    groupId: blog.group_id,
  };

  return {
    id: blog.id,
    title: blog.title || '',
    content: Array.isArray(blog.content) && blog.content.length > 0 ? sanitizeContent(blog.content) : DEFAULT_EDITOR_CONTENT,
    discussions: (blog.discussions || []) as TDiscussion[],
    editingMode: (blog.editing_mode as EditorMode) || 'edit',
    visibility: blog.visibility ?? 'public',
    updatedAt: blog.updated_at || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts a standalone document to EditorEntity
 */
export function adaptDocumentToEntity(document: RawEntity | undefined | null): EditorEntity | null {
  if (!document) return null;

  const owner: EditorUser | undefined = document.owner
    ? {
        id: document.owner.id,
        name: buildUserName(document.owner, 'Owner'),
        email: document.owner.email,
        avatarUrl: document.owner.avatar,
      }
    : undefined;

  const collaborators: EditorCollaborator[] = [];

  if (document.collaborators) {
    document.collaborators.forEach((collab: RawEntity) => {
      if (collab.user?.id) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: buildUserName(collab.user, 'Collaborator'),
            email: collab.user.email,
            avatarUrl: collab.user.avatar,
          },
          canEdit: collab.canEdit ?? true,
          status: 'collaborator',
        });
      }
    });
  }

  const metadata: EditorEntityMetadata = {
    entityType: 'document',
  };

  const content = Array.isArray(document.content) && document.content.length > 0
    ? sanitizeContent(document.content)
    : DEFAULT_EDITOR_CONTENT;

  return {
    id: document.id,
    title: document.title || '',
    content,
    discussions: (document.discussions || []) as TDiscussion[],
    editingMode: (document.editing_mode as EditorMode) || 'edit',
    visibility: document.visibility ?? 'public',
    updatedAt: document.updated_at || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts a group document to EditorEntity
 */
export function adaptGroupDocumentToEntity(
  document: RawEntity | undefined | null,
  groupId: string,
  groupName?: string
): EditorEntity | null {
  if (!document) return null;

  const owner: EditorUser | undefined = document.owner
    ? {
        id: document.owner.id,
        name: buildUserName(document.owner, 'Owner'),
        email: document.owner.email,
        avatarUrl: document.owner.avatar,
      }
    : undefined;

  const collaborators: EditorCollaborator[] = [];

  if (document.collaborators) {
    document.collaborators.forEach((collab: RawEntity) => {
      if (collab.user?.id) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: buildUserName(collab.user, 'Collaborator'),
            email: collab.user.email,
            avatarUrl: collab.user.avatar,
          },
          canEdit: collab.canEdit ?? true,
          status: 'collaborator',
        });
      }
    });
  }

  const metadata: EditorEntityMetadata = {
    entityType: 'groupDocument',
    groupId,
    groupName,
  };

  const content = Array.isArray(document.content) && document.content.length > 0
    ? sanitizeContent(document.content)
    : DEFAULT_EDITOR_CONTENT;

  return {
    id: document.id,
    title: document.title || '',
    content,
    discussions: (document.discussions || []) as TDiscussion[],
    editingMode: (document.editing_mode as EditorMode) || 'edit',
    visibility: document.visibility ?? 'public',
    updatedAt: document.updated_at || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts entities to EditorEntity based on type
 */
export function adaptToEditorEntity(
  entityType: EditorEntityType,
  data: RawEntity,
  options?: { groupId?: string; groupName?: string }
): EditorEntity | null {
  switch (entityType) {
    case 'amendment':
      return adaptAmendmentToEntity(data.amendment, data.document);
    case 'blog':
      return adaptBlogToEntity(data);
    case 'document':
      return adaptDocumentToEntity(data);
    case 'groupDocument':
      return adaptGroupDocumentToEntity(data, options?.groupId || '', options?.groupName);
    default:
      return null;
  }
}

/**
 * Builds a users map for the PlateEditor from an EditorEntity
 */
export function buildEditorUsersMap(
  entity: EditorEntity | null,
  currentUser?: EditorUser
): Record<string, { id: string; name: string; avatarUrl: string }> {
  const users: Record<string, { id: string; name: string; avatarUrl: string }> = {};

  // Add current user
  if (currentUser) {
    users[currentUser.id] = {
      id: currentUser.id,
      name: currentUser.name || 'Anonymous',
      avatarUrl:
        currentUser.avatarUrl || `https://api.dicebear.com/9.x/glass/svg?seed=${currentUser.id}`,
    };
  }

  if (!entity) return users;

  // Add owner
  if (entity.owner) {
    users[entity.owner.id] = {
      id: entity.owner.id,
      name: entity.owner.name || 'Owner',
      avatarUrl:
        entity.owner.avatarUrl || `https://api.dicebear.com/9.x/glass/svg?seed=${entity.owner.id}`,
    };
  }

  // Add collaborators
  entity.collaborators.forEach(collab => {
    if (collab.user?.id && !users[collab.user.id]) {
      users[collab.user.id] = {
        id: collab.user.id,
        name: collab.user.name || 'Collaborator',
        avatarUrl:
          collab.user.avatarUrl || `https://api.dicebear.com/9.x/glass/svg?seed=${collab.user.id}`,
      };
    }
  });

  return users;
}

/**
 * Checks if a user has access to an entity
 */
export function checkEntityAccess(entity: EditorEntity | null, userId?: string): boolean {
  if (!entity) return false;
  if (entity.visibility === 'public') return true;
  if (entity.visibility === 'authenticated' && !!userId) return true;
  if (!userId) return false;
  if (entity.owner?.id === userId) return true;
  return entity.collaborators.some(c => c.user.id === userId);
}

/**
 * Checks if a user is an owner or collaborator with edit rights
 */
export function checkIsOwnerOrCollaborator(entity: EditorEntity | null, userId?: string): boolean {
  if (!entity || !userId) return false;
  if (entity.owner?.id === userId) return true;
  return entity.collaborators.some(
    c => c.user.id === userId && (c.status === 'owner' || c.status === 'admin' || c.canEdit)
  );
}
