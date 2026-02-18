/**
 * Amendment Factory
 *
 * Creates amendments with documents, collaborators, and change requests for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx } from '../admin-db';
import { DEFAULT_AMENDMENT_ROLES } from '../../../db/rbac/constants';

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
    const workflowStatus = overrides.workflowStatus ?? 'collaborative_editing';
    const now = new Date();

    const documentId = this.generateId();
    const authorRoleId = this.generateId();
    const collaboratorRoleId = this.generateId();
    const txns: any[] = [];

    // Map workflow status to editing mode
    const editingModeMap: Record<string, string> = {
      collaborative_editing: 'edit',
      internal_suggesting: 'suggest',
      internal_voting: 'vote',
      viewing: 'view',
      event_suggesting: 'suggest',
      event_voting: 'vote',
      passed: 'view',
      rejected: 'view',
    };

    // Create amendment entity
    const amendmentTx = tx.amendments[amendmentId].update({
      title,
      subtitle: overrides.subtitle ?? '',
      status: overrides.status ?? 'Under Review',
      workflowStatus,
      currentEventId: overrides.currentEventId,
      date: now.toISOString(),
      code: `AMN-E2E-${this._counter}`,
      visibility: overrides.visibility ?? 'public',
      supporters: 0,
      createdAt: now,
      updatedAt: now,
    });

    if (overrides.groupId) {
      txns.push(amendmentTx.link({ groups: overrides.groupId }));
      this.trackLink('amendments', amendmentId, 'groups', overrides.groupId);
    } else {
      txns.push(amendmentTx);
    }
    this.trackEntity('amendments', amendmentId);

    // Create document
    const documentContent = [
      { type: 'h1', children: [{ text: title }] },
      { type: 'p', children: [{ text: 'Amendment content for E2E testing.' }] },
    ];

    txns.push(
      tx.documents[documentId]
        .update({
          title,
          content: documentContent,
          editingMode: editingModeMap[workflowStatus] ?? 'edit',
          suggestionCounter: 0,
          isPublic: true,
          createdAt: now,
          updatedAt: now,
        })
        .link({ owner: ownerId })
    );
    this.trackEntity('documents', documentId);
    this.trackLink('documents', documentId, 'owner', ownerId);

    // Link document to amendment
    txns.push(tx.amendments[amendmentId].link({ document: documentId }));
    this.trackLink('amendments', amendmentId, 'document', documentId);

    // Create Author role
    txns.push(
      tx.roles[authorRoleId]
        .update({
          name: 'Author',
          description: 'Full amendment control',
          scope: 'amendment',
          createdAt: now,
          updatedAt: now,
        })
        .link({ amendment: amendmentId })
    );
    this.trackEntity('roles', authorRoleId);
    this.trackLink('roles', authorRoleId, 'amendment', amendmentId);

    // Create Collaborator role
    txns.push(
      tx.roles[collaboratorRoleId]
        .update({
          name: 'Collaborator',
          description: 'Can edit the amendment',
          scope: 'amendment',
          createdAt: now,
          updatedAt: now,
        })
        .link({ amendment: amendmentId })
    );
    this.trackEntity('roles', collaboratorRoleId);
    this.trackLink('roles', collaboratorRoleId, 'amendment', amendmentId);

    // Create action rights for roles
    for (const roleDef of DEFAULT_AMENDMENT_ROLES) {
      const roleId = roleDef.name === 'Author' ? authorRoleId : collaboratorRoleId;
      for (const perm of roleDef.permissions) {
        const rightId = this.generateId();
        txns.push(
          tx.actionRights[rightId]
            .update({ resource: perm.resource, action: perm.action })
            .link({ roles: roleId, amendment: amendmentId })
        );
        this.trackEntity('actionRights', rightId);
      }
    }

    // Create owner as Author collaborator
    const collaboratorId = this.generateId();
    txns.push(
      tx.amendmentCollaborators[collaboratorId]
        .update({
          status: 'admin',
          createdAt: now,
          visibility: 'public',
        })
        .link({ amendment: amendmentId, user: ownerId, role: authorRoleId })
    );
    this.trackEntity('amendmentCollaborators', collaboratorId);

    // Create amendment path
    const pathId = this.generateId();
    txns.push(
      tx.amendmentPaths[pathId]
        .update({ pathLength: 0, createdAt: now })
        .link({ amendment: amendmentId, user: ownerId })
    );
    this.trackEntity('amendmentPaths', pathId);

    await adminTransact(txns);

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
    await adminTransact([
      tx.amendmentCollaborators[collaboratorId]
        .update({ status, createdAt: new Date(), visibility: 'public' })
        .link({ amendment: amendmentId, user: userId, role: roleId }),
    ]);
    this.trackEntity('amendmentCollaborators', collaboratorId);
    return collaboratorId;
  }

  /**
   * Create a change request for an amendment.
   * Pass documentId to also create a document discussion entry so the CR appears in the Open tab.
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
    const now = new Date();
    const crTitle = overrides.title ?? 'E2E Change Request';
    const crDescription = overrides.description ?? 'Test change request';
    const crProposedChange = overrides.proposedChange ?? 'Proposed text change';
    const txns: any[] = [];

    txns.push(
      tx.changeRequests[changeRequestId]
        .update({
          title: crTitle,
          description: crDescription,
          proposedChange: crProposedChange,
          status: overrides.status ?? 'proposed',
          characterCount: crProposedChange.length,
          source: 'collaborator',
          requiresVoting: false,
          votingThreshold: 50,
          votingOrder: 0,
          createdAt: now,
          updatedAt: now,
        })
        .link({ amendment: amendmentId, creator: creatorId })
    );

    // If documentId provided, add discussion entry so the CR appears in the
    // ChangeRequestsView "Open" tab (which reads from document.discussions).
    if (overrides.documentId) {
      const discussionId = this.generateId();
      txns.push(
        tx.documents[overrides.documentId].update({
          discussions: [
            {
              id: discussionId,
              crId: crTitle,
              title: crTitle,
              description: crDescription,
              justification: '',
              createdAt: now.getTime(),
              userId: creatorId,
              comments: [],
            },
          ],
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
      );
    }

    await adminTransact(txns);
    this.trackEntity('changeRequests', changeRequestId);
    return changeRequestId;
  }
}
