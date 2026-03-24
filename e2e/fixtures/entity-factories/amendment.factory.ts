/**
 * Amendment Factory
 *
 * Creates amendments with documents, collaborators, and change requests for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminUpsert } from '../admin-db';
import { DEFAULT_AMENDMENT_ROLES } from '../../../src/zero/rbac/constants';

export interface CreateAmendmentOptions {
  id?: string;
  title?: string;
  subtitle?: string;
  status?: string;
  workflowStatus?: string;
  visibility?: string;
  groupId?: string;
  currentEventId?: string;
}

export interface CreatedAmendment {
  id: string;
  title: string;
  documentId: string;
  authorRoleId: string;
  collaboratorRoleId: string;
}

export class AmendmentFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create an amendment with a document, roles, action rights, and author collaborator.
   */
  async createAmendment(
    ownerId: string,
    overrides: CreateAmendmentOptions = {}
  ): Promise<CreatedAmendment> {
    this._counter++;
    const amendmentId = overrides.id ?? this.generateId();
    const title = overrides.title ?? `E2E Amendment ${this._counter}`;
    const workflowStatus = overrides.workflowStatus ?? 'edit';
    const now = new Date().toISOString();

    const documentId = this.generateId();
    const authorRoleId = this.generateId();
    const collaboratorRoleId = this.generateId();

    // Map editing mode to document editing mode
    const editingModeMap: Record<string, string> = {
      edit: 'edit',
      suggest_internal: 'suggest',
      vote_internal: 'vote',
      view: 'view',
      suggest_event: 'suggest',
      vote_event: 'vote',
      passed: 'view',
      rejected: 'view',
    };

    // Create amendment entity
    await adminUpsert('amendment', {
      id: amendmentId,
      title,
      editing_mode: workflowStatus,
      event_id: overrides.currentEventId ?? null,
      code: `AMN-E2E-${this._counter}`,
      visibility: overrides.visibility ?? 'public',
      is_public: true,
      supporters: 0,
      created_by_id: ownerId,
      group_id: overrides.groupId ?? null,
      created_at: now,
      updated_at: now,
    });
    this.trackEntity('amendment', amendmentId);

    // Create document
    const documentContent = [
      { type: 'h1', children: [{ text: title }] },
      { type: 'p', children: [{ text: 'Amendment content for E2E testing.' }] },
    ];

    await adminUpsert('document', {
      id: documentId,
      amendment_id: amendmentId,
      content: documentContent,
      editing_mode: editingModeMap[workflowStatus] ?? 'edit',
      created_at: now,
      updated_at: now,
    });
    this.trackEntity('document', documentId);

    // Create Author role
    await adminUpsert('role', {
      id: authorRoleId,
      name: 'Author',
      description: 'Full amendment control',
      scope: 'amendment',
      amendment_id: amendmentId,
      created_at: now,
    });
    this.trackEntity('role', authorRoleId);

    // Create Collaborator role
    await adminUpsert('role', {
      id: collaboratorRoleId,
      name: 'Collaborator',
      description: 'Can edit the amendment',
      scope: 'amendment',
      amendment_id: amendmentId,
      created_at: now,
    });
    this.trackEntity('role', collaboratorRoleId);

    // Create action rights for roles
    for (const roleDef of DEFAULT_AMENDMENT_ROLES) {
      const roleId = roleDef.name === 'Author' ? authorRoleId : collaboratorRoleId;
      const rights = roleDef.permissions.map(perm => {
        const rightId = this.generateId();
        this.trackEntity('action_right', rightId);
        return {
          id: rightId,
          resource: perm.resource,
          action: perm.action,
          role_id: roleId,
          amendment_id: amendmentId,
        };
      });
      await adminUpsert('action_right', rights);
    }

    // Create owner as Author collaborator
    const collaboratorId = this.generateId();
    await adminUpsert('amendment_collaborator', {
      id: collaboratorId,
      amendment_id: amendmentId,
      user_id: ownerId,
      role_id: authorRoleId,
      status: 'admin',
      visibility: 'public',
      created_at: now,
    });
    this.trackEntity('amendment_collaborator', collaboratorId);

    // Create amendment path
    const pathId = this.generateId();
    await adminUpsert('amendment_path', {
      id: pathId,
      amendment_id: amendmentId,
      created_at: now,
    });
    this.trackEntity('amendment_path', pathId);

    return { id: amendmentId, title, documentId, authorRoleId, collaboratorRoleId };
  }

  /**
   * Add a collaborator to an amendment.
   */
  async addCollaborator(
    amendmentId: string,
    userId: string,
    roleId: string,
    status = 'member'
  ): Promise<string> {
    const collaboratorId = this.generateId();
    await adminUpsert('amendment_collaborator', {
      id: collaboratorId,
      amendment_id: amendmentId,
      user_id: userId,
      role_id: roleId,
      status,
      visibility: 'public',
      created_at: new Date().toISOString(),
    });
    this.trackEntity('amendment_collaborator', collaboratorId);
    return collaboratorId;
  }

  /**
   * Create a change request for an amendment.
   * Pass documentId to also update the document with a discussion entry.
   */
  async createChangeRequest(
    amendmentId: string,
    creatorId: string,
    overrides: {
      id?: string;
      title?: string;
      description?: string;
      proposedChange?: string;
      status?: string;
      documentId?: string;
    } = {}
  ): Promise<string> {
    const changeRequestId = overrides.id ?? this.generateId();
    const now = new Date().toISOString();
    const crTitle = overrides.title ?? 'E2E Change Request';
    const crDescription = overrides.description ?? 'Test change request';
    const crProposedChange = overrides.proposedChange ?? 'Proposed text change';

    await adminUpsert('change_request', {
      id: changeRequestId,
      amendment_id: amendmentId,
      user_id: creatorId,
      title: crTitle,
      description: crDescription,
      status: overrides.status ?? 'proposed',
      created_at: now,
      updated_at: now,
    });

    // If documentId provided, update document with discussion entry
    if (overrides.documentId) {
      const db = (await import('../admin-db')).getAdminDb();
      const discussionId = this.generateId();
      await db
        .from('document')
        .update({
          content: [
            { type: 'h1', children: [{ text: 'Amendment Title' }] },
            {
              type: 'p',
              children: [
                { text: 'Amendment content for E2E testing. ' },
                {
                  text: crProposedChange,
                  [`suggestion_${discussionId}`]: { id: discussionId, type: 'insert' },
                },
              ],
            },
          ],
        })
        .eq('id', overrides.documentId);
    }

    this.trackEntity('change_request', changeRequestId);
    return changeRequestId;
  }
}
