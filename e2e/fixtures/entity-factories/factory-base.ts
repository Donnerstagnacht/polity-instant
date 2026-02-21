/**
 * Factory Base Class
 *
 * Abstract base for all E2E entity factories.
 * Tracks created entities for automatic cleanup in test teardown.
 */

import { getAdminDb, generateId as genId } from '../admin-db';

export abstract class FactoryBase {
  /** Map of table name → set of entity IDs created by this factory */
  protected _entities = new Map<string, Set<string>>();

  /**
   * Register a created entity for cleanup.
   */
  protected trackEntity(table: string, entityId: string): void {
    if (!this._entities.has(table)) this._entities.set(table, new Set());
    this._entities.get(table)!.add(entityId);
  }

  /**
   * Generate a new UUID suitable for entity creation.
   */
  generateId(): string {
    return genId();
  }

  /**
   * Delete all tracked entities.
   * Called automatically by the Playwright fixture teardown.
   *
   * Deletes in reverse table insertion order (children before parents)
   * relying on CASCADE deletes for related records.
   */
  async cleanup(): Promise<void> {
    const db = getAdminDb();
    try {
      const tables = [...this._entities.keys()].reverse();
      for (const table of tables) {
        const ids = [...this._entities.get(table)!];
        if (ids.length === 0) continue;
        const batchSize = 20;
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          await db
            .from(table)
            .delete()
            .in('id', batch)
            .then(({ error }) => {
              if (error) {
                // Entity may already be deleted by cascading; ignore
              }
            });
        }
      }
    } finally {
      this._entities.clear();
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
