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

/**
 * Adapts an amendment with its document to EditorEntity
 */
export function adaptAmendmentToEntity(amendment: any, document: any): EditorEntity | null {
  if (!amendment || !document) return null;

  const owner: EditorUser | undefined = document.owner
    ? {
        id: document.owner.id,
        name: document.owner.name || document.owner.email || 'Owner',
        email: document.owner.email,
        avatarUrl: document.owner.avatar,
      }
    : undefined;

  const collaborators: EditorCollaborator[] = [];

  // Add document collaborators
  if (document.collaborators) {
    document.collaborators.forEach((collab: any) => {
      if (collab.user?.id) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: collab.user.name || collab.user.email || 'Collaborator',
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
    amendment.amendmentRoleCollaborators.forEach((collab: any) => {
      if (collab.user?.id && !collaborators.some(c => c.user.id === collab.user.id)) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: collab.user.name || collab.user.email || 'Collaborator',
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
    amendmentStatus: amendment.status,
  };

  return {
    id: document.id,
    title: document.title || amendment.title || '',
    content: document.content || [],
    discussions: (document.discussions || []) as TDiscussion[],
    editingMode: (document.editingMode as EditorMode) || 'suggest',
    isPublic: document.isPublic ?? false,
    updatedAt: document.updatedAt || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts a blog to EditorEntity
 */
export function adaptBlogToEntity(blog: any): EditorEntity | null {
  if (!blog) return null;

  const collaborators: EditorCollaborator[] = [];

  // Add bloggers as collaborators
  if (blog.blogRoleBloggers) {
    blog.blogRoleBloggers.forEach((blogger: any) => {
      if (blogger.user?.id) {
        collaborators.push({
          id: blogger.id,
          user: {
            id: blogger.user.id,
            name: blogger.user.name || blogger.user.email || 'Blogger',
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
  const ownerBlogger = blog.blogRoleBloggers?.find((b: any) => b.status === 'owner');
  const owner: EditorUser | undefined = ownerBlogger?.user
    ? {
        id: ownerBlogger.user.id,
        name: ownerBlogger.user.name || ownerBlogger.user.email || 'Owner',
        email: ownerBlogger.user.email,
        avatarUrl: ownerBlogger.user.avatar,
      }
    : undefined;

  const metadata: EditorEntityMetadata = {
    entityType: 'blog',
    blogId: blog.id,
    blogDate: blog.date,
    blogUpvotes: blog.upvotes,
  };

  return {
    id: blog.id,
    title: blog.title || '',
    content: blog.content || [],
    discussions: (blog.discussions || []) as TDiscussion[],
    editingMode: (blog.editingMode as EditorMode) || 'edit',
    isPublic: blog.isPublic ?? true,
    updatedAt: blog.updatedAt || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts a standalone document to EditorEntity
 */
export function adaptDocumentToEntity(document: any): EditorEntity | null {
  if (!document) return null;

  const owner: EditorUser | undefined = document.owner
    ? {
        id: document.owner.id,
        name: document.owner.name || document.owner.email || 'Owner',
        email: document.owner.email,
        avatarUrl: document.owner.avatar,
      }
    : undefined;

  const collaborators: EditorCollaborator[] = [];

  if (document.collaborators) {
    document.collaborators.forEach((collab: any) => {
      if (collab.user?.id) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: collab.user.name || collab.user.email || 'Collaborator',
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

  return {
    id: document.id,
    title: document.title || '',
    content: document.content || [],
    discussions: (document.discussions || []) as TDiscussion[],
    editingMode: (document.editingMode as EditorMode) || 'edit',
    isPublic: document.isPublic ?? false,
    updatedAt: document.updatedAt || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts a group document to EditorEntity
 */
export function adaptGroupDocumentToEntity(
  document: any,
  groupId: string,
  groupName?: string
): EditorEntity | null {
  if (!document) return null;

  const owner: EditorUser | undefined = document.owner
    ? {
        id: document.owner.id,
        name: document.owner.name || document.owner.email || 'Owner',
        email: document.owner.email,
        avatarUrl: document.owner.avatar,
      }
    : undefined;

  const collaborators: EditorCollaborator[] = [];

  if (document.collaborators) {
    document.collaborators.forEach((collab: any) => {
      if (collab.user?.id) {
        collaborators.push({
          id: collab.id,
          user: {
            id: collab.user.id,
            name: collab.user.name || collab.user.email || 'Collaborator',
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

  return {
    id: document.id,
    title: document.title || '',
    content: document.content || [],
    discussions: (document.discussions || []) as TDiscussion[],
    editingMode: (document.editingMode as EditorMode) || 'edit',
    isPublic: document.isPublic ?? false,
    updatedAt: document.updatedAt || Date.now(),
    owner,
    collaborators,
    metadata,
  };
}

/**
 * Adapts any entity to EditorEntity based on type
 */
export function adaptToEditorEntity(
  entityType: EditorEntityType,
  data: any,
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
  if (entity.isPublic) return true;
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
