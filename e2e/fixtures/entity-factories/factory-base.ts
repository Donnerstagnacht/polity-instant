/**
 * Factory Base Class
 *
 * Abstract base for all E2E entity factories.
 * Tracks created entities and links for automatic cleanup in test teardown.
 */

import { adminTransact, tx, id } from '../admin-db';

interface TrackedLink {
  entity: string;
  id: string;
  linkField: string;
  linkedId: string;
}

export abstract class FactoryBase {
  /** Map of table name → set of entity IDs created by this factory */
  protected _entities = new Map<string, Set<string>>();
  /** Links created by this factory, for unlinking during cleanup */
  protected _links: TrackedLink[] = [];

  /**
   * Register a created entity for cleanup.
   */
  protected trackEntity(table: string, entityId: string): void {
    if (!this._entities.has(table)) this._entities.set(table, new Set());
    this._entities.get(table)!.add(entityId);
  }

  /**
   * Register a link for cleanup.
   */
  protected trackLink(
    entity: string,
    entityId: string,
    linkField: string,
    linkedId: string
  ): void {
    this._links.push({ entity, id: entityId, linkField, linkedId });
  }

  /**
   * Generate a new UUID suitable for entity creation.
   */
  generateId(): string {
    return id();
  }

  /**
   * Delete all tracked entities and unlink all tracked links.
   * Called automatically by the Playwright fixture teardown.
   *
   * Order: unlink all links (reverse), then delete entities (reverse table order).
   */
  async cleanup(): Promise<void> {
    try {
      // 1. Unlink all tracked links (reverse order to undo last-created first)
      if (this._links.length > 0) {
        const unlinkTxns = [...this._links].reverse().map(l =>
          tx[l.entity][l.id].unlink({ [l.linkField]: l.linkedId })
        );
        await adminTransact(unlinkTxns).catch(() => {
          // Links may already be gone if parent entity was deleted; ignore
        });
      }

      // 2. Delete all tracked entities (reverse insertion order)
      const tables = [...this._entities.keys()].reverse();
      for (const table of tables) {
        const ids = [...this._entities.get(table)!];
        if (ids.length === 0) continue;
        const deleteTxns = ids.map(entityId => tx[table][entityId].delete());
        await adminTransact(deleteTxns).catch(() => {
          // Entity may already be deleted by cascading; ignore
        });
      }
    } finally {
      this._entities.clear();
      this._links = [];
    }
  }

  /**
   * Number of entities tracked for cleanup.
   */
  get trackedEntityCount(): number {
    let count = 0;
    for (const ids of this._entities.values()) count += ids.size;
    return count;
  }
}
