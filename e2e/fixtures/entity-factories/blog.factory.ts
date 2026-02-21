/**
 * Blog Factory
 *
 * Creates blogs with bloggers and roles for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminUpsert } from '../admin-db';
import { DEFAULT_BLOG_ROLES } from '../../../src/zero/rbac/constants';

export interface CreateBlogOptions {
  id?: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  visibility?: string;
  groupId?: string;
  content?: any;
}

export interface CreatedBlog {
  id: string;
  title: string;
  ownerRoleId: string;
  writerRoleId: string;
}

export class BlogFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create a blog with Owner + Writer roles, action rights, and the owner as a blogger.
   */
  async createBlog(ownerId: string, overrides: CreateBlogOptions = {}): Promise<CreatedBlog> {
    this._counter++;
    const blogId = overrides.id ?? this.generateId();
    const title = overrides.title ?? `E2E Blog ${this._counter}`;
    const now = new Date().toISOString();

    const ownerRoleId = this.generateId();
    const writerRoleId = this.generateId();

    // Create blog entity
    await adminUpsert('blog', {
      id: blogId,
      title,
      description: overrides.description ?? `Test blog ${this._counter}`,
      date: now,
      is_public: overrides.isPublic ?? true,
      visibility: overrides.visibility ?? 'public',
      like_count: 0,
      comment_count: 0,
      content: overrides.content ?? [
        { type: 'h1', children: [{ text: title }] },
        { type: 'p', children: [{ text: 'Blog content for E2E testing.' }] },
      ],
      group_id: overrides.groupId ?? null,
      updated_at: now,
      created_at: now,
    });
    this.trackEntity('blog', blogId);

    // Create Owner role
    await adminUpsert('role', {
      id: ownerRoleId,
      name: 'Owner',
      description: 'Full blog control',
      scope: 'blog',
      blog_id: blogId,
      created_at: now,
    });
    this.trackEntity('role', ownerRoleId);

    // Create Writer role
    await adminUpsert('role', {
      id: writerRoleId,
      name: 'Writer',
      description: 'Can write and edit posts',
      scope: 'blog',
      blog_id: blogId,
      created_at: now,
    });
    this.trackEntity('role', writerRoleId);

    // Create action rights for roles
    for (const roleDef of DEFAULT_BLOG_ROLES) {
      const roleId = roleDef.name === 'Owner' ? ownerRoleId : writerRoleId;
      const rights = roleDef.permissions.map(perm => {
        const rightId = this.generateId();
        this.trackEntity('action_right', rightId);
        return {
          id: rightId,
          resource: perm.resource,
          action: perm.action,
          role_id: roleId,
          blog_id: blogId,
        };
      });
      await adminUpsert('action_right', rights);
    }

    // Create owner as blogger
    const bloggerId = this.generateId();
    await adminUpsert('blog_blogger', {
      id: bloggerId,
      blog_id: blogId,
      user_id: ownerId,
      role_id: ownerRoleId,
      visibility: 'public',
      created_at: now,
    });
    this.trackEntity('blog_blogger', bloggerId);

    return { id: blogId, title, ownerRoleId, writerRoleId };
  }

  /**
   * Add a blogger to an existing blog.
   */
  async addBlogger(
    blogId: string,
    userId: string,
    roleId: string,
    visibility: string = 'public'
  ): Promise<string> {
    const bloggerId = this.generateId();
    await adminUpsert('blog_blogger', {
      id: bloggerId,
      blog_id: blogId,
      user_id: userId,
      role_id: roleId,
      visibility,
      created_at: new Date().toISOString(),
    });
    this.trackEntity('blog_blogger', bloggerId);
    return bloggerId;
  }
}
