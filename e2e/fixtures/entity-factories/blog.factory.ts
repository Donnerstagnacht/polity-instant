/**
 * Blog Factory
 *
 * Creates blogs with bloggers and roles for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx } from '../admin-db';
import { DEFAULT_BLOG_ROLES } from '../../../db/rbac/constants';

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
    const now = new Date();

    const ownerRoleId = this.generateId();
    const writerRoleId = this.generateId();
    const txns: any[] = [];

    // Create blog entity
    txns.push(
      tx.blogs[blogId].update({
        title,
        description: overrides.description ?? `Test blog ${this._counter}`,
        date: now.toISOString(),
        isPublic: overrides.isPublic ?? true,
        visibility: overrides.visibility ?? 'public',
        likeCount: 0,
        commentCount: 0,
        content: overrides.content ?? [
          { type: 'h1', children: [{ text: title }] },
          { type: 'p', children: [{ text: 'Blog content for E2E testing.' }] },
        ],
        updatedAt: now,
      })
    );
    this.trackEntity('blogs', blogId);

    // Link to group if provided
    if (overrides.groupId) {
      txns.push(tx.blogs[blogId].link({ group: overrides.groupId }));
      this.trackLink('blogs', blogId, 'group', overrides.groupId);
    }

    // Create Owner role
    txns.push(
      tx.roles[ownerRoleId]
        .update({
          name: 'Owner',
          description: 'Full blog control',
          scope: 'blog',
          createdAt: now,
          updatedAt: now,
        })
        .link({ blog: blogId })
    );
    this.trackEntity('roles', ownerRoleId);
    this.trackLink('roles', ownerRoleId, 'blog', blogId);

    // Create Writer role
    txns.push(
      tx.roles[writerRoleId]
        .update({
          name: 'Writer',
          description: 'Can write and edit posts',
          scope: 'blog',
          createdAt: now,
          updatedAt: now,
        })
        .link({ blog: blogId })
    );
    this.trackEntity('roles', writerRoleId);
    this.trackLink('roles', writerRoleId, 'blog', blogId);

    // Create action rights for roles
    for (const roleDef of DEFAULT_BLOG_ROLES) {
      const roleId = roleDef.name === 'Owner' ? ownerRoleId : writerRoleId;
      for (const perm of roleDef.permissions) {
        const rightId = this.generateId();
        txns.push(
          tx.actionRights[rightId]
            .update({ resource: perm.resource, action: perm.action })
            .link({ roles: roleId, blog: blogId })
        );
        this.trackEntity('actionRights', rightId);
      }
    }

    // Create owner as blogger
    const bloggerId = this.generateId();
    txns.push(
      tx.blogBloggers[bloggerId]
        .update({ createdAt: now, visibility: 'public' })
        .link({ blog: blogId, user: ownerId, role: ownerRoleId })
    );
    this.trackEntity('blogBloggers', bloggerId);

    await adminTransact(txns);

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
    await adminTransact([
      tx.blogBloggers[bloggerId]
        .update({ createdAt: new Date(), visibility })
        .link({ blog: blogId, user: userId, role: roleId }),
    ]);
    this.trackEntity('blogBloggers', bloggerId);
    return bloggerId;
  }
}
